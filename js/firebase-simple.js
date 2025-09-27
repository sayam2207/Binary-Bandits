// Simple Firebase Authentication using CDN
// This approach uses the Firebase CDN directly

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

// Initialize Firebase
function initializeFirebase() {
  try {
    console.log('Initializing Firebase...');
    
    // Check if Firebase is available
    if (typeof firebase === 'undefined') {
      console.error('Firebase is not loaded. Please check your internet connection and try again.');
      return false;
    }
    
    // Initialize Firebase app
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
      console.log('Firebase app initialized');
    } else {
      console.log('Firebase app already initialized');
    }
    
    // Get Firebase services
    auth = firebase.auth();
    db = firebase.firestore();
    
    console.log('Firebase services initialized');
    console.log('Auth:', auth);
    console.log('DB:', db);
    
    return true;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return false;
  }
}

// Authentication functions
window.signInUser = async (email, password) => {
  try {
    if (!auth) {
      if (!initializeFirebase()) {
        throw new Error('Firebase not initialized');
      }
    }
    
    console.log('Attempting login for:', email);
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    console.log('Login successful:', userCredential.user.email);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
};

window.signUpUser = async (email, password, userData) => {
  try {
    if (!auth || !db) {
      if (!initializeFirebase()) {
        throw new Error('Firebase not initialized');
      }
    }
    
    console.log('Attempting registration for:', email);
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    
    // Create user document in Firestore
    await db.collection('users').add({
      uid: userCredential.user.uid,
      email: userData.email,
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      isActive: true
    });
    
    console.log('Registration successful:', userCredential.user.email);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: error.message };
  }
};

window.signOutUser = async () => {
  try {
    if (!auth) {
      if (!initializeFirebase()) {
        throw new Error('Firebase not initialized');
      }
    }
    
    await auth.signOut();
    console.log('Logout successful');
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
};

// Auth state listener
window.onAuthStateChange = (callback) => {
  if (!auth) {
    if (!initializeFirebase()) {
      console.error('Firebase not initialized for auth state listener');
      return;
    }
  }
  
  return auth.onAuthStateChanged(callback);
};

// Get current user
window.getCurrentUser = () => {
  if (!auth) {
    if (!initializeFirebase()) {
      return null;
    }
  }
  return auth.currentUser;
};

// Check if user is authenticated
window.isUserAuthenticated = () => {
  if (!auth) {
    if (!initializeFirebase()) {
      return false;
    }
  }
  return !!auth.currentUser;
};

// Firestore functions
window.saveProject = async (projectData) => {
  try {
    if (!db) {
      if (!initializeFirebase()) {
        throw new Error('Firebase not initialized');
      }
    }
    
    const docRef = await db.collection('projects').add({
      ...projectData,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Save project error:', error);
    return { success: false, error: error.message };
  }
};

window.getUserProjects = async (userId) => {
  try {
    if (!db) {
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
    console.error('Get projects error:', error);
    return { success: false, error: error.message };
  }
};

// Initialize Firebase when script loads
console.log('Firebase simple module loaded');
console.log('Firebase available:', typeof firebase !== 'undefined');

// Try to initialize immediately
if (typeof firebase !== 'undefined') {
  initializeFirebase();
} else {
  console.log('Firebase not yet available, will initialize when needed');
}
