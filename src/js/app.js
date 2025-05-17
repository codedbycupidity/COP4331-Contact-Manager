// Main app
const App = {
    // Current user data
    userData: null,
    
    /**
 * Initialize the application
 */

    init: function() {
        // Create a main container
        const appContainer = $('#app');
        const mainContainer = $('<div class="container"></div>');
        
        // Add the header
        mainContainer.append('<h1 class="text-center my-4">Contact Manager</h1>');
        
        // Add container for login component
        mainContainer.append('<div id="loginContainer"></div>');
        
        // Add the main container to the app
        appContainer.append(mainContainer);
        
        // Initialize components
        this.initComponents();
    },
    
    // Initialize all components
    initComponents: function() {
        // Initialize the login component
        this.userData = Login.init('#loginContainer', (userData) => {
            // Login success callback
            this.userData = userData;
            Login.hide();
            
            // Show success message
            const successMessage = $('<div class="alert alert-success text-center mt-4">Login successful, ' + userData.firstName + '!</div>');
            $('#loginContainer').after(successMessage);
        });
    }
};

// Initialize the app on document ready
$(document).ready(function() {
    App.init();
    console.log('Contact Manager initialized successfully');
});