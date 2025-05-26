const urlBase = '/LAMPAPI';
const extension = 'php';

const TEST_MODE = false; // Set to false when going to production

let userId = 0;
let firstName = "";
let lastName = "";
let lastContactCount = 6; // Default skeleton row count

document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("contactsList")) {
    readCookie();
  }
  
  // Add event listeners for real-time validation clearing
  const fields = ['contactFirstName', 'contactLastName', 'contactEmail', 'contactPhone'];
  
  fields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('input', function() {
        // Clear error styling when user starts typing
        this.style.borderColor = '';
        this.style.boxShadow = '';
        
        const errorDiv = this.parentNode.querySelector('.field-error');
        if (errorDiv) {
          errorDiv.remove();
        }
      });
    }
  });
});

// === Toast Notification ===
function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// === Auth ===
function showRegister() {
  document.getElementById("loginDiv").style.display = "none";
  document.getElementById("registerDiv").style.display = "block";
}

function showLogin() {
  document.getElementById("registerDiv").style.display = "none";
  document.getElementById("loginDiv").style.display = "block";
}

function doLogin() {
  userId = 0;
  firstName = "";
  lastName = "";

  const login = document.getElementById("loginName").value;
  const password = document.getElementById("loginPassword").value;

  document.getElementById("loginResult").innerHTML = "";

  const tmp = { login, password };
  const jsonPayload = JSON.stringify(tmp);

  const url = `${urlBase}/login.${extension}`;
  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const res = JSON.parse(xhr.responseText);
      userId = res.id;

      if (userId < 1) {
        document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
        return;
      }

      firstName = res.firstName;
      lastName = res.lastName;

      saveCookie();
      window.location.href = "contacts.html";
    }
  };

  xhr.send(jsonPayload);
}

function doLogout() {
  userId = 0;
  firstName = "";
  lastName = "";
  document.cookie = "firstName= ; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "lastName= ; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "userId= ; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  window.location.href = "index.html";
}

// === Enhanced Contact Handling with Validation ===
function addContact() {
  // Get form values and trim whitespace
  const firstName = document.getElementById("contactFirstName").value.trim();
  const lastName = document.getElementById("contactLastName").value.trim();
  const email = document.getElementById("contactEmail").value.trim();
  const phoneNumber = document.getElementById("contactPhone").value.trim();

  // Clear any previous error messages
  clearValidationErrors();

  // Validation flags
  let isValid = true;
  const errors = [];

  // Validate First Name
  if (!firstName) {
    showFieldError("contactFirstName", "First name is required");
    errors.push("First name is required");
    isValid = false;
  } else if (firstName.length < 2) {
    showFieldError("contactFirstName", "First name must be at least 2 characters");
    errors.push("First name must be at least 2 characters");
    isValid = false;
  } else if (!/^[a-zA-Z\s'-]+$/.test(firstName)) {
    showFieldError("contactFirstName", "First name contains invalid characters");
    errors.push("First name contains invalid characters");
    isValid = false;
  }

  // Validate Last Name
  if (!lastName) {
    showFieldError("contactLastName", "Last name is required");
    errors.push("Last name is required");
    isValid = false;
  } else if (lastName.length < 2) {
    showFieldError("contactLastName", "Last name must be at least 2 characters");
    errors.push("Last name must be at least 2 characters");
    isValid = false;
  } else if (!/^[a-zA-Z\s'-]+$/.test(lastName)) {
    showFieldError("contactLastName", "Last name contains invalid characters");
    errors.push("Last name contains invalid characters");
    isValid = false;
  }

  // Validate Email
  if (!email) {
    showFieldError("contactEmail", "Email is required");
    errors.push("Email is required");
    isValid = false;
  } else if (!isValidEmail(email)) {
    showFieldError("contactEmail", "Please enter a valid email address");
    errors.push("Please enter a valid email address");
    isValid = false;
  }

  // Validate Phone Number
  if (!phoneNumber) {
    showFieldError("contactPhone", "Phone number is required");
    errors.push("Phone number is required");
    isValid = false;
  } else if (!isValidPhoneNumber(phoneNumber)) {
    showFieldError("contactPhone", "Please enter a valid phone number");
    errors.push("Please enter a valid phone number");
    isValid = false;
  }

  // If validation fails, show error toast and return
  if (!isValid) {
    showToast("Error: Please fix the highlighted fields");
    return;
  }

  // Proceed with API call if validation passes
  const tmp = {
    firstName,
    lastName,
    email,
    phoneNumber,
    userID: userId
  };

  const jsonPayload = JSON.stringify(tmp);
  const url = `${urlBase}/addContact.${extension}`;

  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const jsonResponse = JSON.parse(xhr.responseText);

      if (jsonResponse.error && jsonResponse.error !== "") {
        showToast("Error: " + jsonResponse.error);
        return;
      }

      showToast(`Added: ${firstName} ${lastName}`);

      // Clear form and validation errors
      clearAddContactForm();

      // Refresh contacts list
      searchContacts();
    }
  };

  xhr.send(jsonPayload);
}

// Helper function to validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function to validate phone number format
function isValidPhoneNumber(phone) {
  // Remove all non-digit characters for validation
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Accept phone numbers with 10-15 digits
  if (cleanPhone.length < 10 || cleanPhone.length > 15) {
    return false;
  }
  
  // Optional: More specific US phone number validation
  // Accepts formats like: (555) 123-4567, 555-123-4567, 555.123.4567, 5551234567
  const phoneRegex = /^[\+]?[1-9]?[\-\.\s\(\)]?([0-9][\-\.\s\(\)]?){9,14}$/;
  return phoneRegex.test(phone);
}

// Show field-specific error styling and message
function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (field) {
    field.style.borderColor = "#ff4444";
    field.style.boxShadow = "0 0 5px rgba(255, 68, 68, 0.3)";
    
    // Add error message below field if it doesn't exist
    let errorDiv = field.parentNode.querySelector('.field-error');
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.className = 'field-error';
      errorDiv.style.color = '#ff4444';
      errorDiv.style.fontSize = '0.8rem';
      errorDiv.style.marginTop = '0.25rem';
      field.parentNode.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
  }
}

// Clear all validation errors
function clearValidationErrors() {
  const fields = ['contactFirstName', 'contactLastName', 'contactEmail', 'contactPhone'];
  
  fields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.style.borderColor = '';
      field.style.boxShadow = '';
      
      // Remove error message
      const errorDiv = field.parentNode.querySelector('.field-error');
      if (errorDiv) {
        errorDiv.remove();
      }
    }
  });
}

// Clear form and remove validation styling
function clearAddContactForm() {
  document.getElementById("contactFirstName").value = "";
  document.getElementById("contactLastName").value = "";
  document.getElementById("contactEmail").value = "";
  document.getElementById("contactPhone").value = "";
  
  clearValidationErrors();
}

function searchContacts() {
  const searchInput = document.getElementById("searchText").value.trim();
  
  // Clear previous results and show skeleton
  document.getElementById("searchResult").textContent = "";
  
  // Determine skeleton row count based on search type
  const estimatedRows = searchInput ? Math.min(lastContactCount, 8) : lastContactCount;
  
  // Show skeleton (assumes you have showSkeleton function in skeleton.js)
  if (typeof showSkeleton === 'function') {
    showSkeleton(estimatedRows);
  }

  // Handle TEST_MODE
  if (TEST_MODE) {
    // Simulate network delay for testing
    setTimeout(() => {
      handleTestModeSearch(searchInput);
    }, 1000); // 1 second delay to see skeleton
    return;
  }

  // Production API call
  const payload = JSON.stringify({
    search: searchInput,
    userID: userId
  });

  const xhr = new XMLHttpRequest();
  xhr.open("POST", `${urlBase}/searchContacts.${extension}`, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  xhr.onreadystatechange = function () {
    if (xhr.readyState !== 4 || xhr.status !== 200) return;

    // Hide skeleton
    if (typeof hideSkeleton === 'function') {
      hideSkeleton();
    }

    let response;
    try {
      response = JSON.parse(xhr.responseText);
    } catch {
      document.getElementById("searchResult").textContent = "Invalid JSON from server.";
      return;
    }

    if (response.error) {
      document.getElementById("searchResult").textContent = response.error;
      return;
    }

    populateContactsTable(response.results, searchInput);
  };

  xhr.send(payload);
}

// Test mode search function
function handleTestModeSearch(searchInput) {
  // Hide skeleton
  if (typeof hideSkeleton === 'function') {
    hideSkeleton();
  }

  // Mock data for testing
  const mockContacts = [
    { ID: 1, firstName: "John", lastName: "Smith", email: "john.smith@email.com", phoneNumber: "(555) 123-4567" },
    { ID: 2, firstName: "Jane", lastName: "Doe", email: "jane.doe@email.com", phoneNumber: "(555) 987-6543" },
    { ID: 3, firstName: "Michael", lastName: "Johnson", email: "m.johnson@email.com", phoneNumber: "(555) 456-7890" },
    { ID: 4, firstName: "Sarah", lastName: "Williams", email: "sarah.w@email.com", phoneNumber: "(555) 321-0987" },
    { ID: 5, firstName: "David", lastName: "Brown", email: "david.brown@email.com", phoneNumber: "(555) 654-3210" },
    { ID: 6, firstName: "Emily", lastName: "Davis", email: "emily.davis@email.com", phoneNumber: "(555) 789-0123" }
  ];

  // Filter contacts based on search input
  let filteredContacts = mockContacts;
  if (searchInput) {
    filteredContacts = mockContacts.filter(contact => 
      contact.firstName.toLowerCase().includes(searchInput.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchInput.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchInput.toLowerCase()) ||
      contact.phoneNumber.includes(searchInput)
    );
  }

  populateContactsTable(filteredContacts, searchInput);
}

// Fixed populateContactsTable function
function populateContactsTable(contacts, searchInput = "") {
  const listContainer = document.getElementById("contactsList");
  listContainer.innerHTML = "";
  
  // Update last contact count for future skeleton displays
  lastContactCount = Math.max(contacts.length, 3); // Minimum 3 for skeleton
  
  // Update search result text
  if (searchInput) {
    document.getElementById("searchResult").textContent = 
      `Found ${contacts.length} contact${contacts.length !== 1 ? 's' : ''} matching "${searchInput}"`;
  } else {
    document.getElementById("searchResult").textContent = 
      `Showing ${contacts.length} contact${contacts.length !== 1 ? 's' : ''}`;
  }

  // Handle empty results
  if (contacts.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `
      <td colspan="5" style="text-align: center; padding: 2rem; color: var(--baseColor); font-style: italic;">
        ${searchInput ? `No contacts found matching "${searchInput}"` : 'No contacts found. Add your first contact!'}
      </td>
    `;
    listContainer.appendChild(emptyRow);
    return;
  }

  // Populate table with contacts - FIXED COLUMN ORDER
  contacts.forEach(contact => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(contact.firstName)}</td>
      <td>${escapeHtml(contact.lastName)}</td>
      <td>${escapeHtml(contact.email)}</td>
      <td>${escapeHtml(contact.phoneNumber)}</td>
      <td>
        <div class="dropdown">
          <button class="dropbtn">Actions ▼</button>
          <div class="dropdown-content">
            <a href="#" onclick="showEditContact(${contact.ID}, '${escapeHtml(contact.firstName)}', '${escapeHtml(contact.lastName)}', '${escapeHtml(contact.email)}', '${escapeHtml(contact.phoneNumber)}'); return false;">Edit</a>
            <a href="#" onclick="deleteContact(${contact.ID}); return false;">Delete</a>
          </div>
        </div>
      </td>
    `;

    listContainer.appendChild(row);
  });
}

function showEditContact(id, firstName, lastName, email, phone) {
  document.getElementById("editContactID").value = id;
  document.getElementById("editFirstName").value = firstName;
  document.getElementById("editLastName").value = lastName;
  document.getElementById("editEmail").value = email;
  document.getElementById("editPhone").value = phone;

  document.getElementById("editContactDiv").style.display = "block";
  
  // Scroll to edit section
  document.getElementById("editContactDiv").scrollIntoView({ 
    behavior: 'smooth', 
    block: 'nearest' 
  });
}

function cancelEdit() {
  document.getElementById("editContactDiv").style.display = "none";
  document.getElementById("editContactResult").innerHTML = "";
  
  // Clear form
  document.getElementById("editContactForm").reset();
}

function updateContact() {
  const contactId = parseInt(document.getElementById("editContactID").value);
  const firstName = document.getElementById("editFirstName").value.trim();
  const lastName = document.getElementById("editLastName").value.trim();
  const email = document.getElementById("editEmail").value.trim();
  const phone = document.getElementById("editPhone").value.trim();

  // Validate form fields
  if (!firstName || !lastName || !email || !phone) {
    document.getElementById("editContactResult").innerHTML = "Please fill in all fields.";
    return;
  }

  const tmp = {
    contactId,
    firstName,
    lastName,
    email,
    phone,
    userId
  };

  const jsonPayload = JSON.stringify(tmp);
  const url = `${urlBase}/updateContact.${extension}`;

  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const res = JSON.parse(xhr.responseText);
      if (!res.success) {
        document.getElementById("editContactResult").innerHTML = res.error;
        return;
      }

      document.getElementById("editContactResult").innerHTML = "Contact has been updated.";
      showToast(`Updated: ${firstName} ${lastName}`);
      
      setTimeout(() => {
        cancelEdit();
        searchContacts(); // Refresh the list
      }, 1500);
    }
  };

  xhr.send(jsonPayload);
}

function deleteContact(id) {
  // Find contact name for confirmation (optional enhancement)
  const row = event.target.closest('tr');
  const firstName = row.cells[1].textContent;
  const lastName = row.cells[2].textContent;
  
  if (!confirm(`Are you sure you want to delete ${firstName} ${lastName}?`)) {
    return;
  }

  const tmp = { ID: id, userID: userId };
  const jsonPayload = JSON.stringify(tmp);
  const url = `${urlBase}/deleteContact.${extension}`;

  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      showToast(`Deleted: ${firstName} ${lastName}`);
      searchContacts(); // Refresh the list
    }
  };

  xhr.send(jsonPayload);
}

// === Cookie Management ===
function saveCookie() {
  const minutes = 20;
  const date = new Date();
  date.setTime(date.getTime() + minutes * 60000);
  const expires = "expires=" + date.toUTCString();

  document.cookie = `firstName=${encodeURIComponent(firstName)};${expires};path=/`;
  document.cookie = `lastName=${encodeURIComponent(lastName)};${expires};path=/`;
  document.cookie = `userId=${userId};${expires};path=/`;
}

function readCookie() {
  userId = -1;
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith("firstName=")) firstName = decodeURIComponent(cookie.substring("firstName=".length));
    else if (cookie.startsWith("lastName=")) lastName = decodeURIComponent(cookie.substring("lastName=".length));
    else if (cookie.startsWith("userId=")) userId = parseInt(cookie.substring("userId=".length), 10);
  }

  if (userId < 1) {
    if (TEST_MODE) {
      // Set test values for local testing
      userId = 1;
      firstName = "Test";
      lastName = "User";
    } else {
      window.location.href = "index.html";
      return;
    }
  }
  
  if (document.getElementById("userName")) {
    document.getElementById("userName").innerHTML = `${firstName} ${lastName}`;
  }
  
  // Load contacts on page load
  searchContacts();
}

// === HTML Escape ===
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// === Tab Switching (if using tabbed interface) ===
function switchTab(tabName) {
  // Hide all tab contents
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(tab => tab.classList.remove('active'));
  
  // Remove active class from all tab buttons
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => button.classList.remove('active'));
  
  // Show selected tab content
  if (tabName === 'contacts') {
    const contactsTab = document.getElementById('contactsTab');
    const contactsButton = document.querySelector('.tab-button:first-child');
    
    if (contactsTab) contactsTab.classList.add('active');
    if (contactsButton) contactsButton.classList.add('active');
  } else if (tabName === 'add') {
    const addTab = document.getElementById('addTab');
    const addButton = document.querySelector('.tab-button:last-child');
    
    if (addTab) addTab.classList.add('active');
    if (addButton) addButton.classList.add('active');
  }
}

// === Dropdown Event Handling ===
document.addEventListener("click", function (e) {
  // Close all open dropdowns
  document.querySelectorAll(".dropdown").forEach(dropdown => {
    const content = dropdown.querySelector(".dropdown-content");
    if (content) content.style.display = "none";
    dropdown.classList.remove("active");
  });

  // Toggle if clicking a dropbtn
  if (e.target.matches(".dropbtn")) {
    const btn = e.target;
    const dropdown = btn.closest(".dropdown");
    const menu = dropdown.querySelector(".dropdown-content");

    const rect = btn.getBoundingClientRect();

    // Apply fixed position
    menu.style.position = "fixed";
    menu.style.left = `${rect.left}px`;
    menu.style.top = `${rect.bottom + 5}px`; // just under the button

    menu.style.display = "block";

    dropdown.classList.add("active");
    e.preventDefault();
  }
});