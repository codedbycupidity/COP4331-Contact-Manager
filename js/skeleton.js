function createSkeletonRow() {
    return `
        <tr class="skeleton-row">
            <td><div class="skeleton skeleton-text ${getRandomWidth()}"></div></td>
            <td><div class="skeleton skeleton-text ${getRandomWidth()}"></div></td>
            <td><div class="skeleton skeleton-text email"></div></td>
            <td><div class="skeleton skeleton-text phone"></div></td>
            <td><div class="skeleton skeleton-button"></div></td>
        </tr>
    `;
}

function getRandomWidth() {
    const widths = ['short', 'medium', 'long'];
    return widths[Math.floor(Math.random() * widths.length)];
}

function showSkeleton(rowCount = 6) {
    console.log('showSkeleton called with rowCount:', rowCount);
    
    const contactsList = document.getElementById('contactsList');
    const searchResult = document.getElementById('searchResult');
    
    if (!contactsList) {
        console.error('contactsList element not found!');
        return;
    }
    
    // Show loading message in the search result area
    if (searchResult) {
        searchResult.textContent = 'Loading contacts...';
        searchResult.style.fontStyle = 'italic';
        searchResult.style.color = 'var(--baseColor)';
    }
    
    // Generate skeleton rows (no loading text row in table)
    let skeletonRows = '';
    const maxRows = Math.min(rowCount, 20);
    
    for (let i = 0; i < maxRows; i++) {
        skeletonRows += createSkeletonRow();
    }
    
    // Set only skeleton rows in the table
    contactsList.innerHTML = skeletonRows;
    
    console.log('Skeleton HTML set successfully');
}

function hideSkeleton() {
    console.log('hideSkeleton called');
    
    const contactsList = document.getElementById('contactsList');
    if (contactsList) {
        contactsList.innerHTML = '';
    }
    
    // Note: Don't clear searchResult here - let the main function handle the final message
}