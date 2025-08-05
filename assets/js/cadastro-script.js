// Handle cadastro form submission
document.getElementById('cadastroForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nomeCompleto = document.getElementById('nomeCompleto').value;
    const email = document.getElementById('emailCadastro').value;
    const senha = document.getElementById('senhaCadastro').value;
    const repetirSenha = document.getElementById('repetirSenha').value;
    
    // Validation
    if (!nomeCompleto || !email || !senha || !repetirSenha) {
        showNotification('Por favor, preencha todos os campos!', 'error');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Por favor, digite um email válido!', 'error');
        return;
    }
    
    if (senha !== repetirSenha) {
        showNotification('As senhas não coincidem!', 'error');
        return;
    }
    
    if (senha.length < 6) {
        showNotification('A senha deve ter pelo menos 6 caracteres!', 'error');
        return;
    }
    
    // Save user data
    const userData = {
        name: nomeCompleto,
        email: email,
        password: senha // In a real app, this would be hashed
    };
    
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('isRegistered', 'true');
    
    showNotification('Cadastro realizado com sucesso!', 'success');
    
    // Redirect to login page after success
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);
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