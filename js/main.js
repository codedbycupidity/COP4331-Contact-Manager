// Base URL for API endpoints
const urlBase = '/LAMPAPI';
const extension = 'php';

// Global variables
let userId = 0;
let firstName = "";
let lastName = "";

// Page load event handlers
document.addEventListener("DOMContentLoaded", function() {
    // Check if we're on the contacts page
    if (document.getElementById("contactsList")) {
        readCookie();
    }
});

// Toggle between login and register views
function showRegister() {
    document.getElementById("loginDiv").style.display = "none";
    document.getElementById("registerDiv").style.display = "block";
}

function showLogin() {
    document.getElementById("registerDiv").style.display = "none";
    document.getElementById("loginDiv").style.display = "block";
}

// User Authentication Functions
function doLogin() {
    userId = 0;
    firstName = "";
    lastName = "";
    
    let login = document.getElementById("loginName").value;
    let password = document.getElementById("loginPassword").value;
    
    document.getElementById("loginResult").innerHTML = "";

    let tmp = {login:login, password:password};
    let jsonPayload = JSON.stringify(tmp);
    
    // Changed Login.php to login.php (camelCase)
    let url = urlBase + '/login.' + extension;
    
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);
                userId = jsonObject.id;
                
                if (userId < 1) {
                    document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
                    return;
                }
                
                firstName = jsonObject.firstName;
                lastName = jsonObject.lastName;
                
                saveCookie();
                window.location.href = "contacts.html";
            }
        };
        xhr.send(jsonPayload);
    } catch(err) {
        document.getElementById("loginResult").innerHTML = err.message;
    }
}

function doRegister() {
    console.log("Register function called"); // Debug log
    
    let firstNameVal = document.getElementById("firstName").value;
    let lastNameVal = document.getElementById("lastName").value;
    let loginNameVal = document.getElementById("registerName").value;
    let emailVal = document.getElementById("registerEmail").value;
    let passwordVal = document.getElementById("registerPassword").value;
    
    console.log("Values:", firstNameVal, lastNameVal, loginNameVal, emailVal); // Debug log
    
    document.getElementById("registerResult").innerHTML = "";

    let tmp = {
        firstName: firstNameVal,
        lastName: lastNameVal,
        loginName: loginNameVal,
        email: emailVal,
        password: passwordVal
    };
    let jsonPayload = JSON.stringify(tmp);
    console.log("Payload:", jsonPayload); // Debug log
    
    // Changed Register.php to register.php (camelCase)
    let url = urlBase + '/register.' + extension;
    console.log("URL:", url); // Debug log
    
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function() {
            console.log("ReadyState:", this.readyState, "Status:", this.status); // Debug log
            
            if (this.readyState == 4) {
                console.log("Response:", this.responseText); // Debug log
                
                if (this.status == 200) {
                    try {
                        let jsonObject = JSON.parse(xhr.responseText);
                        
                        if (jsonObject.error) {
                            document.getElementById("registerResult").innerHTML = jsonObject.error;
                            return;
                        }
                        
                        document.getElementById("registerResult").innerHTML = "Registration successful! Please log in.";
                        setTimeout(function() {
                            showLogin();
                        }, 2000);
                    } catch (e) {
                        console.error("JSON parse error:", e); // Debug log
                        document.getElementById("registerResult").innerHTML = "Error processing response";
                    }
                } else {
                    document.getElementById("registerResult").innerHTML = "Server error: " + this.status;
                }
            }
        };
        xhr.send(jsonPayload);
    } catch(err) {
        console.error("XHR error:", err); // Debug log
        document.getElementById("registerResult").innerHTML = err.message;
    }
}

function doLogout() {
    userId = 0;
    firstName = "";
    lastName = "";
    document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "lastName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "userId= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "index.html";
}

// Contact Management Functions
function addContact() {
    let firstName = document.getElementById("contactFirstName").value;
    let lastName = document.getElementById("contactLastName").value;
    let email = document.getElementById("contactEmail").value;
    let phoneNumber = document.getElementById("contactPhone").value;
    
    document.getElementById("addContactResult").innerHTML = "";

    let tmp = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phoneNumber: phoneNumber,
        userID: userId
    };
    let jsonPayload = JSON.stringify(tmp);
    
    // Changed AddContact.php to addContact.php (camelCase)
    let url = urlBase + '/addContact.' + extension;
    
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                document.getElementById("addContactResult").innerHTML = "Contact has been added";
                
                // Clear input fields
                document.getElementById("contactFirstName").value = "";
                document.getElementById("contactLastName").value = "";
                document.getElementById("contactEmail").value = "";
                document.getElementById("contactPhone").value = "";
                
                // Refresh contact list
                searchContacts();
            }
        };
        xhr.send(jsonPayload);
    } catch(err) {
        document.getElementById("addContactResult").innerHTML = err.message;
    }
}

function searchContacts() {
    let srch = document.getElementById("searchText").value;
    document.getElementById("searchResult").innerHTML = "";
    
    let tmp = {search:srch, userID:userId};
    let jsonPayload = JSON.stringify(tmp);
    
    // Changed SearchContacts.php to searchContacts.php (camelCase)
    let url = urlBase + '/searchContacts.' + extension;
    
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                document.getElementById("searchResult").innerHTML = "Contacts retrieved";
                let jsonObject = JSON.parse(xhr.responseText);
                
                if (jsonObject.error) {
                    document.getElementById("searchResult").innerHTML = jsonObject.error;
                    return;
                }
                
                // Clear the existing table rows
                document.getElementById("contactsList").innerHTML = "";
                
                // Add each contact to the table
                for (let i = 0; i < jsonObject.results.length; i++) {
                    let contact = jsonObject.results[i];
                    
                    // Create a new row
                    let row = document.createElement("tr");
                    
                    // First Name
                    let firstNameTd = document.createElement("td");
                    firstNameTd.textContent = contact.firstName;
                    row.appendChild(firstNameTd);
                    
                    // Last Name
                    let lastNameTd = document.createElement("td");
                    lastNameTd.textContent = contact.lastName;
                    row.appendChild(lastNameTd);
                    
                    // Email
                    let emailTd = document.createElement("td");
                    emailTd.textContent = contact.email;
                    row.appendChild(emailTd);
                    
                    // Phone
                    let phoneTd = document.createElement("td");
                    phoneTd.textContent = contact.phoneNumber;
                    row.appendChild(phoneTd);
                    
                    // Actions
                    let actionsTd = document.createElement("td");
                    
                    // Edit button
                    let editBtn = document.createElement("button");
                    editBtn.textContent = "Edit";
                    editBtn.onclick = function() {
                        showEditContact(contact);
                    };
                    actionsTd.appendChild(editBtn);
                    
                    // Space
                    actionsTd.appendChild(document.createTextNode(" "));
                    
                    // Delete button
                    let deleteBtn = document.createElement("button");
                    deleteBtn.textContent = "Delete";
                    deleteBtn.onclick = function() {
                        if (confirm("Are you sure you want to delete this contact?")) {
                            deleteContact(contact.ID);
                        }
                    };
                    actionsTd.appendChild(deleteBtn);
                    
                    row.appendChild(actionsTd);
                    
                    // Add row to table
                    document.getElementById("contactsList").appendChild(row);
                }
            }
        };
        xhr.send(jsonPayload);
    } catch(err) {
        document.getElementById("searchResult").innerHTML = err.message;
    }
}

function showEditContact(contact) {
    document.getElementById("editContactID").value = contact.ID;
    document.getElementById("editFirstName").value = contact.firstName;
    document.getElementById("editLastName").value = contact.lastName;
    document.getElementById("editEmail").value = contact.email;
    document.getElementById("editPhone").value = contact.phoneNumber;
    
    document.getElementById("editContactDiv").style.display = "block";
}

function cancelEdit() {
    document.getElementById("editContactDiv").style.display = "none";
    document.getElementById("editContactResult").innerHTML = "";
}

function updateContact() {
    let id = document.getElementById("editContactID").value;
    let firstName = document.getElementById("editFirstName").value;
    let lastName = document.getElementById("editLastName").value;
    let email = document.getElementById("editEmail").value;
    let phoneNumber = document.getElementById("editPhone").value;
    
    document.getElementById("editContactResult").innerHTML = "";

    let tmp = {
        ID: id,
        firstName: firstName,
        lastName: lastName,
        email: email,
        phoneNumber: phoneNumber,
        userID: userId
    };
    let jsonPayload = JSON.stringify(tmp);
    
    // Changed UpdateContact.php to updateContact.php (camelCase)
    let url = urlBase + '/updateContact.' + extension;
    
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                document.getElementById("editContactResult").innerHTML = "Contact has been updated";
                
                // Hide edit form after a brief delay
                setTimeout(function() {
                    document.getElementById("editContactDiv").style.display = "none";
                    
                    // Refresh contacts
                    searchContacts();
                }, 1500);
            }
        };
        xhr.send(jsonPayload);
    } catch(err) {
        document.getElementById("editContactResult").innerHTML = err.message;
    }
}

function deleteContact(id) {
    let tmp = {ID:id, userID:userId};
    let jsonPayload = JSON.stringify(tmp);
    
    // Changed DeleteContact.php to deleteContact.php (camelCase)
    let url = urlBase + '/deleteContact.' + extension;
    
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                // Refresh contacts
                searchContacts();
            }
        };
        xhr.send(jsonPayload);
    } catch(err) {
        document.getElementById("searchResult").innerHTML = err.message;
    }
}

// Cookie Functions
function saveCookie() {
    let minutes = 20;
    let date = new Date();
    date.setTime(date.getTime() + (minutes * 60 * 1000));
    document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie() {
    userId = -1;
    let data = document.cookie;
    let splits = data.split(",");
    for (let i = 0; i < splits.length; i++) {
        let thisOne = splits[i].trim();
        let tokens = thisOne.split("=");
        if (tokens[0] == "firstName") {
            firstName = tokens[1];
        } else if (tokens[0] == "lastName") {
            lastName = tokens[1];
        } else if (tokens[0] == "userId") {
            userId = parseInt(tokens[1].trim());
        }
    }
    
    if (userId < 1) {
        window.location.href = "index.html";
    } else {
        document.getElementById("userName").innerHTML = firstName + " " + lastName;
        
        // Load contacts
        searchContacts();
    }
}