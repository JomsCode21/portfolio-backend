import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import pushRoutes from './routes/pushRoutes.js';
import { resourceRoutes } from './routes/resourceRoutes.js';
import * as skillController from './controllers/resourceController.js';
import Skill from './models/Skill.js';
import Experience from './models/Experience.js';
import Education from './models/Education.js';
import Certification from './models/Certification.js';

const app = express();
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: process.env.CLIENT_URL?.split(',') || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: false,
  }),
);
app.use(
  rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }),
);
app.use(express.json({ limit: '200kb' }));
app.use(mongoSanitize());
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));
const make = skillController.makeResourceController;
app.get('/api/health', (req, res) =>
  res.json({ success: true, message: 'Portfolio API is running.' }),
);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/skills', resourceRoutes(make(Skill)));
app.use('/api/experience', resourceRoutes(make(Experience)));
app.use('/api/education', resourceRoutes(make(Education)));
app.use('/api/certifications', resourceRoutes(make(Certification)));
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/push', pushRoutes);
app.use(notFound);
app.use(errorHandler);
await connectDB();
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API listening on port ${port}`));
