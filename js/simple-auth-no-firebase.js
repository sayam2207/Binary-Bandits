// Simple Authentication System - NO FIREBASE
// This completely eliminates Firebase and uses local storage

console.log('🚀 Simple Auth System Loading (No Firebase)...');

// User storage in localStorage
const USERS_KEY = 'tuning_app_users';
const CURRENT_USER_KEY = 'tuning_app_current_user';

// Initialize users storage
function initUsers() {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify([]));
  }
}

// Get all users
function getUsers() {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
}

// Save users
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Get current user
function getCurrentUser() {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
}

// Set current user
function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

// Generate user ID
function generateUserId() {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Initialize storage
initUsers();

// Authentication functions - NO FIREBASE
window.signInUser = async function(email, password) {
  console.log('🔐 Simple login attempt for:', email);
  
  try {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      // Remove password from user object
      const { password, ...userWithoutPassword } = user;
      setCurrentUser(userWithoutPassword);
      
      console.log('✅ Login successful:', user.email);
      return { success: true, user: userWithoutPassword };
    } else {
      console.log('❌ Login failed: Invalid credentials');
      return { success: false, error: 'Invalid email or password' };
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    return { success: false, error: error.message };
  }
};

window.signUpUser = async function(email, password, userData) {
  console.log('📝 Simple registration attempt for:', email);
  
  try {
    const users = getUsers();
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
      console.log('❌ Registration failed: User already exists');
      return { success: false, error: 'User with this email already exists' };
    }
    
    // Create new user
    const newUser = {
      uid: generateUserId(),
      email: email,
      password: password, // In real app, this would be hashed
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    
    // Add user to storage
    users.push(newUser);
    saveUsers(users);
    
    // Remove password from user object
    const { password: _, ...userWithoutPassword } = newUser;
    setCurrentUser(userWithoutPassword);
    
    console.log('✅ Registration successful:', newUser.email);
    return { success: true, user: userWithoutPassword };
  } catch (error) {
    console.error('❌ Registration error:', error);
    return { success: false, error: error.message };
  }
};

window.signOutUser = async function() {
  console.log('🚪 Simple logout');
  
  try {
    setCurrentUser(null);
    console.log('✅ Logout successful');
    return { success: true };
  } catch (error) {
    console.error('❌ Logout error:', error);
    return { success: false, error: error.message };
  }
};

window.onAuthStateChange = function(callback) {
  console.log('👂 Simple auth state listener set up');
  
  // Check current user immediately
  const currentUser = getCurrentUser();
  if (currentUser) {
    console.log('✅ User is logged in:', currentUser.email);
    callback(currentUser);
  } else {
    console.log('❌ No user logged in');
    callback(null);
  }
  
  // Set up a listener for storage changes (when user logs in/out)
  const handleStorageChange = (e) => {
    if (e.key === CURRENT_USER_KEY) {
      console.log('🔄 Auth state changed');
      const newUser = e.newValue ? JSON.parse(e.newValue) : null;
      callback(newUser);
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  
  // Return a function to unsubscribe (for compatibility)
  return function() {
    console.log('🔇 Auth state listener removed');
    window.removeEventListener('storage', handleStorageChange);
  };
};

window.getCurrentUser = function() {
  console.log('👤 Getting current user');
  return getCurrentUser();
};

window.isUserAuthenticated = function() {
  console.log('🔍 Checking authentication status');
  const user = getCurrentUser();
  return !!user;
};

// Project storage functions
const PROJECTS_KEY = 'tuning_app_projects';

function initProjects() {
  if (!localStorage.getItem(PROJECTS_KEY)) {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify([]));
  }
}

function getProjects() {
  const projects = localStorage.getItem(PROJECTS_KEY);
  return projects ? JSON.parse(projects) : [];
}

function saveProjects(projects) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

window.saveProject = async function(projectData) {
  console.log('💾 Simple project save');
  
  try {
    initProjects();
    const projects = getProjects();
    
    const newProject = {
      id: 'project_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    projects.push(newProject);
    saveProjects(projects);
    
    console.log('✅ Project saved:', newProject.id);
    return { success: true, id: newProject.id };
  } catch (error) {
    console.error('❌ Save project error:', error);
    return { success: false, error: error.message };
  }
};

window.getUserProjects = async function(userId) {
  console.log('📄 Simple get user projects for:', userId);
  
  try {
    initProjects();
    const projects = getProjects();
    const userProjects = projects.filter(p => p.userId === userId);
    
    console.log('✅ Retrieved projects:', userProjects.length);
    return { success: true, projects: userProjects };
  } catch (error) {
    console.error('❌ Get projects error:', error);
    return { success: false, error: error.message };
  }
};

// Initialize projects storage
initProjects();

// Log function availability
console.log('🔧 Simple Auth Functions Available:');
console.log('  - signInUser:', typeof window.signInUser);
console.log('  - signUpUser:', typeof window.signUpUser);
console.log('  - signOutUser:', typeof window.signOutUser);
console.log('  - onAuthStateChange:', typeof window.onAuthStateChange);
console.log('  - getCurrentUser:', typeof window.getCurrentUser);
console.log('  - isUserAuthenticated:', typeof window.isUserAuthenticated);
console.log('  - saveProject:', typeof window.saveProject);
console.log('  - getUserProjects:', typeof window.getUserProjects);

console.log('✅ Simple Auth System Loaded Successfully (NO FIREBASE)');
