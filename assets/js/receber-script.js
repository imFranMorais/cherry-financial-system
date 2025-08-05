class ReceberManager {
    constructor() {
        this.contasReceber = JSON.parse(localStorage.getItem('contasReceber')) || [];
        this.categorias = JSON.parse(localStorage.getItem('categoriasReceber')) || [];
        this.formasPagamento = JSON.parse(localStorage.getItem('formasPagamento')) || [];
        this.currentReceiveId = null;
        this.currentDeleteId = null;
        
        this.init();
    }

    init() {
        this.loadUserName();
        this.loadCategories();
        this.loadContas();
        this.populateFilters();
        this.renderAccounts();
        this.setupEventListeners();
    }

    loadUserName() {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData && userData.name) {
            const firstName = userData.name.split(' ')[0];
            const userNameNav = document.getElementById('userNameNav');
            if (userNameNav) {
                userNameNav.textContent = firstName;
            }
        }
    }

    loadCategories() {
        const categoriaSelect = document.getElementById('categoria');
        categoriaSelect.innerHTML = '<option value="">Selecione uma categoria</option>';
        
        this.categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria;
            option.textContent = categoria.charAt(0).toUpperCase() + categoria.slice(1);
            categoriaSelect.appendChild(option);
        });
        
        this.loadFormasRecebimento();
    }
    
    loadFormasRecebimento() {
        const formaRecebimentoSelect = document.getElementById('formaRecebimento');
        if (formaRecebimentoSelect) {
            formaRecebimentoSelect.innerHTML = '<option value="">Selecione a forma</option>';
            
            this.formasPagamento.forEach(forma => {
                const option = document.createElement('option');
                option.value = forma.id;
                option.textContent = forma.nome;
                formaRecebimentoSelect.appendChild(option);
            });
        }
    }
    
    loadContas() {
        const contas = JSON.parse(localStorage.getItem('contas')) || [];
        const bancos = JSON.parse(localStorage.getItem('bancos')) || [];
        
        const contaSelect = document.getElementById('contaRecebimento');
        if (contaSelect) {
            contaSelect.innerHTML = '<option value="">Selecione a conta</option>';
            
            contas.forEach(conta => {
                const banco = bancos.find(b => b.id == conta.banco);
                const option = document.createElement('option');
                option.value = conta.id;
                option.textContent = `${conta.nome} - ${banco ? banco.nome : 'N/A'}`;
                contaSelect.appendChild(option);
            });
        }
    }

    setupEventListeners() {
        document.getElementById('addAccountForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addAccount();
        });

        document.getElementById('receiveForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveReceive();
        });
    }

    addAccount() {
        const nome = document.getElementById('nomeReceita').value;
        const categoria = document.getElementById('categoria').value;
        const valor = parseFloat(document.getElementById('valor').value);
        const dataPrevista = document.getElementById('dataPrevista').value;


        const conta = {
            id: Date.now(),
            nome: nome,
            categoria: categoria,
            valor: valor,
            dataPrevista: dataPrevista,
            status: 'pendente',

            dataCadastro: new Date().toISOString()
        };

        this.contasReceber.push(conta);
        this.saveData();
        this.renderAccounts();
        closeAddModal();
        this.showNotification('Conta adicionada com sucesso!', 'success');
    }

    populateFilters() {
        // Populate years
        const years = [...new Set(this.contasReceber.map(c => new Date(c.dataPrevista).getFullYear()))];
        const yearSelect = document.getElementById('filterYear');
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });
        
        // Populate categories
        const categorySelect = document.getElementById('filterCategory');
        this.categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria;
            option.textContent = categoria.charAt(0).toUpperCase() + categoria.slice(1);
            categorySelect.appendChild(option);
        });
    }

    getFilteredAccounts() {
        const month = document.getElementById('filterMonth').value;
        const year = document.getElementById('filterYear').value;
        const category = document.getElementById('filterCategory').value;
        const status = document.getElementById('filterStatus').value;
        
        return this.contasReceber.filter(conta => {
            const contaDate = new Date(conta.dataPrevista);
            const contaMonth = contaDate.getMonth() + 1;
            const contaYear = contaDate.getFullYear();
            const hoje = new Date();
            
            // Determinar status para filtro
            let statusFiltro = conta.status;
            if (conta.status !== 'recebido') {
                statusFiltro = contaDate < hoje ? 'vencida' : 'a_receber';
            }
            
            return (month === 'all' || contaMonth == month) &&
                   (year === 'all' || contaYear == year) &&
                   (category === 'all' || conta.categoria === category) &&
                   (status === 'all' || statusFiltro === status);
        });
    }

    renderAccounts() {
        const lista = document.getElementById('accountsList');
        lista.innerHTML = '';
        
        this.updateAddButton();

        if (this.contasReceber.length === 0) {
            lista.innerHTML = '<div class="empty-state">Nenhuma conta cadastrada</div>';
            return;
        }
        
        let filteredAccounts = this.getFilteredAccounts();
        
        // Apply sorting
        const sortBy = document.getElementById('sortBy').value;
        filteredAccounts.sort((a, b) => {
            switch (sortBy) {
                case 'vencimento':
                    return new Date(a.dataPrevista) - new Date(b.dataPrevista);
                case 'recebimento':
                    const dateA = a.dataRecebimento ? new Date(a.dataRecebimento) : new Date('9999-12-31');
                    const dateB = b.dataRecebimento ? new Date(b.dataRecebimento) : new Date('9999-12-31');
                    return dateA - dateB;
                case 'valor':
                    return b.valor - a.valor;
                case 'nome':
                    return a.nome.localeCompare(b.nome);
                default:
                    return 0;
            }
        });
        
        if (filteredAccounts.length === 0) {
            lista.innerHTML = '<div class="empty-state">Nenhuma conta encontrada com os filtros aplicados</div>';
            return;
        }

        filteredAccounts.forEach(conta => {
            const hoje = new Date();
            const dataPrevista = new Date(conta.dataPrevista);
            
            // Determinar status visual
            let statusVisual = conta.status;
            let statusText = '';
            let statusClass = '';
            
            if (conta.status === 'recebido') {
                statusText = 'Recebido';
                statusClass = 'recebido';
            } else {
                // Conta pendente - verificar se passou da data
                if (dataPrevista < hoje) {
                    statusVisual = 'vencida';
                    statusText = 'Atrasada';
                    statusClass = 'vencida';
                } else {
                    statusVisual = 'a_receber';
                    statusText = 'A Receber';
                    statusClass = 'a_receber';
                }
            }
            
            const isAtrasado = dataPrevista < hoje && conta.status !== 'recebido';
            const recebeHoje = dataPrevista.toDateString() === hoje.toDateString() && conta.status !== 'recebido';

            const item = document.createElement('div');
            item.className = `account-item ${isAtrasado ? 'vencido' : ''} ${recebeHoje ? 'vence-hoje' : ''}`;
            
            item.innerHTML = `
                <div class="account-info">
                    <h3>${conta.nome}</h3>
                    <p><strong>Categoria:</strong> ${conta.categoria}</p>
                    <p><strong>Data Prevista:</strong> ${this.formatDate(conta.dataPrevista)}</p>

                    ${conta.dataRecebimento ? `<p><strong>Recebido em:</strong> ${this.formatDate(conta.dataRecebimento)}</p>` : ''}
                    ${conta.formaRecebimento ? `<p><strong>Forma:</strong> ${this.formatReceiveMethod(conta.formaRecebimento)}</p>` : ''}
                </div>
                <div class="account-value">R$ ${conta.valor.toFixed(2)}</div>
                <div class="status-toggle">
                    <button class="status-btn ${statusClass}" onclick="${conta.status !== 'recebido' ? `receberManager.openReceiveModal(${conta.id})` : `receberManager.toggleStatus(${conta.id})`}">
                        ${statusText}
                    </button>
                    <button class="btn-small btn-danger" onclick="receberManager.openDeleteModal(${conta.id})">Excluir</button>
                </div>
            `;
            
            lista.appendChild(item);
        });
    }

    updateAddButton() {
        const addBtn = document.getElementById('addBtn');
        if (this.contasReceber.length === 0) {
            addBtn.textContent = 'Nova Conta a Receber';
            addBtn.classList.remove('compact');
        } else {
            addBtn.textContent = '+';
            addBtn.classList.add('compact');
        }
    }

    openReceiveModal(id) {
        this.currentReceiveId = id;
        document.getElementById('dataRecebimento').value = new Date().toISOString().split('T')[0];
        document.getElementById('receiveModal').style.display = 'flex';
    }
    
    saveReceive() {
        const dataRecebimento = document.getElementById('dataRecebimento').value;
        const formaRecebimento = document.getElementById('formaRecebimento').value;
        
        if (!dataRecebimento || !formaRecebimento) {
            this.showNotification('Preencha todos os campos!', 'error');
            return;
        }
        
        const conta = this.contasReceber.find(c => c.id === this.currentReceiveId);
        if (conta) {
            conta.status = 'recebido';
            conta.dataRecebimento = dataRecebimento;
            conta.formaRecebimento = formaRecebimento;
            
            this.saveData();
            this.renderAccounts();
            closeReceiveModal();
            this.showNotification('Recebimento registrado com sucesso!', 'success');
        }
    }

    toggleStatus(id) {
        const conta = this.contasReceber.find(c => c.id === id);
        if (conta) {
            conta.status = conta.status === 'pendente' ? 'recebido' : 'pendente';
            if (conta.status === 'recebido') {
                conta.dataRecebimento = new Date().toISOString().split('T')[0];
            } else {
                delete conta.dataRecebimento;
                delete conta.formaRecebimento;
            }
            this.saveData();
            this.renderAccounts();
        }
    }

    openDeleteModal(id) {
        const conta = this.contasReceber.find(c => c.id === id);
        if (!conta) return;
        
        this.currentDeleteId = id;
        document.getElementById('deleteMessage').textContent = 
            `Tem certeza que deseja excluir "${conta.nome}"?`;
        document.getElementById('deleteModal').style.display = 'flex';
    }
    
    executeDelete() {
        this.contasReceber = this.contasReceber.filter(c => c.id !== this.currentDeleteId);
        this.saveData();
        this.renderAccounts();
        this.showNotification('Conta removida!', 'success');
    }

    sortAccounts() {
        this.renderAccounts();
    }
    
    filterAccounts() {
        this.renderAccounts();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }
    
    formatReceiveMethod(method) {
        const methods = {
            'dinheiro': 'Dinheiro',
            'cartao_debito': 'Cartão de Débito',
            'cartao_credito': 'Cartão de Crédito',
            'pix': 'PIX',
            'transferencia': 'Transferência',
            'deposito': 'Depósito',
            'cheque': 'Cheque'
        };
        return methods[method] || method;
    }

    saveData() {
        localStorage.setItem('contasReceber', JSON.stringify(this.contasReceber));
        localStorage.setItem('categoriasReceber', JSON.stringify(this.categorias));
    }

    showNotification(message, type = 'success') {
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
}

// Global functions
function openAddModal() {
    document.getElementById('addModal').style.display = 'flex';
}

function closeAddModal() {
    document.getElementById('addModal').style.display = 'none';
    document.getElementById('addAccountForm').reset();

    document.getElementById('newCategoryInput').style.display = 'none';
}



function showNewCategoryInput() {
    document.getElementById('newCategoryInput').style.display = 'flex';
}

function addNewCategory() {
    const novaCategoria = document.getElementById('novaCategoria').value.trim();
    if (novaCategoria && !receberManager.categorias.includes(novaCategoria.toLowerCase())) {
        receberManager.categorias.push(novaCategoria.toLowerCase());
        receberManager.loadCategories();
        document.getElementById('categoria').value = novaCategoria.toLowerCase();
        document.getElementById('newCategoryInput').style.display = 'none';
        document.getElementById('novaCategoria').value = '';
        receberManager.saveData();
    }
}

function hideNewCategoryInput() {
    document.getElementById('newCategoryInput').style.display = 'none';
    document.getElementById('novaCategoria').value = '';
}

function closeReceiveModal() {
    document.getElementById('receiveModal').style.display = 'none';
    document.getElementById('receiveForm').reset();
    receberManager.currentReceiveId = null;
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    receberManager.currentDeleteId = null;
}

function confirmDelete() {
    receberManager.executeDelete();
    closeDeleteModal();
}

function sortAccounts() {
    receberManager.sortAccounts();
}

function filterAccounts() {
    receberManager.filterAccounts();
}

function clearFilters() {
    document.getElementById('filterMonth').value = 'all';
    document.getElementById('filterYear').value = 'all';
    document.getElementById('filterCategory').value = 'all';
    document.getElementById('filterStatus').value = 'all';
    receberManager.renderAccounts();
}

// Initialize
const receberManager = new ReceberManager();