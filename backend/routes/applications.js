import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Get all applications (admin view) with student and scholarship details
router.get('/', async (req, res) => {
  try {
    // First get all applications
    const { data: applications, error: appError } = await supabase
      .from('applications')
      .select('*')
      .order('applied_date', { ascending: false });

    if (appError) throw appError;

    // Get all scholarships to map
    const { data: scholarships, error: schError } = await supabase
      .from('scholarships')
      .select('scholarship_id, name, amount, category');

    if (schError) console.error('Error fetching scholarships:', schError);

    // Create scholarship map
    const scholarshipMap = {};
    if (scholarships) {
      scholarships.forEach(s => {
        scholarshipMap[s.scholarship_id] = s;
      });
    }

    // Enrich applications with scholarship data
    const enrichedApps = applications.map(app => ({
      ...app,
      scholarships: scholarshipMap[app.scholarship_id] || null,
      student_profile: {
        first_name: 'Student',
        last_name: app.student_id?.slice(0, 8) || 'Unknown',
        email: 'student@example.com',
        department: 'N/A'
      }
    }));

    res.json({ success: true, data: enrichedApps });
  } catch (error) {
    console.error('Error in GET /applications:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get applications by student ID
router.get('/student/:studentId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        scholarships:scholarship_id (*)
      `)
      .eq('student_id', req.params.studentId)
      .order('applied_date', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single application by ID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        student_profile:student_id (*),
        scholarships:scholarship_id (*),
        documents:application_id (*)
      `)
      .eq('application_id', req.params.id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new application
router.post('/', async (req, res) => {
  try {
    const { student_id, scholarship_id, status, admin_notes } = req.body;

    const { data, error } = await supabase
      .from('applications')
      .insert([{
        student_id,
        scholarship_id,
        status: status || 'pending',
        admin_notes
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update application status (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { status, admin_notes } = req.body;

    const { data, error } = await supabase
      .from('applications')
      .update({
        status,
        admin_notes,
        updated_at: new Date().toISOString()
      })
      .eq('application_id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete application
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('application_id', req.params.id);

    if (error) throw error;

    res.json({ success: true, message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get application statistics for admin dashboard
router.get('/stats/summary', async (req, res) => {
  try {
    const { data: totalApps, error: totalError } = await supabase
      .from('applications')
      .select('application_id', { count: 'exact' });

    const { data: pendingApps, error: pendingError } = await supabase
      .from('applications')
      .select('application_id', { count: 'exact' })
      .eq('status', 'pending');

    const { data: approvedApps, error: approvedError } = await supabase
      .from('applications')
      .select('application_id', { count: 'exact' })
      .eq('status', 'approved');

    const { data: rejectedApps, error: rejectedError } = await supabase
      .from('applications')
      .select('application_id', { count: 'exact' })
      .eq('status', 'rejected');

    if (totalError || pendingError || approvedError || rejectedError) {
      throw new Error('Failed to fetch statistics');
    }

    res.json({
      success: true,
      data: {
        total: totalApps.length,
        pending: pendingApps.length,
        approved: approvedApps.length,
        rejected: rejectedApps.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test database connection
router.get('/test/db', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('count', { count: 'exact' });

    if (error) throw error;

    res.json({ success: true, message: 'Database connected', count: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
