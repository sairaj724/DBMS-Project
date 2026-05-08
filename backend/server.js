import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import scholarshipRoutes from './routes/scholarships.js';
import applicationRoutes from './routes/applications.js';
import notificationRoutes from './routes/notifications.js';
import documentRoutes from './routes/documents.js';
import studentRoutes from './routes/students.js';
import userRoutes from './routes/users.js';
import reportRoutes from './routes/reports.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
