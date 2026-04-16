import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Get all documents for an application
router.get('/application/:applicationId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('application_id', req.params.applicationId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single document by ID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('document_id', req.params.id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Upload document (create record)
router.post('/', async (req, res) => {
  try {
    const { application_id, document_type, file_url } = req.body;

    const { data, error } = await supabase
      .from('documents')
      .insert([{
        application_id,
        document_type,
        file_url
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update document
router.put('/:id', async (req, res) => {
  try {
    const { document_type, file_url } = req.body;

    const { data, error } = await supabase
      .from('documents')
      .update({
        document_type,
        file_url
      })
      .eq('document_id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete document
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('document_id', req.params.id);

    if (error) throw error;

    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
