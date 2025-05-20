// Register.js - Handles registration functionality

const urlBase = '/LAMPAPI';
const extension = 'php';

// Function to handle user registration
function doRegister() {
  // Get form values
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const loginName = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  
  // Validate form inputs
  if (!firstName || !lastName || !loginName || !email || !password) {
    showMessage('Please fill in all fields', true);
    return;
  }
  
  // Validate email format
  if (!isValidEmail(email)) {
    showMessage('Please enter a valid email address', true);
    return;
  }
  
  // Validate password strength
  if (password.length < 8) {
    showMessage('Password must be at least 8 characters long', true);
    return;
  }
  
  // Create user object to match the API expectations
  const userData = {
    firstName,
    lastName,
    loginName,
    email,
    password
  };
  
  // Show processing message
  showMessage('Processing...', false);
  
  // Create the JSON payload
  const jsonPayload = JSON.stringify(userData);
  const url = `${urlBase}/register.${extension}`;
  
  // Send the registration request to the API using XMLHttpRequest to match your existing code pattern
  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        try {
          const res = JSON.parse(xhr.responseText);
          
          if (res.error) {
            // Registration failed with an error from the server
            showMessage(res.error, true);
          } else {
            // Registration successful
            showMessage('Registration successful! Redirecting to login...', false);
            
            // Redirect to login page after 2 seconds
            setTimeout(() => {
              window.location.href = "index.html";
            }, 2000);
          }
        } catch (e) {
          showMessage('Error processing server response', true);
        }
      } else {
        showMessage('Server error: ' + xhr.status, true);
      }
    }
  };
  
  xhr.send(jsonPayload);
}

// Helper function to validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function to show messages
function showMessage(message, isError) {
  const resultElement = document.getElementById('registerResult');
  resultElement.innerHTML = message;
  
  // Set appropriate styling
  if (isError) {
    resultElement.classList.add('error');
  } else {
    resultElement.classList.remove('error');
  }
  
  // Ensure the element is visible
  resultElement.style.display = 'block';
}

// Initialize any necessary event listeners when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Hide the registerResult div initially if it's empty
  const resultElement = document.getElementById('registerResult');
  if (!resultElement.textContent.trim()) {
    resultElement.style.display = 'none';
  }
  
  // Add event listener for Enter key in password field
  document.getElementById('registerPassword').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      doRegister();
    }
  });
  
  // Add form submit event handler
  const form = document.getElementById('registerForm');
  form.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission
    doRegister();
  });
});