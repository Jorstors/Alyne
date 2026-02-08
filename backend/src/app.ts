import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
// import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Supabase Admin Client (for backend-exclusive operations)
import { supabaseAdmin } from './supabase';

// Routes
import eventsRouter from './routes/events';
import teamsRouter from './routes/teams';

app.get('/', (req, res) => {
  res.json({ message: 'Alyne API is running!' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/events', eventsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/teams', teamsRouter);

// Debug Route to check what URL Vercel is seeing
app.all('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.path,
        originalUrl: req.originalUrl,
        method: req.method
    });
});

// Example: Admin route that client shouldn't do
app.post('/api/admin/system-check', async (req, res) => {
    // Only allow if we have the service key
    if (!supabaseAdmin) {
        res.status(500).json({ error: 'Server configuration error' });
        return;
    }

    // Example: List all users (something strictly admin)
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
        res.status(400).json({ error: error.message });
        return;
    }

    res.json({ users_count: data.users.length });
});

export default app;
