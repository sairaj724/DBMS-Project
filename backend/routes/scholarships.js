import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Get all scholarships
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('scholarships')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single scholarship by ID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('scholarships')
      .select('*')
      .eq('scholarship_id', req.params.id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, error: 'Scholarship not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new scholarship
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      min_cgpa,
      max_income,
      category,
      gender,
      hosteller,
      amount,
      deadline,
      is_active
    } = req.body;

    const { data, error } = await supabase
      .from('scholarships')
      .insert([{
        name,
        description,
        min_cgpa,
        max_income,
        category,
        gender,
        hosteller,
        amount,
        deadline,
        is_active: is_active ?? true
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update scholarship
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      description,
      min_cgpa,
      max_income,
      category,
      gender,
      hosteller,
      amount,
      deadline,
      is_active
    } = req.body;

    const { data, error } = await supabase
      .from('scholarships')
      .update({
        name,
        description,
        min_cgpa,
        max_income,
        category,
        gender,
        hosteller,
        amount,
        deadline,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('scholarship_id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, error: 'Scholarship not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete scholarship
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('scholarships')
      .delete()
      .eq('scholarship_id', req.params.id);

    if (error) throw error;

    res.json({ success: true, message: 'Scholarship deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
