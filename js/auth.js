// Authentication JavaScript (using global functions)
// Functions are now available globally from simple-auth.js

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const messageContainer = document.getElementById('messageContainer');
const messageText = document.getElementById('messageText');

// Form sections
const loginSection = document.getElementById('loginSection');
const registerSection = document.getElementById('registerSection');
const forgotPasswordSection = document.getElementById('forgotPasswordSection');

// Initialize Auth state listener
document.addEventListener('DOMContentLoaded', () => {
  console.log('🔧 Setting up auth state listener...');
  
  // Wait for auth functions to be available
  setTimeout(() => {
    if (typeof onAuthStateChange === 'function') {
      console.log('✅ Auth state listener available');
      onAuthStateChange((user) => {
        if (user) {
          console.log('✅ User authenticated:', user.email);
          // Check if there's a return URL
          const returnUrl = localStorage.getItem('returnUrl');
          
          if (returnUrl) {
            console.log('🔄 Redirecting to return URL:', returnUrl);
            // Clear the return URL and redirect back
            localStorage.removeItem('returnUrl');
            window.location.href = returnUrl;
          } else {
            console.log('🔄 Redirecting to homepage');
            // Default redirect to homepage
            window.location.href = 'homepage.html';
          }
        } else {
          console.log('❌ User not authenticated');
        }
      });
    } else {
      console.error('❌ onAuthStateChange function not available');
    }
  }, 500);
});

// Form event listeners
if (loginForm) {
  loginForm.addEventListener('submit', handleLogin);
}

if (registerForm) {
  registerForm.addEventListener('submit', handleRegister);
}

if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener('submit', handleForgotPassword);
}

// Login handler
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const button = e.target.querySelector('.auth-btn');
  
  setLoading(button, true);
  
  try {
    console.log('Attempting login for:', email);
    console.log('Available functions:', {
      signUpUser: typeof window.signUpUser,
      signInUser: typeof window.signInUser,
      signOutUser: typeof window.signOutUser
    });
    
    if (typeof window.signInUser !== 'function') {
      throw new Error('SignInUser function not available. Please refresh the page.');
    }
    
    const result = await window.signInUser(email, password);
    
    if (result.success) {
      showMessage('Login successful! Redirecting...', 'success');
      
      // Manual redirect as backup
      setTimeout(() => {
        // Check if user was trying to select a brand
        const selectedBrand = localStorage.getItem('selectedBrand');
        if (selectedBrand) {
          localStorage.removeItem('selectedBrand');
          window.location.href = `brand_models.html?brand=${selectedBrand}`;
        } else {
          const returnUrl = localStorage.getItem('returnUrl');
          if (returnUrl) {
            localStorage.removeItem('returnUrl');
            window.location.href = returnUrl;
          } else {
            window.location.href = 'homepage.html';
          }
        }
      }, 1000);
    } else {
      showMessage(result.error, 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    showMessage('An unexpected error occurred: ' + error.message, 'error');
  } finally {
    setLoading(button, false);
  }
}

// Register handler
async function handleRegister(e) {
  e.preventDefault();
  
  const username = document.getElementById('registerUsername').value;
  const firstName = document.getElementById('registerFirstName').value;
  const lastName = document.getElementById('registerLastName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const button = e.target.querySelector('.auth-btn');
  
  // Validation
  if (password !== confirmPassword) {
    showMessage('Passwords do not match', 'error');
    return;
  }
  
  if (password.length < 6) {
    showMessage('Password must be at least 6 characters', 'error');
    return;
  }
  
  setLoading(button, true);
  
  try {
    console.log('Attempting registration for:', email);
    console.log('Available functions:', {
      signUpUser: typeof window.signUpUser,
      signInUser: typeof window.signInUser,
      signOutUser: typeof window.signOutUser
    });
    
    if (typeof window.signUpUser !== 'function') {
      throw new Error('SignUpUser function not available. Please refresh the page.');
    }
    
    const userData = {
      username,
      firstName,
      lastName,
      email
    };
    
    const result = await window.signUpUser(email, password, userData);
    
    if (result.success) {
      showMessage('Account created successfully! Redirecting...', 'success');
      
      // Manual redirect after registration
      setTimeout(() => {
        // Check if user was trying to select a brand
        const selectedBrand = localStorage.getItem('selectedBrand');
        if (selectedBrand) {
          localStorage.removeItem('selectedBrand');
          window.location.href = `brand_models.html?brand=${selectedBrand}`;
        } else {
          const returnUrl = localStorage.getItem('returnUrl');
          if (returnUrl) {
            localStorage.removeItem('returnUrl');
            window.location.href = returnUrl;
          } else {
            window.location.href = 'homepage.html';
          }
        }
      }, 1000);
    } else {
      showMessage(result.error, 'error');
    }
  } catch (error) {
    console.error('Registration error:', error);
    showMessage('An unexpected error occurred: ' + error.message, 'error');
  } finally {
    setLoading(button, false);
  }
}

// Forgot password handler
async function handleForgotPassword(e) {
  e.preventDefault();
  
  const email = document.getElementById('resetEmail').value;
  const button = e.target.querySelector('.auth-btn');
  
  setLoading(button, true);
  
  try {
    // This would typically call a Firebase function
    // For now, we'll show a success message
    showMessage('Password reset email sent! Check your inbox.', 'success');
    showLogin();
  } catch (error) {
    showMessage('Failed to send reset email', 'error');
  } finally {
    setLoading(button, false);
  }
}

// Google Sign In (placeholder)
async function signInWithGoogle() {
  showMessage('Google Sign-In coming soon!', 'info');
}

// Form switching functions
function showLogin() {
  hideAllSections();
  loginSection.classList.add('active');
}

function showRegister() {
  hideAllSections();
  registerSection.classList.add('active');
}

function showForgotPassword() {
  hideAllSections();
  forgotPasswordSection.classList.add('active');
}

function hideAllSections() {
  loginSection.classList.remove('active');
  registerSection.classList.remove('active');
  forgotPasswordSection.classList.remove('active');
}

// Utility functions
function setLoading(button, isLoading) {
  const btnText = button.querySelector('.btn-text');
  const spinner = button.querySelector('.spinner');
  
  if (isLoading) {
    button.disabled = true;
    btnText.classList.add('hidden');
    spinner.classList.remove('hidden');
  } else {
    button.disabled = false;
    btnText.classList.remove('hidden');
    spinner.classList.add('hidden');
  }
}

function showMessage(text, type = 'success') {
  messageText.textContent = text;
  messageContainer.classList.remove('hidden');
  
  const message = messageContainer.querySelector('.message');
  message.classList.remove('error');
  
  if (type === 'error') {
    message.classList.add('error');
  }
  
  // Auto hide after 5 seconds
  setTimeout(() => {
    hideMessage();
  }, 5000);
}

function hideMessage() {
  messageContainer.classList.add('hidden');
}

// Password toggle function
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const button = input.parentElement.querySelector('.toggle-password');
  const icon = button.querySelector('i');
  
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

// Form validation
function validateForm(form) {
  const inputs = form.querySelectorAll('input[required]');
  let isValid = true;
  
  inputs.forEach(input => {
    if (!input.value.trim()) {
      showFieldError(input, 'This field is required');
      isValid = false;
    } else {
      clearFieldError(input);
    }
  });
  
  return isValid;
}

function showFieldError(input, message) {
  const inputGroup = input.parentElement;
  input.classList.add('error');
  
  // Remove existing error message
  const existingError = inputGroup.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }
  
  // Add new error message
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
  inputGroup.appendChild(errorDiv);
}

function clearFieldError(input) {
  const inputGroup = input.parentElement;
  input.classList.remove('error');
  
  const errorMessage = inputGroup.querySelector('.error-message');
  if (errorMessage) {
    errorMessage.remove();
  }
}

// Make functions globally available
window.showLogin = showLogin;
window.showRegister = showRegister;
window.showForgotPassword = showForgotPassword;
window.togglePassword = togglePassword;
window.hideMessage = hideMessage;
window.signInWithGoogle = signInWithGoogle;
