// Homepage JavaScript (using global functions)
// Functions are now available globally from simple-auth.js

// DOM Elements
const userInfo = document.getElementById('userInfo');
const userName = document.getElementById('userName');
const userProfile = document.getElementById('userProfile');
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');

// Initialize authentication state
document.addEventListener('DOMContentLoaded', () => {
  // Wait for Firebase to be ready
  setTimeout(() => {
    if (typeof onAuthStateChange === 'function') {
      onAuthStateChange((user) => {
        if (user) {
          // User is signed in
          showUserInterface(user);
        } else {
          // User is signed out, redirect to login
          window.location.href = 'login.html';
        }
      });
    } else {
      console.error('onAuthStateChange function not available');
    }
  }, 1000);
});

// Show user interface when authenticated
function showUserInterface(user) {
  // Show user info in header
  if (userInfo && userName) {
    const displayName = user.displayName || user.email?.split('@')[0] || 'User';
    userName.textContent = displayName;
    userInfo.style.display = 'block';
  }
  
  // Show user profile in sidebar
  if (userProfile && profileName && profileEmail) {
    profileName.textContent = user.displayName || 'User Name';
    profileEmail.textContent = user.email || 'user@example.com';
    userProfile.style.display = 'block';
  }
  
  // Load user projects (for future use)
  loadUserProjects(user.uid);
}

// Load user projects
async function loadUserProjects(userId) {
  try {
    if (typeof getUserProjects !== 'function') {
      console.warn('getUserProjects function not available');
      return;
    }
    
    const result = await getUserProjects(userId);
    if (result.success) {
      console.log('User projects loaded:', result.projects);
      // Store projects for later use
      window.userProjects = result.projects;
    }
  } catch (error) {
    console.error('Error loading user projects:', error);
  }
}

// Handle logout
window.addEventListener('logout', async () => {
  try {
    if (typeof signOutUser !== 'function') {
      throw new Error('SignOutUser function not available');
    }
    
    const result = await signOutUser();
    if (result.success) {
      // Redirect will happen automatically via auth state listener
      console.log('User logged out successfully');
    } else {
      alert('Error logging out: ' + result.error);
    }
  } catch (error) {
    console.error('Logout error:', error);
    alert('An error occurred during logout: ' + error.message);
  }
});

// Enhanced sidebar functionality
function showUserInfo() {
  // Create a modal or redirect to profile page
  const modal = createModal('User Profile', `
    <div class="profile-modal">
      <div class="profile-avatar-large">
        <i class="fa fa-user fa-4x"></i>
      </div>
      <div class="profile-info">
        <h3>${profileName?.textContent || 'User Name'}</h3>
        <p>${profileEmail?.textContent || 'user@example.com'}</p>
        <div class="profile-stats">
          <div class="stat">
            <span class="stat-number">${window.userProjects?.length || 0}</span>
            <span class="stat-label">Projects</span>
          </div>
          <div class="stat">
            <span class="stat-number">0</span>
            <span class="stat-label">Likes</span>
          </div>
        </div>
      </div>
    </div>
  `);
  
  document.body.appendChild(modal);
  toggleSidebar();
}

function showProjects() {
  const projects = window.userProjects || [];
  
  let projectsHTML = '<div class="projects-grid">';
  
  if (projects.length === 0) {
    projectsHTML = '<div class="no-projects"><p>No projects yet. Start tuning your first car!</p></div>';
  } else {
    projects.forEach(project => {
      projectsHTML += `
        <div class="project-card">
          <div class="project-preview">
            <i class="fa fa-car fa-2x"></i>
          </div>
          <div class="project-info">
            <h4>${project.name || 'Untitled Project'}</h4>
            <p>${project.car || 'Unknown Car'}</p>
            <small>${new Date(project.updatedAt?.toDate?.() || project.updatedAt).toLocaleDateString()}</small>
          </div>
          <div class="project-actions">
            <button onclick="loadProject('${project.id}')" class="btn-load">Load</button>
            <button onclick="deleteProject('${project.id}')" class="btn-delete">Delete</button>
          </div>
        </div>
      `;
    });
  }
  
  projectsHTML += '</div>';
  
  const modal = createModal('My Projects', projectsHTML);
  document.body.appendChild(modal);
  toggleSidebar();
}

function showGallery() {
  const modal = createModal('Gallery', `
    <div class="gallery-content">
      <p>Community gallery coming soon! Share your tuned cars with the world.</p>
      <div class="gallery-placeholder">
        <i class="fa fa-images fa-4x"></i>
        <p>No images yet</p>
      </div>
    </div>
  `);
  
  document.body.appendChild(modal);
  toggleSidebar();
}

function showTutorial() {
  const modal = createModal('Tutorial', `
    <div class="tutorial-content">
      <h3>How to Use Car Tuning Garage</h3>
      <div class="tutorial-step">
        <h4>1. Select a Car</h4>
        <p>Choose from our collection of high-quality 3D car models.</p>
      </div>
      <div class="tutorial-step">
        <h4>2. Customize</h4>
        <p>Paint your car, change rims, and add performance modifications.</p>
      </div>
      <div class="tutorial-step">
        <h4>3. Save & Share</h4>
        <p>Save your projects and share them with the community.</p>
      </div>
    </div>
  `);
  
  document.body.appendChild(modal);
  toggleSidebar();
}

function showSettings() {
  const modal = createModal('Settings', `
    <div class="settings-content">
      <div class="setting-group">
        <h4>Display</h4>
        <label>
          <input type="checkbox" checked> Show custom cursor
        </label>
        <label>
          <input type="checkbox" checked> Auto-rotate 3D models
        </label>
      </div>
      <div class="setting-group">
        <h4>Audio</h4>
        <label>
          <input type="checkbox" checked> Enable sound effects
        </label>
      </div>
      <div class="setting-group">
        <h4>Privacy</h4>
        <label>
          <input type="checkbox"> Make projects public by default
        </label>
      </div>
    </div>
  `);
  
  document.body.appendChild(modal);
  toggleSidebar();
}

// Utility function to create modals
function createModal(title, content) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>${title}</h2>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
      </div>
      <div class="modal-body">
        ${content}
      </div>
    </div>
  `;
  
  // Add modal styles if not already added
  if (!document.getElementById('modal-styles')) {
    const styles = document.createElement('style');
    styles.id = 'modal-styles';
    styles.textContent = `
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
      }
      
      .modal-content {
        background: white;
        border-radius: 12px;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        animation: slideIn 0.3s ease;
      }
      
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #eee;
      }
      
      .modal-header h2 {
        margin: 0;
        color: #333;
      }
      
      .modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #999;
      }
      
      .modal-body {
        padding: 1.5rem;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideIn {
        from { transform: translateY(-20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      
      .projects-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
      }
      
      .project-card {
        border: 1px solid #eee;
        border-radius: 8px;
        padding: 1rem;
        text-align: center;
      }
      
      .project-preview {
        background: #f5f5f5;
        border-radius: 8px;
        padding: 2rem;
        margin-bottom: 1rem;
        color: #999;
      }
      
      .project-info h4 {
        margin: 0 0 0.5rem 0;
        color: #333;
      }
      
      .project-info p {
        margin: 0 0 0.5rem 0;
        color: #666;
        font-size: 0.9rem;
      }
      
      .project-info small {
        color: #999;
      }
      
      .project-actions {
        margin-top: 1rem;
        display: flex;
        gap: 0.5rem;
        justify-content: center;
      }
      
      .btn-load, .btn-delete {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
      }
      
      .btn-load {
        background: #007bff;
        color: white;
      }
      
      .btn-delete {
        background: #dc3545;
        color: white;
      }
      
      .no-projects {
        text-align: center;
        padding: 3rem;
        color: #666;
      }
      
      .gallery-placeholder {
        text-align: center;
        padding: 3rem;
        color: #999;
      }
      
      .tutorial-step {
        margin-bottom: 1.5rem;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
      }
      
      .tutorial-step h4 {
        margin: 0 0 0.5rem 0;
        color: #333;
      }
      
      .setting-group {
        margin-bottom: 1.5rem;
      }
      
      .setting-group h4 {
        margin: 0 0 1rem 0;
        color: #333;
      }
      
      .setting-group label {
        display: block;
        margin-bottom: 0.5rem;
        cursor: pointer;
      }
    `;
    document.head.appendChild(styles);
  }
  
  return modal;
}

// Project management functions
function loadProject(projectId) {
  // This would load the project data and redirect to tuning page
  console.log('Loading project:', projectId);
  alert('Loading project: ' + projectId);
}

function deleteProject(projectId) {
  if (confirm('Are you sure you want to delete this project?')) {
    // This would delete the project from Firestore
    console.log('Deleting project:', projectId);
    alert('Project deleted: ' + projectId);
  }
}

// Make functions globally available
window.showUserInfo = showUserInfo;
window.showProjects = showProjects;
window.showGallery = showGallery;
window.showTutorial = showTutorial;
window.showSettings = showSettings;
window.loadProject = loadProject;
window.deleteProject = deleteProject;
