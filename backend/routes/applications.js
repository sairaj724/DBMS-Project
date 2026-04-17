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

    // Get all student profiles to map
    let studentProfiles;
    try {
      const { data, error } = await supabase
        .from('student_profile')
        .select('student_id, user_id, course, phone_no, users(name, email)');
      
      if (error) throw error;
      studentProfiles = data;
    } catch (err) {
      console.error('Error fetching student profiles:', err.message);
      studentProfiles = [];
    }

    // Create student profile map
    const studentMap = {};
    if (studentProfiles) {
      studentProfiles.forEach(s => {
        studentMap[s.student_id] = s;
      });
    }

    // Enrich applications with scholarship and student data
    const enrichedApps = applications.map(app => {
      const studentData = studentMap[app.student_id];
      return {
        ...app,
        scholarships: scholarshipMap[app.scholarship_id] || null,
        student_profile: {
          first_name: studentData?.users?.name?.split(' ')[0] || 'Student',
          last_name: studentData?.users?.name?.split(' ').slice(1).join(' ') || 'Unknown',
          name: studentData?.users?.name || 'Unknown',
          email: studentData?.users?.email || 'student@example.com',
          department: studentData?.course || 'N/A'
        }
      };
    });

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

    // Get student profile to find user_id for notification
    const { data: studentProfile, error: studentError } = await supabase
      .from('student_profile')
      .select('user_id')
      .eq('student_id', student_id)
      .single();

    if (studentError) {
      console.error('Error fetching student profile:', studentError.message);
    }

    // Get scholarship details for notification message
    const { data: scholarship, error: schError } = await supabase
      .from('scholarships')
      .select('name')
      .eq('scholarship_id', scholarship_id)
      .single();

    if (schError) {
      console.error('Error fetching scholarship:', schError.message);
    }

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

    // Create notification for student
    if (studentProfile?.user_id && scholarship?.name) {
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: studentProfile.user_id,
          scholarship_id: scholarship_id,
          message: `You have successfully applied for ${scholarship.name}. Your application is now under review.`,
          notification_type: 'application',
          read_status: false,
          created_at: new Date().toISOString()
        });

      if (notifError) {
        console.error('Error creating notification:', notifError.message);
      }
    }

    // Create notification for all admins
    try {
      // Get all admin users
      const { data: admins, error: adminError } = await supabase
        .from('users')
        .select('user_id')
        .eq('role', 'admin');

      if (adminError) {
        console.error('Error fetching admins:', adminError.message);
      } else if (admins && admins.length > 0 && scholarship?.name) {
        // Create notification for each admin
        const adminNotifications = admins.map(admin => ({
          user_id: admin.user_id,
          scholarship_id: scholarship_id,
          message: `New application received for ${scholarship.name}.`,
          notification_type: 'application',
          read_status: false,
          created_at: new Date().toISOString()
        }));

        const { error: adminNotifError } = await supabase
          .from('notifications')
          .insert(adminNotifications);

        if (adminNotifError) {
          console.error('Error creating admin notifications:', adminNotifError.message);
        }
      }
    } catch (notifError) {
      console.error('Error creating admin notifications:', notifError.message);
    }

    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update application status (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { status, admin_notes } = req.body;

    // Get the current application to find student_id
    const { data: currentApp, error: fetchError } = await supabase
      .from('applications')
      .select('student_id, scholarship_id, status')
      .eq('application_id', req.params.id)
      .single();

    if (fetchError) throw fetchError;

    // Get student profile to find user_id for notification
    const { data: studentProfile, error: studentError } = await supabase
      .from('student_profile')
      .select('user_id')
      .eq('student_id', currentApp.student_id)
      .single();

    if (studentError) throw studentError;

    // Get scholarship details for notification message
    const { data: scholarship, error: schError } = await supabase
      .from('scholarships')
      .select('name')
      .eq('scholarship_id', currentApp.scholarship_id)
      .single();

    if (schError) throw schError;

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

    // Create notification for student
    const statusMessage = status === 'approved' 
      ? `Congratulations! Your application for ${scholarship.name} has been approved.`
      : `Your application for ${scholarship.name} has been ${status}.`;

    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: studentProfile.user_id,
        scholarship_id: currentApp.scholarship_id,
        message: statusMessage,
        notification_type: 'application',
        read_status: false,
        created_at: new Date().toISOString()
      });

    if (notifError) {
      console.error('Error creating notification:', notifError.message);
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error updating application:', error);
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
