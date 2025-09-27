// Brand Models JavaScript (using global functions)
// Functions are now available globally from simple-auth.js

// Global variables
let currentUser = null;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚗 Brand models page loaded');
  // No authentication check needed - proceed directly
});

// Simple model selection - no authentication check
function selectModelWithAuth(modelId, modelName, modelFile) {
  console.log('🚗 Starting tuning for model:', modelName);
  
  // Proceed directly with model selection
  proceedWithModelSelection(modelId, modelName, modelFile);
}

// Proceed with model selection (authenticated users only)
function proceedWithModelSelection(modelId, modelName, modelFile) {
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    loadingOverlay.style.display = 'flex';
  }

  // Store selected model data
  localStorage.setItem('selectedCar', modelName);
  localStorage.setItem('selectedModel', modelFile);
  localStorage.setItem('selectedModelId', modelId);

  // Simulate loading time
  setTimeout(() => {
    // Redirect to tuning page
    window.location.href = 'tuning page.html';
  }, 1000);
}

// Make functions globally available
window.selectModelWithAuth = selectModelWithAuth;
