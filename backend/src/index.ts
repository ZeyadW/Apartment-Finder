import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { databaseManager } from './config/database';
import apartmentRoutes from './routes/apartments';
import authRoutes from './routes/auth';
import developerRoutes from './routes/developers';
import compoundRoutes from './routes/compounds';
import amenityRoutes from './routes/amenities';
import helmet from 'helmet';
import { errorHandler } from './middleware/error.middleware';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Connect to MongoDB
databaseManager.connect();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(helmet());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/apartments', apartmentRoutes);
app.use('/api/developers', developerRoutes);
app.use('/api/compounds', compoundRoutes);
app.use('/api/amenities', amenityRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler - catch all unmatched routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 