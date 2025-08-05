// Função para alternar entre abas dentro dos bancos
function showBancoTab(bancoId, tabName) {
    // Remove active class from all tabs for this bank
    const tabs = document.querySelectorAll(`#contas-${bancoId} .banco-tab-btn`);
    const contents = document.querySelectorAll(`#contas-${bancoId} .banco-tab-content`);
    
    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));
    
    // Add active class to clicked tab and corresponding content
    event.target.classList.add('active');
    document.getElementById(`${tabName}-tab-${bancoId}`).classList.add('active');
}

// Função para alternar entre abas de categorias
function showCategoriaTab(tabName) {
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.categoria-tab-btn');
    const contents = document.querySelectorAll('.categoria-tab-content');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));
    
    // Add active class to clicked tab and corresponding content
    event.target.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}