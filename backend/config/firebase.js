const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const { getStorage } = require('firebase/storage');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Try to load service account key file first
    const serviceAccount = require('../serviceAccountKey.json');
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'car-tuinning.firebasestorage.app',
      databaseURL: process.env.FIREBASE_WEB_DATABASE_URL || 'https://car-tuinning.firebaseio.com'
    });
    
    console.log('✅ Firebase Admin SDK initialized with service account');
  } catch (error) {
    console.warn('⚠️ Service account key not found, trying environment variables...');
    
    // Fallback to environment variables
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
      };
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        databaseURL: process.env.FIREBASE_WEB_DATABASE_URL
      });
      
      console.log('✅ Firebase Admin SDK initialized with environment variables');
    } else {
      // Use default credentials (for development with Firebase emulator or local setup)
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'car-tuinning',
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'car-tuinning.firebasestorage.app',
        databaseURL: process.env.FIREBASE_WEB_DATABASE_URL || 'https://car-tuinning.firebaseio.com'
      });
      
      console.log('✅ Firebase Admin SDK initialized with default credentials');
    }
  }
}

// Initialize Firebase Web SDK (only if all required config is available)
let firebaseApp = null;
let webStorage = null;

if (process.env.FIREBASE_WEB_API_KEY && process.env.FIREBASE_WEB_AUTH_DOMAIN) {
  try {
    const firebaseConfig = {
      apiKey: process.env.FIREBASE_WEB_API_KEY,
      authDomain: process.env.FIREBASE_WEB_AUTH_DOMAIN,
      databaseURL: process.env.FIREBASE_WEB_DATABASE_URL || 'https://car-tuinning.firebaseio.com',
      projectId: process.env.FIREBASE_PROJECT_ID || 'car-tuinning',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'car-tuinning.firebasestorage.app',
      messagingSenderId: process.env.FIREBASE_WEB_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_WEB_APP_ID
    };

    firebaseApp = initializeApp(firebaseConfig);
    webStorage = getStorage(firebaseApp);
    console.log('✅ Firebase Web SDK initialized');
  } catch (error) {
    console.warn('⚠️ Firebase Web SDK initialization failed:', error.message);
  }
} else {
  console.warn('⚠️ Firebase Web SDK not initialized - missing environment variables');
}

// Get Firebase services
const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();
const webStorage = getStorage(firebaseApp);

// Firestore settings
db.settings({
  ignoreUndefinedProperties: true
});

// Export services
module.exports = {
  admin,
  db,
  auth,
  storage,
  webStorage,
  firebaseApp
};
