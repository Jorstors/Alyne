import { requireAuth } from '../middleware/auth';
import { Router } from 'express';
import { supabaseAdmin } from '../supabase';

const router = Router();

// GET /api/teams - List teams for authenticated user
router.get('/', requireAuth, async (req, res) => {
  const user_id = req.user.id; // Expect user_id passed from frontend (which gets it from auth)

  if (!supabaseAdmin) return res.status(500).json({ error: 'Server misconfigured' });
  if (!user_id || typeof user_id !== 'string') return res.status(400).json({ error: 'Missing user_id' });

  try {
    // Get teams where user is a member
    // We need to fetch counts too. Supabase-js select with count:
    // select('*, team_members(count), events(count)') inside the joined resource is tricky.
    // Let's do it in two steps for simplicity and reliability or use a more complex query.
    //
    // Actually, we can just fetch all teams the user is in, and then for each team ID, fetch the counts.
    // Or fetch all data and map it (might be heavy if many users).
    //
    // Better approach:
    // 1. Fetch user's team memberships + team details
    const { data: userTeams, error } = await supabaseAdmin
      .from('team_members')
      .select(`
        team_id,
        role,
        teams:team_id (
          id,
          name,
          created_at
        )
      `)
      .eq('user_id', user_id);

    if (error) throw error;

    if (!userTeams || userTeams.length === 0) {
        return res.json([]);
    }

    const teamIds = userTeams.map((ut: any) => ut.team_id);

    // 2. Fetch member counts for these teams
    // "rpc" would be best, but let's just do a grouped query if possible or multiple queries.
    // Supabase JS doesn't support "count group by" easily in one line without rpc.
    // We'll iterate for now since a user won't be in 100s of teams usually.
    // Parallelize promises.

    const teamsWithCounts = await Promise.all(userTeams.map(async (t: any) => {
        const teamId = t.team_id;

        if (!supabaseAdmin) throw new Error('Supabase client is not initialized');

        // Count members
        const { count: memberCount } = await supabaseAdmin
            .from('team_members')
            .select('*', { count: 'exact', head: true })
            .eq('team_id', teamId);

        // Count events
        const { count: eventCount } = await supabaseAdmin
            .from('events')
            .select('*', { count: 'exact', head: true })
            .eq('team_id', teamId);

        return {
            ...t.teams,
            role: t.role,
            member_count: memberCount || 0,
            event_count: eventCount || 0
        };
    }));

    res.json(teamsWithCounts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/teams - Create a new team
router.post('/', requireAuth, async (req, res) => {
  const { name } = req.body;
  const user_id = req.user.id;

  if (!supabaseAdmin) return res.status(500).json({ error: 'Server misconfigured' });
  if (!user_id) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // 1. Create Team
    const { data: team, error: teamError } = await supabaseAdmin
      .from('teams')
      .insert([{ name }])
      .select()
      .single();

    if (teamError) throw teamError;

    // 2. Add Creator as Admin Member
    const { error: memberError } = await supabaseAdmin
      .from('team_members')
      .insert([{
        team_id: team.id,
        user_id,
        role: 'admin'
      }]);

    if (memberError) throw memberError;

    res.status(201).json(team);
  } catch (error: any) {
    console.error('Create Team Error:', error);
    res.status(400).json({ error: error.message });
  }
});

// GET /api/teams/:id - Get Team Details
router.get('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  if (!supabaseAdmin) return res.status(500).json({ error: 'Server configuration error' });

  try {
    // Fetch Team
    const { data: team, error: teamError } = await supabaseAdmin
        .from('teams')
        .select('*')
        .eq('id', id)
        .single();

    if (teamError || !team) return res.status(404).json({ error: 'Team not found' });

    // Fetch Members
    const { data: members, error: membersError } = await supabaseAdmin
        .from('team_members')
        .select(`
            role,
            user:user_id (
                id,
                name,
                email,
                avatar_url
            )
        `)
        .eq('team_id', id);

    // Fetch Recent Events
    const { data: events, error: eventsError } = await supabaseAdmin
        .from('events')
        .select('*')
        .eq('team_id', id)
        .order('created_at', { ascending: false });

    res.json({
        ...team,
        members: members?.map((m:any) => ({ ...m.user, role: m.role })) || [],
        events: events || []
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/teams/:id/join - Join a team
router.post('/:id/join', requireAuth, async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  if (!supabaseAdmin) return res.status(500).json({ error: 'Server misconfigured' });
  if (!user_id) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // Check if team exists
    const { data: team, error: teamError } = await supabaseAdmin
      .from('teams')
      .select('id')
      .eq('id', id)
      .single();

    if (teamError || !team) return res.status(404).json({ error: 'Team not found' });

    // Check if already a member
    const { data: existingMember } = await supabaseAdmin
      .from('team_members')
      .select('user_id')
      .eq('team_id', id)
      .eq('user_id', user_id)
      .maybeSingle(); // Ensure we don't throw if 0 rows

    if (existingMember) {
      return res.status(200).json({ message: 'You are already a member of this team' });
    }

    // Add to team
    const { error: joinError } = await supabaseAdmin
      .from('team_members')
      .insert([{
        team_id: id,
        user_id,
        role: 'member'
      }]);

    if (joinError) {
        // Handle race condition or unique constraint explicitly
        if (joinError.code === '23505') { // Postgres unique_violation
            return res.status(200).json({ message: 'You are already a member of this team' });
        }
        throw joinError;
    }

    res.json({ message: 'Joined team successfully' });
  } catch (error: any) {
    console.error('Join Team Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a team (admin only)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: 'Supabase not configured' });

    const { id } = req.params;
    const user_id = req.user.id;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    // Check if user is an admin of this team
    const { data: membership, error: memberError } = await supabaseAdmin
      .from('team_members')
      .select('role')
      .eq('team_id', id)
      .eq('user_id', user_id)
      .single();

    if (memberError || !membership) {
      return res.status(403).json({ error: 'You are not a member of this team' });
    }

    if (membership.role !== 'admin') {
      return res.status(403).json({ error: 'Only team admins can delete a team' });
    }

    // Delete team members first
    const { error: membersDeleteError } = await supabaseAdmin
      .from('team_members')
      .delete()
      .eq('team_id', id);

    if (membersDeleteError) throw membersDeleteError;

    // Unlink events from this team (set team_id to null instead of deleting events)
    await supabaseAdmin
      .from('events')
      .update({ team_id: null })
      .eq('team_id', id);

    // Delete the team
    const { error: teamDeleteError } = await supabaseAdmin
      .from('teams')
      .delete()
      .eq('id', id);

    if (teamDeleteError) throw teamDeleteError;

    res.json({ message: 'Team deleted successfully' });
  } catch (error: any) {
    console.error('Delete team error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Leave a team
router.delete('/:id/leave', requireAuth, async (req, res) => {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: 'Supabase not configured' });

    const { id } = req.params;
    const user_id = req.user.id;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    // Check if user is a member
    const { data: membership, error: memberError } = await supabaseAdmin
      .from('team_members')
      .select('*')
      .eq('team_id', id)
      .eq('user_id', user_id)
      .single();

    if (memberError || !membership) {
      return res.status(404).json({ error: 'You are not a member of this team' });
    }

    // If user is admin, check if there are other admins
    if (membership.role === 'admin') {
      const { data: admins } = await supabaseAdmin
        .from('team_members')
        .select('id')
        .eq('team_id', id)
        .eq('role', 'admin');

      if (!admins || admins.length <= 1) {
        return res.status(400).json({ error: 'Cannot leave: you are the only admin. Delete the team or transfer ownership first.' });
      }
    }

    // Remove the member
    const { error: deleteError } = await supabaseAdmin
      .from('team_members')
      .delete()
      .eq('team_id', id)
      .eq('user_id', user_id);

    if (deleteError) throw deleteError;

    res.json({ message: 'Successfully left the team' });
  } catch (error: any) {
    console.error('Leave team error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
