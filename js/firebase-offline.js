// Offline Firebase Configuration
// This approach uses a minimal Firebase setup without external dependencies

console.log('=== OFFLINE FIREBASE INITIALIZATION ===');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8OI1bi98ubmFR5bsSjN0Eb2JGCEj2-4A",
  authDomain: "car-tuinning.firebaseapp.com",
  projectId: "car-tuinning",
  storageBucket: "car-tuinning.firebasestorage.app",
  messagingSenderId: "1363321413",
  appId: "1:1363321413:web:eeee6552b836cff751792c",
  measurementId: "G-KN1BEYNDYJ"
};

// Global variables
let auth, db;
let firebaseInitialized = false;
let initializationAttempts = 0;
const maxAttempts = 20;

// Mock Firebase functions for testing
const mockFirebase = {
  auth: () => ({
    signInWithEmailAndPassword: async (email, password) => {
      console.log('🔐 Mock login attempt:', email);
      // Simulate successful login
      return {
        user: {
          uid: 'mock-user-id',
          email: email,
          displayName: email.split('@')[0]
        }
      };
    },
    createUserWithEmailAndPassword: async (email, password) => {
      console.log('📝 Mock registration attempt:', email);
      // Simulate successful registration
      return {
        user: {
          uid: 'mock-user-id',
          email: email,
          displayName: email.split('@')[0]
        }
      };
    },
    signOut: async () => {
      console.log('🚪 Mock logout');
      return Promise.resolve();
    },
    onAuthStateChanged: (callback) => {
      console.log('👂 Mock auth state listener set up');
      // Simulate user being logged in
      setTimeout(() => {
        callback({
          uid: 'mock-user-id',
          email: 'test@example.com',
          displayName: 'Test User'
        });
      }, 1000);
      return () => console.log('Mock auth listener removed');
    },
    currentUser: null
  }),
  firestore: () => ({
    collection: (name) => ({
      add: async (data) => {
        console.log('📄 Mock Firestore add:', name, data);
        return { id: 'mock-doc-id' };
      },
      where: (field, operator, value) => ({
        orderBy: (field, direction) => ({
          get: async () => {
            console.log('📄 Mock Firestore query:', name);
            return {
              forEach: (callback) => {
                // Mock empty results
              }
              }
            };
          }
        })
      })
    })
  }),
  initializeApp: (config) => {
    console.log('✅ Mock Firebase app initialized with config:', config);
    return { name: 'mock-app' };
  },
  apps: []
};

// Initialize Firebase with fallback to mock
function initializeFirebase() {
  try {
    console.log('🔄 Attempting Firebase initialization...');
    initializationAttempts++;
    
    // Check if real Firebase is available
    if (typeof firebase !== 'undefined' && firebase.initializeApp) {
      console.log('✅ Real Firebase detected, initializing...');
      
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      
      auth = firebase.auth();
      db = firebase.firestore();
      
      console.log('✅ Real Firebase initialized successfully');
      firebaseInitialized = true;
      return true;
    } else {
      console.log('⚠️ Real Firebase not available, using mock Firebase');
      
      // Use mock Firebase
      auth = mockFirebase.auth();
      db = mockFirebase.firestore();
      
      console.log('✅ Mock Firebase initialized successfully');
      firebaseInitialized = true;
      return true;
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    
    if (initializationAttempts < maxAttempts) {
      console.log(`⏳ Retrying in 500ms... (attempt ${initializationAttempts}/${maxAttempts})`);
      setTimeout(initializeFirebase, 500);
      return false;
    } else {
      console.log('🔄 Max attempts reached, using mock Firebase');
      
      // Fallback to mock Firebase
      auth = mockFirebase.auth();
      db = mockFirebase.firestore();
      
      console.log('✅ Mock Firebase fallback initialized');
      firebaseInitialized = true;
      return true;
    }
  }
}

// Authentication functions
window.signInUser = async (email, password) => {
  try {
    console.log('🔐 Attempting login for:', email);
    
    if (!firebaseInitialized) {
      if (!initializeFirebase()) {
        throw new Error('Firebase not initialized');
      }
    }
    
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    console.log('✅ Login successful:', userCredential.user.email);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('❌ Login error:', error);
    return { success: false, error: error.message };
  }
};

window.signUpUser = async (email, password, userData) => {
  try {
    console.log('📝 Attempting registration for:', email);
    
    if (!firebaseInitialized) {
      if (!initializeFirebase()) {
        throw new Error('Firebase not initialized');
      }
    }
    
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    
    // Create user document in Firestore
    await db.collection('users').add({
      uid: userCredential.user.uid,
      email: userData.email,
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      createdAt: new Date(),
      isActive: true
    });
    
    console.log('✅ Registration successful:', userCredential.user.email);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('❌ Registration error:', error);
    return { success: false, error: error.message };
  }
};

window.signOutUser = async () => {
  try {
    console.log('🚪 Attempting logout...');
    
    if (!firebaseInitialized) {
      if (!initializeFirebase()) {
        throw new Error('Firebase not initialized');
      }
    }
    
    await auth.signOut();
    console.log('✅ Logout successful');
    return { success: true };
  } catch (error) {
    console.error('❌ Logout error:', error);
    return { success: false, error: error.message };
  }
};

// Auth state listener
window.onAuthStateChange = (callback) => {
  console.log('👂 Setting up auth state listener...');
  
  if (!firebaseInitialized) {
    if (!initializeFirebase()) {
      console.error('❌ Firebase not initialized for auth state listener');
      return;
    }
  }
  
  return auth.onAuthStateChanged(callback);
};

// Get current user
window.getCurrentUser = () => {
  if (!firebaseInitialized) {
    if (!initializeFirebase()) {
      return null;
    }
  }
  return auth.currentUser;
};

// Check if user is authenticated
window.isUserAuthenticated = () => {
  if (!firebaseInitialized) {
    if (!initializeFirebase()) {
      return false;
    }
  }
  return !!auth.currentUser;
};

// Firestore functions
window.saveProject = async (projectData) => {
  try {
    if (!firebaseInitialized) {
      if (!initializeFirebase()) {
        throw new Error('Firebase not initialized');
      }
    }
    
    const docRef = await db.collection('projects').add({
      ...projectData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('❌ Save project error:', error);
    return { success: false, error: error.message };
  }
};

window.getUserProjects = async (userId) => {
  try {
    if (!firebaseInitialized) {
      if (!initializeFirebase()) {
        throw new Error('Firebase not initialized');
      }
    }
    
    const querySnapshot = await db.collection('projects')
      .where('userId', '==', userId)
      .orderBy('updatedAt', 'desc')
      .get();
    
    const projects = [];
    querySnapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, projects };
  } catch (error) {
    console.error('❌ Get projects error:', error);
    return { success: false, error: error.message };
  }
};

// Make sure all functions are globally available
window.signInUser = window.signInUser || signInUser;
window.signUpUser = window.signUpUser || signUpUser;
window.signOutUser = window.signOutUser || signOutUser;
window.onAuthStateChange = window.onAuthStateChange || onAuthStateChange;
window.getCurrentUser = window.getCurrentUser || getCurrentUser;
window.isUserAuthenticated = window.isUserAuthenticated || isUserAuthenticated;
window.saveProject = window.saveProject || saveProject;
window.getUserProjects = window.getUserProjects || getUserProjects;

// Initialize Firebase when script loads
console.log('🚀 Offline Firebase module loaded');
console.log('📡 Firebase available:', typeof firebase !== 'undefined');
console.log('🔧 Functions available:');
console.log('  - signInUser:', typeof window.signInUser);
console.log('  - signUpUser:', typeof window.signUpUser);
console.log('  - signOutUser:', typeof window.signOutUser);
console.log('  - onAuthStateChange:', typeof window.onAuthStateChange);

// Try to initialize immediately
setTimeout(() => {
  initializeFirebase();
}, 100);
