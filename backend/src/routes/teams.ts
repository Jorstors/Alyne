import { Router } from 'express';
import { supabaseAdmin } from '../supabase';

const router = Router();

// GET /api/teams - List teams for authenticated user
router.get('/', async (req, res) => {
  const { user_id } = req.query; // Expect user_id passed from frontend (which gets it from auth)

  if (!supabaseAdmin) return res.status(500).json({ error: 'Server misconfigured' });
  if (!user_id || typeof user_id !== 'string') return res.status(400).json({ error: 'Missing user_id' });

  try {
    // Get teams where user is a member
    const { data: teams, error } = await supabaseAdmin
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

    // Transform response
    const result = teams.map((t: any) => ({
      ...t.teams,
      role: t.role
    }));

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/teams - Create a new team
router.post('/', async (req, res) => {
  const { name, user_id } = req.body;

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
router.get('/:id', async (req, res) => {
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
router.post('/:id/join', async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

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

export default router;
