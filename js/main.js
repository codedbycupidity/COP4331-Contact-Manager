const urlBase = '/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("contactsList")) {
    readCookie();
  }
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

// === Contact Handling ===
function addContact() {
  const firstName = document.getElementById("contactFirstName").value;
  const lastName = document.getElementById("contactLastName").value;
  const email = document.getElementById("contactEmail").value;
  const phoneNumber = document.getElementById("contactPhone").value;
  const address = document.getElementById("contactAddress").value;

  const tmp = {
    firstName,
    lastName,
    email,
    phoneNumber,
    address,
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

      // Clear form
      document.getElementById("contactFirstName").value = "";
      document.getElementById("contactLastName").value = "";
      document.getElementById("contactEmail").value = "";
      document.getElementById("contactPhone").value = "";
      document.getElementById("contactAddress").value = "";

      searchContacts();
    }
  };

  xhr.send(jsonPayload);
}

function searchContacts() {
  const searchInput = document.getElementById("searchText").value.trim();
  document.getElementById("searchResult").textContent = "";

  const payload = JSON.stringify({
    search: searchInput,
    userID: userId
  });

  const xhr = new XMLHttpRequest();
  xhr.open("POST", `${urlBase}/searchContacts.${extension}`, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  xhr.onreadystatechange = function () {
    if (xhr.readyState !== 4 || xhr.status !== 200) return;

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

    const listContainer = document.getElementById("contactsList");
    listContainer.innerHTML = "";
    document.getElementById("searchResult").textContent = "Contacts loaded.";

    response.results.forEach(contact => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="sticky-col">
          <div class="dropdown">
            <button class="dropbtn">Actions ▼</button>
            <div class="dropdown-content">
              <a href="#" onclick="toggleDetails(${contact.ID}); return false;">Show</a>
              <a href="#" onclick="showEditContact(${contact.ID}, '${escapeHtml(contact.firstName)}', '${escapeHtml(contact.lastName)}', '${escapeHtml(contact.email)}', '${escapeHtml(contact.phoneNumber)}', '${escapeHtml(contact.address || "")}'); return false;">Edit</a>
              <a href="#" onclick="deleteContact(${contact.ID}); return false;">Delete</a>
            </div>
          </div>
        </td>
        <td>${escapeHtml(contact.firstName)}</td>
        <td>${escapeHtml(contact.lastName)}</td>
        <td>${escapeHtml(contact.email)}</td>
        <td>${escapeHtml(contact.phoneNumber)}</td>
        <td>${escapeHtml(contact.address || "")}</td>
      `;

      const detailRow = document.createElement("tr");
      detailRow.id = `details-${contact.ID}`;
      detailRow.style.display = "none";
      detailRow.innerHTML = `
        <td colspan="6" class="detail-expand">
          <strong>Address:</strong> ${escapeHtml(contact.address || "(none)")}
        </td>
      `;

      listContainer.appendChild(row);
      listContainer.appendChild(detailRow);
    });
  };

  xhr.send(payload);
}

function toggleDetails(id) {
  const detailRow = document.getElementById(`details-${id}`);
  if (!detailRow) return;
  detailRow.style.display = detailRow.style.display === "none" ? "table-row" : "none";
}

function showEditContact(id, firstName, lastName, email, phone, address) {
  document.getElementById("editContactID").value = id;
  document.getElementById("editFirstName").value = firstName;
  document.getElementById("editLastName").value = lastName;
  document.getElementById("editEmail").value = email;
  document.getElementById("editPhone").value = phone;
  document.getElementById("editAddress").value = address;

  document.getElementById("editContactDiv").style.display = "block";
}

function cancelEdit() {
  document.getElementById("editContactDiv").style.display = "none";
  document.getElementById("editContactResult").innerHTML = "";
}

function updateContact() {
  const tmp = {
    contactId: parseInt(document.getElementById("editContactID").value),
    firstName: document.getElementById("editFirstName").value,
    lastName: document.getElementById("editLastName").value,
    email: document.getElementById("editEmail").value,
    phone: document.getElementById("editPhone").value,
    address: document.getElementById("editAddress").value,
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
      setTimeout(() => {
        document.getElementById("editContactDiv").style.display = "none";
        searchContacts();
      }, 1500);
    }
  };

  xhr.send(jsonPayload);
}

function deleteContact(id) {
  const tmp = { ID: id, userID: userId };
  const jsonPayload = JSON.stringify(tmp);
  const url = `${urlBase}/deleteContact.${extension}`;

  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      searchContacts();
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
    window.location.href = "index.html";
  } else {
    document.getElementById("userName").innerHTML = `${firstName} ${lastName}`;
    searchContacts();
  }
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