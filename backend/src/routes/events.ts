import { Router } from 'express';
import { supabaseAdmin } from '../app';

const router = Router();

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
