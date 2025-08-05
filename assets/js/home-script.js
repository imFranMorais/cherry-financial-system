// User profile management
let userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};

function showUserModal() {
    const modal = document.getElementById('userModal');
    modal.style.display = 'block';
    
    // Load existing user data
    if (userProfile.name) {
        document.getElementById('userName').value = userProfile.name;
        document.getElementById('userEmail').value = userProfile.email || '';
        document.getElementById('userPhone').value = userProfile.phone || '';
    }
}

function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('userModal');
    if (event.target === modal) {
        closeUserModal();
    }
}

// Handle user form submission
document.getElementById('userForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    userProfile = {
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        phone: document.getElementById('userPhone').value
    };
    
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    
    // Show success message
    showNotification('Perfil salvo com sucesso!', 'success');
    closeUserModal();
});

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}