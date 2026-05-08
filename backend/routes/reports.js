import express from 'express';
import puppeteer from 'puppeteer';
import { supabase } from '../config/supabase.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read and encode logo to base64
const logoPath = join(__dirname, '../../src/assets/PHOTO-2026-05-08-00-55-18 Background Removed.png');
let logoBase64 = '';
try {
  const logoBuffer = readFileSync(logoPath);
  logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
} catch (err) {
  console.error('Error reading logo:', err.message);
}

const router = express.Router();

// Helper to get report data
async function getReportData(type, dateRange) {
  // Calculate date filter
  let dateFilter = null;
  const now = new Date();
  if (dateRange === 'month') {
    dateFilter = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
  } else if (dateRange === 'quarter') {
    dateFilter = new Date(now.setMonth(now.getMonth() - 3)).toISOString();
  }

  // Get applications with related data
  let appQuery = supabase
    .from('applications')
    .select('*, scholarships:scholarship_id(*), student_profile:student_id(student_roll_no, course, year_of_study, users:user_id(name, email))')
    .order('applied_date', { ascending: false });
  
  if (dateFilter) {
    appQuery = appQuery.gte('applied_date', dateFilter);
  }
  
  const { data: applications, error: appError } = await appQuery;
  if (appError) console.error('Applications fetch error:', appError);

  // Get scholarships
  const { data: scholarships, error: schError } = await supabase
    .from('scholarships')
    .select('*');
  if (schError) console.error('Scholarships fetch error:', schError);

  // Get students
  const { data: students, error: stuError } = await supabase
    .from('student_profile')
    .select('student_id, student_roll_no, course, year_of_study, users:user_id(name, email)');
  if (stuError) console.error('Students fetch error:', stuError);

  return { 
    applications: applications || [], 
    scholarships: scholarships || [], 
    students: students || [] 
  };
}

// Generate PDF report
router.post('/generate', async (req, res) => {
  const { type = 'summary', dateRange = 'all' } = req.body;
  let browser = null;
  
  try {
    console.log(`Generating ${type} report with date range: ${dateRange}`);
    const data = await getReportData(type, dateRange);
    
    // Launch puppeteer with system Chrome
    browser = await puppeteer.launch({ 
      headless: true,
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--font-render-hinting=none'
      ]
    });
    
    const page = await browser.newPage();
    
    // Create HTML content based on report type
    const htmlContent = generateHTMLTemplate(type, data, dateRange);
    
    // Set content
    await page.setContent(htmlContent, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Small delay to ensure rendering
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate PDF with buffer
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
      preferCSSPageSize: true
    });
    
    await browser.close();
    browser = null;
    
    // Send PDF with proper headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=scholarsphere-${type}-report-${new Date().toISOString().split('T')[0]}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(Buffer.from(pdfBuffer));
    
  } catch (error) {
    console.error('PDF generation error:', error);
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error('Error closing browser:', e);
      }
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

function generateHTMLTemplate(type, data, dateRange) {
  const { applications, scholarships, students } = data;
  const approved = applications.filter(a => a.status === 'approved');
  const pending = applications.filter(a => a.status === 'pending');
  const rejected = applications.filter(a => a.status === 'rejected');
  
  const periodText = dateRange === 'month' ? 'Last 30 Days' : dateRange === 'quarter' ? 'Last 90 Days' : 'All Time';
  
  // Helper to get student data from application
  const getStudentData = (app) => {
    const student = students.find(s => s.student_id === app.student_id);
    // Use student_roll_no from database schema
    const studentId = student?.student_roll_no || app.student_profile?.student_roll_no || 'N/A';
    return {
      id: studentId,
      name: app.student_profile?.users?.name || app.student_profile?.name || student?.users?.name || student?.name || 'Unknown',
      branch: student?.course || app.student_profile?.course || 'N/A',
      year: student?.year_of_study || app.student_profile?.year_of_study || 'N/A',
      scholarship: app.scholarships?.name || 'Unknown'
    };
  };
  
  // Generate table rows for each status
  const generateTableRows = (apps, startIndex = 1) => {
    return apps.map((app, index) => {
      const student = getStudentData(app);
      return `
        <tr>
          <td>${startIndex + index}</td>
          <td>${student.id}</td>
          <td>${student.name}</td>
          <td>${student.scholarship}</td>
          <td>${student.branch}</td>
          <td>${student.year}</td>
        </tr>
      `;
    }).join('') || '<tr><td colspan="6" style="text-align: center; padding: 20px;">No records found</td></tr>';
  };
  
  const approvedRows = generateTableRows(approved, 1);
  const pendingRows = generateTableRows(pending, 1);
  const rejectedRows = generateTableRows(rejected, 1);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page {
          size: A4;
          margin: 15mm;
        }
        
        * { 
          box-sizing: border-box; 
          margin: 0;
          padding: 0;
        }
        
        body { 
          font-family: 'Times New Roman', Times, serif;
          font-size: 12pt;
          line-height: 1.5;
          color: #000;
          background: white;
          padding: 20px;
        }
        
        /* VJTI Header */
        .vjti-header {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 20px;
          padding-bottom: 15px;
        }
        
        .vjti-logo {
          width: 80px;
          height: 80px;
          flex-shrink: 0;
        }
        
        .vjti-info {
          flex: 1;
        }
        
        .vjti-info h1 {
          font-size: 24pt;
          font-weight: bold;
          margin: 0;
          letter-spacing: 2px;
        }
        
        .vjti-info .hindi-name {
          font-size: 16pt;
          margin: 5px 0;
        }
        
        .vjti-info .english-name {
          font-size: 11pt;
          font-weight: bold;
          margin: 2px 0;
        }
        
        .vjti-info .address {
          font-size: 9pt;
          line-height: 1.4;
          margin-top: 5px;
        }
        
        /* Report Title */
        .report-title {
          text-align: center;
          font-size: 18pt;
          font-weight: bold;
          margin: 25px 0 15px 0;
          text-decoration: underline;
        }
        
        /* Description */
        .description {
          text-align: justify;
          font-size: 11pt;
          margin-bottom: 25px;
          line-height: 1.6;
        }
        
        /* Report Meta */
        .report-meta {
          font-size: 10pt;
          margin-bottom: 20px;
          padding: 10px;
          background: #f5f5f5;
          border-left: 3px solid #333;
        }
        
        /* Table Section */
        .table-section {
          margin-bottom: 30px;
        }
        
        .table-title {
          font-size: 12pt;
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 10px;
        }
        
        th, td {
          border: 1px solid #000;
          padding: 8px 6px;
          text-align: center;
          font-size: 10pt;
        }
        
        th {
          background-color: #f0f0f0;
          font-weight: bold;
        }
        
        tr:nth-child(even) {
          background-color: #fafafa;
        }
        
        /* Page break for long tables */
        .page-break {
          page-break-before: always;
        }
        
        /* Footer */
        .footer {
          margin-top: 40px;
          padding-top: 15px;
          border-top: 1px solid #ccc;
          font-size: 9pt;
          text-align: center;
          color: #666;
        }
      </style>
    </head>
    <body>
      <!-- VJTI Header -->
      <div class="vjti-header">
        <div class="vjti-logo">
          ${logoBase64 ? `<img src="${logoBase64}" alt="VJTI Logo" width="80" height="80" style="object-fit: contain;" />` : '<div style="width: 80px; height: 80px; border: 2px solid #000; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold;">VJTI</div>'}
        </div>
        <div class="vjti-info">
          <h1>VJTI MUMBAI</h1>
          <div class="hindi-name">वीरमाता जिजाबाई तंत्रज्ञान संस्था</div>
          <div class="english-name">Veeramata Jijabai Technological Institute</div>
          <div class="english-name">(Autonomous Institute of Govt. of Maharashtra)</div>
          <div class="address">
            H. R. Mahajani Road, Matunga(East), Mumbai - 400 019<br>
            Phone: +91 22 24198101/102 • Fax: +91 22 24102874 • www.vjti.ac.in
          </div>
        </div>
      </div>
      
      <!-- Report Title -->
      <div class="report-title">Scholarship Application Report</div>
      
      <!-- Description -->
      <div class="description">
        The current document contains the details about the students who has applied for scholarship. The document contains the list of students whose scholarship has been accepted, pending or being rejected.
      </div>
      
      <!-- Report Meta Info -->
      <div class="report-meta">
        <strong>Report Period:</strong> ${periodText} | <strong>Generated on:</strong> ${new Date().toLocaleDateString()}
      </div>
      
      <!-- Table 1: Accepted Students -->
      <div class="table-section">
        <div class="table-title">1. Students whose scholarship has been accepted.</div>
        <table>
          <thead>
            <tr>
              <th>Sr.No</th>
              <th>Student Id</th>
              <th>Student Name</th>
              <th>Scholarship Applied</th>
              <th>Branch</th>
              <th>Year</th>
            </tr>
          </thead>
          <tbody>
            ${approvedRows}
          </tbody>
        </table>
      </div>
      
      <!-- Table 2: Pending Students -->
      <div class="table-section">
        <div class="table-title">2. Students whose scholarship is pending.</div>
        <table>
          <thead>
            <tr>
              <th>Sr.No</th>
              <th>Student Id</th>
              <th>Student Name</th>
              <th>Scholarship Applied</th>
              <th>Branch</th>
              <th>Year</th>
            </tr>
          </thead>
          <tbody>
            ${pendingRows}
          </tbody>
        </table>
      </div>
      
      <!-- Table 3: Rejected Students -->
      <div class="table-section">
        <div class="table-title">3. Students whose scholarship has been rejected</div>
        <table>
          <thead>
            <tr>
              <th>Sr.No</th>
              <th>Student Id</th>
              <th>Student Name</th>
              <th>Scholarship Applied</th>
              <th>Branch</th>
              <th>Year</th>
            </tr>
          </thead>
          <tbody>
            ${rejectedRows}
          </tbody>
        </table>
      </div>
      
      <!-- Footer -->
      <div class="footer">
        This report was generated by ScholarSphere Scholarship Management System<br>
        © ${new Date().getFullYear()} VJTI | Page 1
      </div>
    </body>
    </html>
  `;
}

export default router;
