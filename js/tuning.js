// Tuning Page JavaScript Module
import { onAuthStateChange, saveProject, getUserProjects, updateProject } from './firebase-config.js';

// Global variables
let currentUser = null;
let currentProject = null;
let projectData = {
  name: '',
  car: '',
  customizations: {},
  performanceStats: {},
  images: [],
  tags: []
};

// Initialize authentication
onAuthStateChange((user) => {
  if (user) {
    currentUser = user;
    console.log('User authenticated:', user.email);
  } else {
    // Redirect to login if not authenticated
    window.location.href = 'login.html';
  }
});

// Initialize tuning page
document.addEventListener('DOMContentLoaded', () => {
  initializeTuningPage();
  setupEventListeners();
});

function initializeTuningPage() {
  // Get selected car from localStorage
  const selectedCar = localStorage.getItem('selectedCar');
  const selectedModel = localStorage.getItem('selectedModel');
  
  if (selectedCar && selectedModel) {
    projectData.car = selectedCar;
    projectData.name = `${selectedCar} Custom Build`;
    
    // Update UI to show current car
    updateCarInfo(selectedCar);
  } else {
    // No car selected, redirect to car selection
    window.location.href = 'car_selection.html';
  }
}

function setupEventListeners() {
  // Save project button
  const saveProjectBtn = document.getElementById('saveProject');
  if (saveProjectBtn) {
    saveProjectBtn.addEventListener('click', handleSaveProject);
  }
  
  // Load project button
  const loadProjectBtn = document.getElementById('loadProject');
  if (loadProjectBtn) {
    loadProjectBtn.addEventListener('click', handleLoadProject);
  }
  
  // Other tuning options
  const turboOption = document.getElementById('turboOption');
  if (turboOption) {
    turboOption.addEventListener('click', () => handleTuningOption('turbo'));
  }
  
  const ecuOption = document.getElementById('ecuOption');
  if (ecuOption) {
    ecuOption.addEventListener('click', () => handleTuningOption('ecu'));
  }
  
  const exhaustOption = document.getElementById('exhaustOption');
  if (exhaustOption) {
    exhaustOption.addEventListener('click', () => handleTuningOption('exhaust'));
  }
  
  const lightsOption = document.getElementById('lightsOption');
  if (lightsOption) {
    lightsOption.addEventListener('click', () => handleTuningOption('lights'));
  }
}

function updateCarInfo(carName) {
  // Update any UI elements that show the current car
  const carInfoElement = document.querySelector('.car-info');
  if (carInfoElement) {
    carInfoElement.textContent = `Tuning: ${carName}`;
  }
}

async function handleSaveProject() {
  if (!currentUser) {
    alert('Please log in to save projects');
    return;
  }
  
  // Collect current tuning data
  const tuningData = collectTuningData();
  
  // Prompt for project name
  const projectName = prompt('Enter project name:', projectData.name);
  if (!projectName) return;
  
  // Prepare project data
  const projectToSave = {
    userId: currentUser.uid,
    name: projectName,
    car: projectData.car,
    customizations: tuningData.customizations,
    performanceStats: tuningData.performanceStats,
    images: tuningData.images,
    tags: tuningData.tags,
    isPublic: false,
    isTemplate: false
  };
  
  try {
    const result = await saveProject(projectToSave);
    
    if (result.success) {
      currentProject = result.id;
      showNotification('Project saved successfully!', 'success');
      
      // Update project data
      projectData = { ...projectData, ...projectToSave };
    } else {
      showNotification('Failed to save project: ' + result.error, 'error');
    }
  } catch (error) {
    console.error('Error saving project:', error);
    showNotification('An error occurred while saving', 'error');
  }
}

async function handleLoadProject() {
  if (!currentUser) {
    alert('Please log in to load projects');
    return;
  }
  
  try {
    const result = await getUserProjects(currentUser.uid);
    
    if (result.success && result.projects.length > 0) {
      showProjectSelector(result.projects);
    } else {
      showNotification('No projects found', 'info');
    }
  } catch (error) {
    console.error('Error loading projects:', error);
    showNotification('Failed to load projects', 'error');
  }
}

function showProjectSelector(projects) {
  const modal = createModal('Load Project', `
    <div class="project-selector">
      <h3>Select a project to load:</h3>
      <div class="projects-list">
        ${projects.map(project => `
          <div class="project-item" onclick="loadSelectedProject('${project.id}', '${project.name}')">
            <div class="project-icon">
              <i class="fa fa-car"></i>
            </div>
            <div class="project-details">
              <h4>${project.name}</h4>
              <p>${project.car}</p>
              <small>${new Date(project.updatedAt?.toDate?.() || project.updatedAt).toLocaleDateString()}</small>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `);
  
  document.body.appendChild(modal);
}

function loadSelectedProject(projectId, projectName) {
  // This would load the project data and apply it to the current tuning
  console.log('Loading project:', projectId, projectName);
  showNotification(`Loading project: ${projectName}`, 'info');
  
  // Close modal
  const modal = document.querySelector('.modal-overlay');
  if (modal) modal.remove();
}

function handleTuningOption(option) {
  switch (option) {
    case 'turbo':
      applyTurboModification();
      break;
    case 'ecu':
      applyECUTune();
      break;
    case 'exhaust':
      applyExhaustModification();
      break;
    case 'lights':
      applyLightModification();
      break;
  }
}

function applyTurboModification() {
  // Simulate turbo modification
  const performanceGain = Math.floor(Math.random() * 50) + 20; // 20-70 HP gain
  
  if (!projectData.performanceStats.turbo) {
    projectData.performanceStats.turbo = {
      installed: true,
      powerGain: performanceGain,
      boost: 'High',
      brand: 'Garrett GT35R'
    };
    
    showNotification(`Turbo installed! +${performanceGain} HP`, 'success');
  } else {
    showNotification('Turbo already installed!', 'info');
  }
}

function applyECUTune() {
  // Simulate ECU tune
  const powerGain = Math.floor(Math.random() * 30) + 10; // 10-40 HP gain
  
  if (!projectData.performanceStats.ecu) {
    projectData.performanceStats.ecu = {
      tuned: true,
      powerGain: powerGain,
      torqueGain: powerGain * 0.8,
      fuelEfficiency: 'Improved'
    };
    
    showNotification(`ECU tuned! +${powerGain} HP`, 'success');
  } else {
    showNotification('ECU already tuned!', 'info');
  }
}

function applyExhaustModification() {
  // Simulate exhaust modification
  const soundLevel = ['Quiet', 'Moderate', 'Loud'][Math.floor(Math.random() * 3)];
  
  if (!projectData.performanceStats.exhaust) {
    projectData.performanceStats.exhaust = {
      modified: true,
      soundLevel: soundLevel,
      material: 'Titanium',
      brand: 'Akrapovic'
    };
    
    showNotification(`Exhaust system upgraded! Sound: ${soundLevel}`, 'success');
  } else {
    showNotification('Exhaust already modified!', 'info');
  }
}

function applyLightModification() {
  // Simulate light modification
  const lightType = ['LED', 'Xenon', 'HID'][Math.floor(Math.random() * 3)];
  
  if (!projectData.customizations.lights) {
    projectData.customizations.lights = {
      type: lightType,
      color: 'White',
      brightness: 'High'
    };
    
    showNotification(`${lightType} lights installed!`, 'success');
  } else {
    showNotification('Lights already modified!', 'info');
  }
}

function collectTuningData() {
  // Collect all current tuning data from the UI
  const customizations = {
    paint: collectPaintData(),
    rims: collectRimData(),
    lights: projectData.customizations.lights || null,
    // Add other customization data
  };
  
  return {
    customizations,
    performanceStats: projectData.performanceStats,
    images: projectData.images,
    tags: projectData.tags
  };
}

function collectPaintData() {
  // Get current paint settings from the UI
  const materialSelect = document.getElementById('materialSelect');
  const colorPicker = document.getElementById('colorPicker');
  const finishSelect = document.getElementById('finishSelect');
  
  if (materialSelect && colorPicker && finishSelect) {
    return {
      material: materialSelect.value,
      color: colorPicker.value,
      finish: finishSelect.value
    };
  }
  
  return null;
}

function collectRimData() {
  // Get current rim selection
  const selectedRim = document.querySelector('.rimOption.selected');
  if (selectedRim) {
    return {
      model: selectedRim.getAttribute('data-rim-src'),
      brand: 'Custom',
      size: '18"'
    };
  }
  
  return null;
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fa fa-${getNotificationIcon(type)}"></i>
      <span>${message}</span>
    </div>
  `;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Show notification
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  // Hide after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

function getNotificationIcon(type) {
  switch (type) {
    case 'success': return 'check-circle';
    case 'error': return 'exclamation-circle';
    case 'info': return 'info-circle';
    default: return 'info-circle';
  }
}

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
        color: #333;
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
      
      .project-selector h3 {
        margin: 0 0 1rem 0;
        color: #333;
      }
      
      .projects-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      
      .project-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        border: 1px solid #eee;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .project-item:hover {
        background: #f8f9fa;
        border-color: #007bff;
      }
      
      .project-icon {
        width: 50px;
        height: 50px;
        background: #007bff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.5rem;
      }
      
      .project-details h4 {
        margin: 0 0 0.25rem 0;
        color: #333;
      }
      
      .project-details p {
        margin: 0 0 0.25rem 0;
        color: #666;
        font-size: 0.9rem;
      }
      
      .project-details small {
        color: #999;
        font-size: 0.8rem;
      }
      
      .notification {
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: white;
        border-radius: 8px;
        padding: 1rem 1.5rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1001;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
      }
      
      .notification.show {
        transform: translateX(0);
      }
      
      .notification-success {
        border-left: 4px solid #28a745;
      }
      
      .notification-error {
        border-left: 4px solid #dc3545;
      }
      
      .notification-info {
        border-left: 4px solid #17a2b8;
      }
      
      .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #333;
      }
      
      .notification-content i {
        font-size: 1.2rem;
      }
      
      .notification-success .notification-content i {
        color: #28a745;
      }
      
      .notification-error .notification-content i {
        color: #dc3545;
      }
      
      .notification-info .notification-content i {
        color: #17a2b8;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideIn {
        from { transform: translateY(-20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(styles);
  }
  
  return modal;
}

// Make functions globally available
window.loadSelectedProject = loadSelectedProject;
