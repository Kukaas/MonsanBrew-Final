import express from 'express';
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { ENV } from './config/env.js';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.route.js';

const app = express();

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(express.json());

app.use(cors({
    origin: ENV.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/category', categoryRoutes);

app.listen(ENV.PORT, () => {
    console.log(`Server is running on port ${ENV.PORT}`);
});


export default app;
