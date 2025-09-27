// Simple Firebase Authentication (using global Firebase)
// This file works with the Firebase compat SDK loaded in HTML

// Initialize Firebase when DOM is ready
let auth, db;

document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit for Firebase scripts to load
  setTimeout(() => {
    try {
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

      // Check if Firebase is available
      if (typeof firebase === 'undefined') {
        console.error('Firebase is not loaded. Make sure Firebase SDK scripts are included.');
        return;
      }

      // Initialize Firebase
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }

      auth = firebase.auth();
      db = firebase.firestore();
      
      console.log('Firebase initialized successfully');
      console.log('Auth object:', auth);
      console.log('DB object:', db);
    } catch (error) {
      console.error('Firebase initialization error:', error);
    }
  }, 1000);
});

// Authentication functions
window.signInUser = async (email, password) => {
  try {
    if (!auth) {
      throw new Error('Firebase not initialized yet');
    }
    
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
      throw new Error('Firebase not initialized yet');
    }
    
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
      throw new Error('Firebase not initialized yet');
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
    console.error('Firebase auth not initialized');
    return;
  }
  
  return auth.onAuthStateChanged(callback);
};

// Get current user
window.getCurrentUser = () => {
  return auth ? auth.currentUser : null;
};

// Check if user is authenticated
window.isUserAuthenticated = () => {
  return auth ? !!auth.currentUser : false;
};

// Firestore functions
window.saveProject = async (projectData) => {
  try {
    if (!db) {
      throw new Error('Firestore not initialized yet');
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
      throw new Error('Firestore not initialized yet');
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

// Fallback initialization if DOM is already loaded
if (document.readyState === 'loading') {
  // DOM is still loading, wait for DOMContentLoaded
  console.log('Waiting for DOM to load...');
} else {
  // DOM is already loaded, initialize immediately
  console.log('DOM already loaded, initializing Firebase...');
  setTimeout(() => {
    try {
      const firebaseConfig = {
        apiKey: "AIzaSyD8OI1bi98ubmFR5bsSjN0Eb2JGCEj2-4A",
        authDomain: "car-tuinning.firebaseapp.com",
        projectId: "car-tuinning",
        storageBucket: "car-tuinning.firebasestorage.app",
        messagingSenderId: "1363321413",
        appId: "1:1363321413:web:eeee6552b836cff751792c",
        measurementId: "G-KN1BEYNDYJ"
      };

      if (typeof firebase !== 'undefined') {
        if (!firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
        }
        auth = firebase.auth();
        db = firebase.firestore();
        console.log('Firebase initialized successfully (fallback)');
      } else {
        console.error('Firebase not available in fallback initialization');
      }
    } catch (error) {
      console.error('Firebase fallback initialization error:', error);
    }
  }, 500);
}

console.log('Simple auth module loaded');
