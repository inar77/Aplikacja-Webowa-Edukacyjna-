// server.js - Produkcyjny backend z najlepszymi praktykami
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import { createClient } from 'redis';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// ==========================================
// SECURITY MIDDLEWARE
// ==========================================

// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Rate limiting
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Different rate limits for different endpoints
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 requests per window
  'Too many authentication attempts, please try again later'
);

const apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  'Too many requests, please try again later'
);

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB injection prevention
app.use(mongoSanitize());

// Compression
app.use(compression());

// ==========================================
// REDIS CACHE SETUP
// ==========================================

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) return new Error('Redis connection failed');
      return Math.min(retries * 100, 3000);
    }
  }
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Connected'));

await redisClient.connect();

// Cache middleware
const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') return next();
    
    const key = `cache:${req.originalUrl}`;
    
    try {
      const cached = await redisClient.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    } catch (err) {
      console.error('Cache error:', err);
    }
    
    // Store original send function
    const originalSend = res.json;
    
    // Override send function
    res.json = function(data) {
      // Cache the response
      redisClient.setex(key, duration, JSON.stringify(data))
        .catch(err => console.error('Cache set error:', err));
      
      // Call original send
      originalSend.call(this, data);
    };
    
    next();
  };
};

// ==========================================
// DATABASE MODELS WITH INDEXES
// ==========================================

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    index: true // Index for fast lookups
  },
  password: { 
    type: String, 
    required: true,
    minlength: 8
  },
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  avatar: String,
  role: {
    type: String,
    enum: ['user', 'mentor', 'admin'],
    default: 'user'
  },
  isActive: { 
    type: Boolean, 
    default: true,
    index: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  lastLoginAt: Date,
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for common queries
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for account lock
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to handle failed login attempts
userSchema.methods.incLoginAttempts = function() {
  // Reset attempts if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }
  
  return this.updateOne(updates);
};

const User = mongoose.model('User', userSchema);

// Progress Schema with optimizations
const progressSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    index: true
  },
  level: { 
    type: Number, 
    default: 1,
    min: 1,
    max: 100
  },
  xp: { 
    type: Number, 
    default: 0,
    min: 0
  },
  xpToNextLevel: { 
    type: Number, 
    default: 1000 
  },
  coins: { 
    type: Number, 
    default: 100,
    min: 0
  },
  gems: { 
    type: Number, 
    default: 5,
    min: 0
  },
  streak: { 
    type: Number, 
    default: 0,
    min: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastActivityDate: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  totalStudyTime: { 
    type: Number, 
    default: 0 // in minutes
  },
  completedLessons: [{
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
    completedAt: Date,
    score: Number,
    timeSpent: Number
  }],
  achievements: [{
    type: String,
    earnedAt: { type: Date, default: Date.now }
  }],
  currentPathId: { 
    type: String,
    index: true
  },
  statistics: {
    totalXpEarned: { type: Number, default: 0 },
    totalCoinsEarned: { type: Number, default: 0 },
    perfectLessons: { type: Number, default: 0 },
    dailyChallengesCompleted: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Compound indexes for leaderboard queries
progressSchema.index({ xp: -1, level: -1 });
progressSchema.index({ streak: -1 });
progressSchema.index({ userId: 1, currentPathId: 1 });

const Progress = mongoose.model('Progress', progressSchema);

// ==========================================
// JWT & AUTHENTICATION MIDDLEWARE
// ==========================================

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET,
    { 
      expiresIn: '15m',
      issuer: 'pathfinder-api',
      audience: 'pathfinder-client'
    }
  );
  
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { 
      expiresIn: '7d',
      issuer: 'pathfinder-api',
      audience: 'pathfinder-client'
    }
  );
  
  return { accessToken, refreshToken };
};

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'pathfinder-api',
      audience: 'pathfinder-client'
    });
    
    if (decoded.type !== 'access') {
      return res.status(401).json({ error: 'Invalid token type' });
    }
    
    const user = await User.findById(decoded.userId)
      .select('-password -emailVerificationToken -passwordResetToken');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }
    
    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// ==========================================
// VALIDATION MIDDLEWARE
// ==========================================

import Joi from 'joi';

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors 
      });
    }
    
    next();
  };
};

const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required()
      .messages({
        'string.pattern.base': 'Password must contain uppercase, lowercase and number'
      }),
    name: Joi.string().min(2).max(100).required()
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  
  updateProgress: Joi.object({
    xp: Joi.number().min(0).optional(),
    coins: Joi.number().min(0).optional(),
    streak: Joi.number().min(0).optional(),
    lessonId: Joi.string().optional()
  })
};

// ==========================================
// API ROUTES WITH PAGINATION
// ==========================================

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Auth routes with rate limiting
app.post('/api/auth/register', authLimiter, validate(schemas.register), async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    
    // Create user
    const user = new User({ email, password, name });
    await user.save();
    
    // Create initial progress
    const progress = new Progress({ userId: user._id });
    await progress.save();
    
    // Generate tokens
    const tokens = generateTokens(user._id);
    
    // Cache user data
    await redisClient.setex(
      `user:${user._id}`,
      3600,
      JSON.stringify(user.toObject())
    );
    
    res.status(201).json({
      message: 'Registration successful',
      tokens,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', authLimiter, validate(schemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user and check if locked
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (user.isLocked) {
      return res.status(423).json({ 
        error: 'Account temporarily locked due to multiple failed attempts' 
      });
    }
    
    // Verify password
    const isValid = await user.comparePassword(password);
    
    if (!isValid) {
      await user.incLoginAttempts();
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Reset login attempts and update last login
    await user.updateOne({
      $set: { lastLoginAt: Date.now() },
      $unset: { loginAttempts: 1, lockUntil: 1 }
    });
    
    // Generate tokens
    const tokens = generateTokens(user._id);
    
    res.json
