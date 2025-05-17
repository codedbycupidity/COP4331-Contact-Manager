const titleTemplate = `
    <h1 class="text-center my-5">Contact Manager</h1>
`;

/**
 * Initialize the application
 */
$(document).ready(function() {
    // Get the app container
    const appContainer = $('#app');
    
    // Create a main container
    const mainContainer = $('<div class="container"></div>');
    
    // Add the title
    mainContainer.append(titleTemplate);
    
    // Add the main container to the app
    appContainer.append(mainContainer);
    
    console.log('Contact Manager initialized successfully');
});