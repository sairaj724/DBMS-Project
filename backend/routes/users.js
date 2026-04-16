import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, email, password, and role are required' 
      });
    }

    // Insert into users table
    const { data, error } = await supabase
      .from('users')
      .insert([{
        name,
        email,
        passcode: password,
        role
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      });
    }

    // Find user by email
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

    // Check password (in production, use bcrypt to compare hashed passwords)
    if (data.passcode !== password) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

    // Return user without password
    const { passcode, ...userWithoutPassword } = data;
    res.json({ success: true, data: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', req.params.id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Return user without password
    const { passcode, ...userWithoutPassword } = data;
    res.json({ success: true, data: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
