// Funções globais para a página de cadastros

function updatePagamentoFields() {
    const tipo = document.getElementById('tipoPagamento').value;
    
    // Hide all fields
    document.getElementById('campoPersonalizado').style.display = 'none';
    document.getElementById('campoConta').style.display = 'none';
    document.getElementById('campoCartao').style.display = 'none';
    
    // Show relevant field
    if (tipo === 'personalizado') {
        document.getElementById('campoPersonalizado').style.display = 'block';
    } else if (tipo === 'conta') {
        document.getElementById('campoConta').style.display = 'block';
    } else if (tipo === 'cartao') {
        document.getElementById('campoCartao').style.display = 'block';
    }
}

// Métodos de edição
function editBanco(id) {
    const banco = cadastrosManager.bancos.find(b => b.id === id);
    if (!banco) return;
    
    const novoNome = prompt('Digite o novo nome do banco:', banco.nome);
    if (novoNome && novoNome.trim() !== '') {
        banco.nome = novoNome.trim();
        cadastrosManager.saveData();
        cadastrosManager.renderBancos();
        cadastrosManager.updateSelects();
        cadastrosManager.showNotification('Banco alterado com sucesso!', 'success');
    }
}
function editConta(id) { /* Implementar */ }
function editCartao(id) { /* Implementar */ }
function editCategoriaPagar(index) { /* Implementar */ }
function editCategoriaReceber(index) { /* Implementar */ }
function editFormaPagamento(id) { /* Implementar */ }

// Métodos de remoção
function removeBanco(id) {
    if (confirm('Tem certeza que deseja excluir este banco?')) {
        cadastrosManager.bancos = cadastrosManager.bancos.filter(b => b.id !== id);
        cadastrosManager.contas = cadastrosManager.contas.filter(c => c.banco != id);
        cadastrosManager.cartoes = cadastrosManager.cartoes.filter(c => c.banco != id);
        cadastrosManager.saveData();
        cadastrosManager.renderAll();
        cadastrosManager.updateSelects();
        cadastrosManager.showNotification('Banco removido!', 'success');
    }
}

function removeConta(id) {
    if (confirm('Tem certeza que deseja excluir esta conta?')) {
        cadastrosManager.contas = cadastrosManager.contas.filter(c => c.id !== id);
        cadastrosManager.saveData();
        cadastrosManager.renderContas();
        cadastrosManager.updateSelects();
        cadastrosManager.showNotification('Conta removida!', 'success');
    }
}

function removeCartao(id) {
    if (confirm('Tem certeza que deseja excluir este cartão?')) {
        cadastrosManager.cartoes = cadastrosManager.cartoes.filter(c => c.id !== id);
        cadastrosManager.saveData();
        cadastrosManager.renderCartoes();
        cadastrosManager.updateSelects();
        cadastrosManager.showNotification('Cartão removido!', 'success');
    }
}

function removeCategoriaPagar(index) {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
        cadastrosManager.categoriasPagar.splice(index, 1);
        cadastrosManager.saveData();
        cadastrosManager.renderCategoriasPagar();
        cadastrosManager.showNotification('Categoria removida!', 'success');
    }
}

function removeCategoriaReceber(index) {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
        cadastrosManager.categoriasReceber.splice(index, 1);
        cadastrosManager.saveData();
        cadastrosManager.renderCategoriasReceber();
        cadastrosManager.showNotification('Categoria removida!', 'success');
    }
}

function removeFormaPagamento(id) {
    if (confirm('Tem certeza que deseja excluir esta forma de pagamento?')) {
        cadastrosManager.formasPagamento = cadastrosManager.formasPagamento.filter(f => f.id !== id);
        cadastrosManager.saveData();
        cadastrosManager.renderFormasPagamento();
        cadastrosManager.showNotification('Forma de pagamento removida!', 'success');
    }
}