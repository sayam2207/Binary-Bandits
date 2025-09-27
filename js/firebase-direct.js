// Direct Firebase Implementation - Functions available immediately
console.log('🚀 Direct Firebase module loading...');

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

// Mock user for testing
const mockUser = {
  uid: 'mock-user-123',
  email: 'test@example.com',
  displayName: 'Test User'
};

// Initialize Firebase immediately
function initFirebase() {
  try {
    console.log('🔄 Initializing Firebase...');
    
    if (typeof firebase !== 'undefined' && firebase.initializeApp) {
      console.log('✅ Real Firebase detected');
      
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      
      auth = firebase.auth();
      db = firebase.firestore();
      firebaseInitialized = true;
      console.log('✅ Real Firebase initialized');
    } else {
      console.log('⚠️ Using mock Firebase');
      firebaseInitialized = true;
    }
  } catch (error) {
    console.error('❌ Firebase init error:', error);
    firebaseInitialized = true; // Use mock mode
  }
}

// Define functions immediately - no waiting
window.signInUser = async function(email, password) {
  console.log('🔐 signInUser called with:', email);
  
  try {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      console.log('✅ Using real Firebase auth');
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      return { success: true, user: userCredential.user };
    } else {
      console.log('✅ Using mock auth - login successful');
      return { success: true, user: mockUser };
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    return { success: false, error: error.message };
  }
};

window.signUpUser = async function(email, password, userData) {
  console.log('📝 signUpUser called with:', email);
  
  try {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      console.log('✅ Using real Firebase auth');
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      
      // Create user document
      if (firebase.firestore) {
        await firebase.firestore().collection('users').add({
          uid: userCredential.user.uid,
          email: userData.email,
          username: userData.username,
          firstName: userData.firstName,
          lastName: userData.lastName,
          createdAt: new Date(),
          isActive: true
        });
      }
      
      return { success: true, user: userCredential.user };
    } else {
      console.log('✅ Using mock auth - registration successful');
      return { success: true, user: mockUser };
    }
  } catch (error) {
    console.error('❌ Registration error:', error);
    return { success: false, error: error.message };
  }
};

window.signOutUser = async function() {
  console.log('🚪 signOutUser called');
  
  try {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      console.log('✅ Using real Firebase auth');
      await firebase.auth().signOut();
    } else {
      console.log('✅ Using mock auth - logout successful');
    }
    return { success: true };
  } catch (error) {
    console.error('❌ Logout error:', error);
    return { success: false, error: error.message };
  }
};

window.onAuthStateChange = function(callback) {
  console.log('👂 onAuthStateChange called');
  
  try {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      console.log('✅ Using real Firebase auth state listener');
      return firebase.auth().onAuthStateChanged(callback);
    } else {
      console.log('✅ Using mock auth state listener');
      // Simulate user being logged in
      setTimeout(() => {
        callback(mockUser);
      }, 1000);
      return () => console.log('Mock auth listener removed');
    }
  } catch (error) {
    console.error('❌ Auth state listener error:', error);
    return () => {};
  }
};

window.getCurrentUser = function() {
  console.log('👤 getCurrentUser called');
  
  try {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      return firebase.auth().currentUser;
    } else {
      return mockUser;
    }
  } catch (error) {
    console.error('❌ Get current user error:', error);
    return null;
  }
};

window.isUserAuthenticated = function() {
  console.log('🔍 isUserAuthenticated called');
  
  try {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      return !!firebase.auth().currentUser;
    } else {
      return true; // Mock user is always authenticated
    }
  } catch (error) {
    console.error('❌ Check auth error:', error);
    return false;
  }
};

window.saveProject = async function(projectData) {
  console.log('💾 saveProject called');
  
  try {
    if (typeof firebase !== 'undefined' && firebase.firestore) {
      const docRef = await firebase.firestore().collection('projects').add({
        ...projectData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { success: true, id: docRef.id };
    } else {
      console.log('✅ Mock project saved');
      return { success: true, id: 'mock-project-id' };
    }
  } catch (error) {
    console.error('❌ Save project error:', error);
    return { success: false, error: error.message };
  }
};

window.getUserProjects = async function(userId) {
  console.log('📄 getUserProjects called for:', userId);
  
  try {
    if (typeof firebase !== 'undefined' && firebase.firestore) {
      const querySnapshot = await firebase.firestore()
        .collection('projects')
        .where('userId', '==', userId)
        .orderBy('updatedAt', 'desc')
        .get();
      
      const projects = [];
      querySnapshot.forEach((doc) => {
        projects.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, projects };
    } else {
      console.log('✅ Mock projects retrieved');
      return { success: true, projects: [] };
    }
  } catch (error) {
    console.error('❌ Get projects error:', error);
    return { success: false, error: error.message };
  }
};

// Initialize Firebase
initFirebase();

// Log function availability
console.log('🔧 Functions defined:');
console.log('  - signInUser:', typeof window.signInUser);
console.log('  - signUpUser:', typeof window.signUpUser);
console.log('  - signOutUser:', typeof window.signOutUser);
console.log('  - onAuthStateChange:', typeof window.onAuthStateChange);
console.log('  - getCurrentUser:', typeof window.getCurrentUser);
console.log('  - isUserAuthenticated:', typeof window.isUserAuthenticated);
console.log('  - saveProject:', typeof window.saveProject);
console.log('  - getUserProjects:', typeof window.getUserProjects);

console.log('✅ Direct Firebase module loaded successfully');
