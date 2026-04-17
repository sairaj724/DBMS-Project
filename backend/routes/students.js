import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Get all students
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('student_profile')
      .select(`
        *,
        users:user_id (name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform data to match frontend format
    const students = data.map(student => ({
      id: student.student_id || student.user_id,
      name: `${student.users?.name || ''}`.trim() || 'Unknown',
      department: student.course || 'N/A',
      year: student.year_of_study || 1,
      cgpa: student.cgpa || 0,
      email: student.users?.email || 'N/A',
      phone_number: student.phone_no || 'N/A',
      gender: student.gender || 'N/A',
      category: student.category,
      income: student.income
    }));

    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single student by ID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('student_profile')
      .select(`
        *,
        users:user_id (name, email)
      `)
      .eq('student_id', req.params.id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    const student = {
      id: data.student_id || data.user_id,
      name: `${data.users?.name || ''}`.trim() || 'Unknown',
      department: data.course || 'N/A',
      year: data.year_of_study || 1,
      cgpa: data.cgpa || 0,
      email: data.users?.email || 'N/A',
      phone_number: data.phone_no || 'N/A',
      gender: data.gender || 'N/A',
      category: data.category,
      income: data.income
    };

    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get student applications
router.get('/:id/applications', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        scholarships:scholarship_id (*)
      `)
      .eq('student_id', req.params.id)
      .order('applied_date', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get student profile by user_id
router.get('/user/:userId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('student_profile')
      .select(`
        *,
        users:user_id (name, email)
      `)
      .eq('user_id', req.params.userId)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, error: 'Student profile not found' });
    }

    const student = {
      id: data.student_id,
      user_id: data.user_id,
      name: data.users?.name || 'Unknown',
      course: data.course || '',
      year: data.year_of_study || 1,
      cgpa: data.cgpa || 0,
      email: data.users?.email || '',
      phone_no: data.phone_no || '',
      gender: data.gender || '',
      category: data.category || '',
      income: data.income || 0,
      hosteller: data.hosteller || false,
      created_at: data.created_at,
      updated_at: data.updated_at
    };

    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update student profile by user_id
router.put('/user/:userId', async (req, res) => {
  try {
    const { cgpa, income, category, gender, hosteller, course, phone_no, year_of_study } = req.body;

    const { data, error } = await supabase
      .from('student_profile')
      .update({
        cgpa,
        income,
        category,
        gender,
        hosteller,
        course,
        phone_no,
        year_of_study,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', req.params.userId)
      .select(`
        *,
        users:user_id (name, email)
      `)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, error: 'Student profile not found' });
    }

    const student = {
      id: data.student_id,
      user_id: data.user_id,
      name: data.users?.name || 'Unknown',
      course: data.course || '',
      year: data.year_of_study || 1,
      cgpa: data.cgpa || 0,
      email: data.users?.email || '',
      phone_no: data.phone_no || '',
      gender: data.gender || '',
      category: data.category || '',
      income: data.income || 0,
      hosteller: data.hosteller || false,
      updated_at: data.updated_at
    };

    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create student profile
router.post('/user/:userId', async (req, res) => {
  try {
    const { cgpa, income, category, gender, hosteller, course, phone_no, year_of_study } = req.body;

    const { data, error } = await supabase
      .from('student_profile')
      .insert({
        user_id: req.params.userId,
        cgpa,
        income,
        category,
        gender,
        hosteller,
        course,
        phone_no,
        year_of_study
      })
      .select(`
        *,
        users:user_id (name, email)
      `)
      .single();

    if (error) throw error;

    const student = {
      id: data.student_id,
      user_id: data.user_id,
      name: data.users?.name || 'Unknown',
      course: data.course || '',
      year: data.year_of_study || 1,
      cgpa: data.cgpa || 0,
      email: data.users?.email || '',
      phone_no: data.phone_no || '',
      gender: data.gender || '',
      category: data.category || '',
      income: data.income || 0,
      hosteller: data.hosteller || false,
      created_at: data.created_at,
      updated_at: data.updated_at
    };

    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
