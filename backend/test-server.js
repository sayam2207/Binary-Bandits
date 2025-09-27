const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Firebase Backend is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    firebaseProject: process.env.FIREBASE_PROJECT_ID
  });
});

// Test Firebase connection
app.get('/api/test-firebase', async (req, res) => {
  try {
    const { db } = require('./config/firebase');
    await db.collection('_health').doc('test').set({ 
      timestamp: new Date(),
      message: 'Firebase connection test' 
    });
    
    res.json({
      success: true,
      message: 'Firebase connection successful!',
      projectId: process.env.FIREBASE_PROJECT_ID
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Firebase connection failed',
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Firebase Backend Server running on port ${PORT}`);
  console.log(`🔥 Firebase Project: ${process.env.FIREBASE_PROJECT_ID}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Firebase test: http://localhost:${PORT}/api/test-firebase`);
});
