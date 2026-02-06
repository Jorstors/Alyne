import { Router } from 'express';
import { supabaseAdmin } from '../app';

const router = Router();

// GET /api/events - List events for a user
router.get('/', async (req, res) => {
  const { user_id } = req.query;

  if (!supabaseAdmin) return res.status(500).json({ error: 'Server misconfigured' });
  if (!user_id || typeof user_id !== 'string') return res.status(400).json({ error: 'Missing user_id' });

  try {
    // Complex query: Get events where user is creator OR participant OR valid team member using Database function or raw SQL?
    // Supabase JS approach:
    // 1. Events created by user
    // 2. Events where user is a participant
    // This is easier to do with 2 queries and merge, or a more complex OR filter.

    // For MVP transparency: Fetch events created by user OR where user is in 'participants'
    // Actually, getting all events where 'created_by' = user_id is the base.
    // + events linked to teams the user is in.

    // Let's stick to: Events I created + Events I'm participating in.

    // 1. Created by me
    const { data: createdEvents } = await supabaseAdmin
        .from('events')
        .select('*')
        .eq('created_by', user_id);

    // 2. Participating in
    const { data: participations } = await supabaseAdmin
        .from('participants')
        .select('event_id')
        .eq('user_id', user_id);

    const participationIdx = (participations || []).map((p: any) => p.event_id);

    let participatedEvents: any[] = [];
    if (participationIdx.length > 0) {
        const { data: pEvents } = await supabaseAdmin
            .from('events')
            .select('*')
            .in('id', participationIdx);
        participatedEvents = pEvents || [];
    }

    // Merge and deduplicate
    const allEvents = [...(createdEvents || []), ...participatedEvents];
    const uniqueEvents = Array.from(new Map(allEvents.map(item => [item.id, item])).values());

    res.json(uniqueEvents);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/events/:id - Get event details + participants
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!supabaseAdmin) {
    res.status(500).json({ error: 'Server misconfigured' });
    return;
  }

  try {
    // Fetch Event
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (eventError || !event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    // Fetch Participants
    const { data: participants, error: partError } = await supabaseAdmin
      .from('participants')
      .select('*')
      .eq('event_id', id);

    res.json({
      ...event,
      participants: participants || []
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/events - Create a new event
router.post('/', async (req, res) => {
  const {
    title,
    description,
    timezone,
    event_type,
    configuration,
    user_id, // Authenticated user ID (optional)
    team_id  // Optional team linkage
  } = req.body;

  if (!supabaseAdmin) {
    res.status(500).json({ error: 'Server misconfigured' });
    return;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('events')
      .insert([
        {
          title,
          description,
          timezone,
          event_type, // 'specific_dates' or 'days_of_week'
          configuration, // JSON object
          created_by: user_id || null, // If null, it's an anonymous/guest event
          team_id: team_id || null
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error: any) {
    console.error('Create Event Error:', error);
    res.status(400).json({ error: error.message });
  }
});

// POST /api/events/:id/participate - Submit availability
router.post('/:id/participate', async (req, res) => {
  const { id } = req.params;
  const { name, email, availability, user_id } = req.body;

  if (!supabaseAdmin) {
    res.status(500).json({ error: 'Server misconfigured' });
    return;
  }

  try {
    // Check if participant already exists (by user_id or email within this event)
    let matchQuery = supabaseAdmin.from('participants').select('id').eq('event_id', id);

    if (user_id) {
       matchQuery = matchQuery.eq('user_id', user_id);
    } else if (email) {
       matchQuery = matchQuery.eq('email', email);
    } else {
       // If standard guest with just name, we might just insert new,
       // OR we could check name+event_id combination to update?
       // For now, let's assume we allow updates if name matches for simple guests
       matchQuery = matchQuery.eq('name', name);
    }

    const { data: existing } = await matchQuery.maybeSingle();

    let result;
    if (existing) {
        // Update
        result = await supabaseAdmin
            .from('participants')
            .update({ availability, name, email }) // Update name/email just in case
            .eq('id', existing.id)
            .select()
            .single();
    } else {
        // Insert
        result = await supabaseAdmin
            .from('participants')
            .insert([{
                event_id: id,
                user_id: user_id || null,
                name,
                email: email || null,
                availability
            }])
            .select()
            .single();
    }

    if (result.error) throw result.error;

    res.json(result.data);

  } catch (error: any) {
    console.error('Participate Error:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
