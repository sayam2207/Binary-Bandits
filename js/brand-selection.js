// Brand Selection JavaScript (using simple auth)
// Functions are now available globally from simple-auth-no-firebase.js

// Global variables
let currentUser = null;

// Simple authentication check
document.addEventListener('DOMContentLoaded', () => {
  console.log('🔧 Brand selection page loading...');
  
  // Simple check: Just look in localStorage
  const storedUser = localStorage.getItem('tuning_app_current_user');
  if (storedUser) {
    const user = JSON.parse(storedUser);
    console.log('✅ User found in localStorage:', user.email);
    currentUser = user;
    window.currentUser = user;
    showUserInfo(user);
  } else {
    console.log('❌ No user in localStorage');
    currentUser = null;
    window.currentUser = null;
    hideUserInfo();
  }
});

// Show user info in header
function showUserInfo(user) {
  const userInfo = document.getElementById('userInfo');
  const userName = document.getElementById('userName');
  
  if (userInfo && userName) {
    const displayName = user.displayName || user.email?.split('@')[0] || 'User';
    userName.textContent = `Welcome, ${displayName}!`;
    userInfo.classList.add('show');
  }
  
  // Make currentUser available globally
  window.currentUser = user;
}

// Hide user info
function hideUserInfo() {
  const userInfo = document.getElementById('userInfo');
  
  if (userInfo) {
    userInfo.classList.remove('show');
  }
  
  // Clear global currentUser
  window.currentUser = null;
}

// Simple brand selection with authentication
function selectBrandWithAuth(brandId) {
  console.log('🔍 Simple authentication check...');
  
  // SIMPLE CHECK: Just check localStorage directly
  const storedUser = localStorage.getItem('tuning_app_current_user');
  console.log('Stored user exists:', !!storedUser);
  
  if (!storedUser) {
    console.log('❌ No user in localStorage, redirecting to login page');
    // Store the brand ID for after login
    localStorage.setItem('selectedBrand', brandId);
    // Redirect to login page
    window.location.href = 'login.html';
    return;
  }
  
  console.log('✅ User found in localStorage, proceeding with brand selection');
  // User is authenticated, proceed with brand selection
  proceedWithBrandSelection(brandId);
}

// Force refresh authentication state
function refreshAuthState() {
  console.log('🔄 Refreshing authentication state...');
  
  if (typeof getCurrentUser === 'function') {
    const user = getCurrentUser();
    if (user) {
      console.log('✅ Refresh: User found:', user.email);
      currentUser = user;
      window.currentUser = user;
      showUserInfo(user);
    } else {
      console.log('❌ Refresh: No user found');
      currentUser = null;
      window.currentUser = null;
      hideUserInfo();
    }
  }
}

// Proceed with brand selection (authenticated users only)
function proceedWithBrandSelection(brandId) {
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    loadingOverlay.style.display = 'flex';
  }
  
  // Store selected brand in localStorage
  localStorage.setItem('selectedBrand', brandId);
  
  // Simulate loading time
  setTimeout(() => {
    // Redirect to brand models page
    window.location.href = `brand_models.html?brand=${brandId}`;
  }, 1000);
}

// Show login modal
function showLoginModal() {
  const loginModal = document.getElementById('loginModal');
  if (loginModal) {
    loginModal.classList.add('show');
  }
}

// Close login modal
function closeLoginModal() {
  const loginModal = document.getElementById('loginModal');
  if (loginModal) {
    loginModal.classList.remove('show');
  }
}

// Handle login button click
function handleLoginClick() {
  // Store the current page to return after login
  localStorage.setItem('returnUrl', window.location.href);
  
  // Redirect to login page
  window.location.href = 'login.html';
}

// Handle register button click
function handleRegisterClick() {
  // Store the current page to return after registration
  localStorage.setItem('returnUrl', window.location.href);
  
  // Redirect to login page (which has registration)
  window.location.href = 'login.html';
}

// Check if user should be redirected after login
function checkReturnUrl() {
  const returnUrl = localStorage.getItem('returnUrl');
  if (returnUrl && currentUser) {
    // Clear the return URL
    localStorage.removeItem('returnUrl');
    
    // Redirect back to the original page
    window.location.href = returnUrl;
  }
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check if user should be redirected after login
  checkReturnUrl();
  
  // Update login/register button handlers
  const loginButtons = document.querySelectorAll('.btn-login');
  const registerButtons = document.querySelectorAll('.btn-register');
  
  loginButtons.forEach(button => {
    button.addEventListener('click', handleLoginClick);
  });
  
  registerButtons.forEach(button => {
    button.addEventListener('click', handleRegisterClick);
  });
});

// Simple test function
window.testAuth = function() {
  const storedUser = localStorage.getItem('tuning_app_current_user');
  console.log('🧪 Simple auth test:');
  console.log('localStorage user exists:', !!storedUser);
  if (storedUser) {
    const user = JSON.parse(storedUser);
    console.log('User email:', user.email);
  }
  return !!storedUser;
};

// Make functions globally available
window.selectBrandWithAuth = selectBrandWithAuth;
window.selectBrand = selectBrandWithAuth; // Alias for compatibility
window.showLoginModal = showLoginModal;
window.closeLoginModal = closeLoginModal;
window.handleLoginClick = handleLoginClick;
window.handleRegisterClick = handleRegisterClick;
window.refreshAuthState = refreshAuthState;
