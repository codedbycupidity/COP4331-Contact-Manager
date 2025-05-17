/**
 * Handles user authentication and session management
 */

// Login component
const Login = {
    // HTML template for the login component
    template: `
        <div id="loginSection" class="login-container">
            <div class="card">
                <div class="card-header bg-primary text-white">
                    <h3>Login</h3>
                </div>
                <div class="card-body">
                    <form id="loginForm">
                        <div class="mb-3">
                            <label for="loginUsername" class="form-label">Username</label>
                            <input type="text" class="form-control" id="loginUsername" placeholder="Enter your username" required>
                        </div>
                        <div class="mb-3">
                            <label for="loginPassword" class="form-label">Password</label>
                            <input type="password" class="form-control" id="loginPassword" placeholder="Enter your password" required>
                        </div>
                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-primary">Login</button>
                        </div>
                        <div id="loginErrorMessage" class="alert alert-danger mt-3" style="display: none;"></div>
                    </form>
                    <div class="mt-3 text-center">
                        <p>Don't have an account? <a href="#" id="showRegister">Register here</a></p>
                    </div>
                </div>
            </div>
        </div>
    `,

    // Initialize the component
    init: function(container, onLoginSuccess) {
        // Store reference to the callback
        this.onLoginSuccess = onLoginSuccess || function() {};
        
        // Render the component
        this.render(container);
        
        // Setup event handlers
        this.setupEventHandlers();
        
        // Check if user is already logged in (from localStorage)
        return this.checkLoginStatus();
    },

    // Render the component
    render: function(container) {
        $(container).html(this.template);
    },

    // Setup event handlers
    setupEventHandlers: function() {
        // Login form submission
        $("#loginForm").submit((e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Show register event (to be implemented later)
        $(document).on('click', '#showRegister', function(e) {
            e.preventDefault();
            // This would be implemented when you add the register component
            console.log('Show register form (not implemented yet)');
        });
    },

    // Handle login form submission
    handleLogin: function() {
        const loginData = {
            login: $("#loginUsername").val(),
            password: $("#loginPassword").val()
        };
        
        // Show loading indicator
        $("#loginForm button").html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...').prop('disabled', true);
        
        // Reset error message
        $("#loginErrorMessage").hide();
        
        // AJAX call to login API
        $.ajax({
            url: 'src/api/login.php',
            type: 'POST',
            data: JSON.stringify(loginData),
            contentType: 'application/json',
            dataType: 'json',
            success: (response) => {
                if (response.error) {
                    $("#loginErrorMessage").text(response.error).show();
                    $("#loginForm button").html('Login').prop('disabled', false);
                } else {
                    // Store user info
                    const userData = {
                        id: response.id,
                        firstName: response.firstName,
                        lastName: response.lastName,
                        email: response.email
                    };
                    
                    // Save to localStorage for persistence
                    this.saveUserData(userData);
                    
                    // Reset form
                    $("#loginForm")[0].reset();
                    $("#loginForm button").html('Login').prop('disabled', false);
                    
                    // Call the success callback
                    this.onLoginSuccess(userData);
                }
            },
            error: (xhr, status, error) => {
                $("#loginErrorMessage").text("Server error. Please try again later.").show();
                $("#loginForm button").html('Login').prop('disabled', false);
            }
        });
    },

    // Check if user is already logged in
    checkLoginStatus: function() {
        const userId = localStorage.getItem('userId');
        if (userId) {
            const userData = {
                id: userId,
                firstName: localStorage.getItem('userFirstName'),
                lastName: localStorage.getItem('userLastName'),
                email: localStorage.getItem('userEmail')
            };
            
            // Call the success callback with the user data
            this.onLoginSuccess(userData);
            return userData;
        }
        return null;
    },

    // Save user data to localStorage
    saveUserData: function(userData) {
        localStorage.setItem('userId', userData.id);
        localStorage.setItem('userFirstName', userData.firstName);
        localStorage.setItem('userLastName', userData.lastName);
        localStorage.setItem('userEmail', userData.email);
    },

    // Clear user data from localStorage
    clearUserData: function() {
        localStorage.removeItem('userId');
        localStorage.removeItem('userFirstName');
        localStorage.removeItem('userLastName');
        localStorage.removeItem('userEmail');
    },
    
    // Show the login form (for logout)
    show: function() {
        $("#loginSection").show();
    },
    
    // Hide the login form (after successful login)
    hide: function() {
        $("#loginSection").hide();
    }
};

// Export the Login component
window.Login = Login;