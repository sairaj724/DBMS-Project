import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Get all notifications for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        scholarships:scholarship_id (name)
      `)
      .eq('user_id', req.params.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get unread notifications count
router.get('/user/:userId/unread-count', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('notification_id', { count: 'exact' })
      .eq('user_id', req.params.userId)
      .eq('read_status', false);

    if (error) throw error;

    res.json({ success: true, count: data.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new notification
router.post('/', async (req, res) => {
  try {
    const { user_id, scholarship_id, message, notification_type } = req.body;

    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id,
        scholarship_id,
        message,
        notification_type: notification_type || 'general',
        read_status: false
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read_status: true })
      .eq('notification_id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark all notifications as read for a user
router.put('/user/:userId/read-all', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read_status: true })
      .eq('user_id', req.params.userId)
      .eq('read_status', false)
      .select();

    if (error) throw error;

    res.json({ success: true, message: 'All notifications marked as read', data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete notification
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('notification_id', req.params.id);

    if (error) throw error;

    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
