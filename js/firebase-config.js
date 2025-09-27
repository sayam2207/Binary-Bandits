// Firebase configuration for frontend (using compat SDK)
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8OI1bi98ubmFR5bsSjN0Eb2JGCEj2-4A",
  authDomain: "car-tuinning.firebaseapp.com",
  projectId: "car-tuinning",
  storageBucket: "car-tuinning.firebasestorage.app",
  messagingSenderId: "1363321413",
  appId: "1:1363321413:web:eeee6552b836cff751792c",
  measurementId: "G-KN1BEYNDYJ"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize Firebase services
export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();

// Authentication functions
export const signInUser = async (email, password) => {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signUpUser = async (email, password, userData) => {
  try {
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
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signOutUser = async () => {
  try {
    await auth.signOut();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Firestore functions
export const saveProject = async (projectData) => {
  try {
    const docRef = await db.collection('projects').add({
      ...projectData,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserProjects = async (userId) => {
  try {
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
    return { success: false, error: error.message };
  }
};

export const updateProject = async (projectId, updateData) => {
  try {
    await db.collection('projects').doc(projectId).update({
      ...updateData,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteProject = async (projectId) => {
  try {
    await db.collection('projects').doc(projectId).delete();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Auth state listener
export const onAuthStateChange = (callback) => {
  return auth.onAuthStateChanged(callback);
};

// Storage functions
export const uploadImage = async (file, path) => {
  try {
    const storageRef = storage.ref(path);
    const snapshot = await storageRef.put(file);
    const downloadURL = await snapshot.ref.getDownloadURL();
    return { success: true, url: downloadURL };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
