class PagarManager {
    constructor() {
        this.contasPagar = JSON.parse(localStorage.getItem('contasPagar')) || [];
        this.categorias = JSON.parse(localStorage.getItem('categoriasPagar')) || [];
        this.formasPagamento = JSON.parse(localStorage.getItem('formasPagamento')) || [];
        this.currentPaymentId = null;
        this.currentDeleteId = null;
        
        this.init();
    }

    init() {
        this.loadUserName();
        this.loadCategories();
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
        
        this.loadFormasPagamento();
    }
    
    loadFormasPagamento() {
        const formaPagamentoSelect = document.getElementById('formaPagamento');
        if (formaPagamentoSelect) {
            formaPagamentoSelect.innerHTML = '<option value="">Selecione a forma</option>';
            
            this.formasPagamento.forEach(forma => {
                const option = document.createElement('option');
                option.value = forma.id;
                option.textContent = forma.nome;
                formaPagamentoSelect.appendChild(option);
            });
        }
    }

    setupEventListeners() {
        document.getElementById('addAccountForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addAccount();
        });

        // Radio button listeners
        document.querySelectorAll('input[name="tipoCartao"]').forEach(radio => {
            radio.addEventListener('change', this.toggleParcelasInput);
        });
        
        document.getElementById('paymentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePayment();
        });
    }

    toggleParcelasInput() {
        const parcelasGroup = document.getElementById('parcelasGroup');
        const isParcelado = document.querySelector('input[name="tipoCartao"]:checked').value === 'parcelado';
        parcelasGroup.style.display = isParcelado ? 'block' : 'none';
    }

    addAccount() {
        const nome = document.getElementById('nomeDespesa').value;
        const categoria = document.getElementById('categoria').value;
        const valor = parseFloat(document.getElementById('valor').value);
        const vencimento = document.getElementById('vencimento').value;
        const isCartao = document.getElementById('isCartaoCredito').checked;
        
        let parcelas = 1;
        if (isCartao) {
            const tipoCartao = document.querySelector('input[name="tipoCartao"]:checked').value;
            if (tipoCartao === 'parcelado') {
                parcelas = parseInt(document.getElementById('numeroParcelas').value) || 1;
            }
        }

        const valorParcela = valor / parcelas;
        const dataVencimento = new Date(vencimento);

        for (let i = 0; i < parcelas; i++) {
            const dataParcelaVencimento = new Date(dataVencimento);
            dataParcelaVencimento.setMonth(dataParcelaVencimento.getMonth() + i);

            const conta = {
                id: Date.now() + i,
                nome: parcelas > 1 ? `${nome} (${i + 1}/${parcelas})` : nome,
                categoria: categoria,
                valor: valorParcela,
                vencimento: dataParcelaVencimento.toISOString().split('T')[0],
                status: 'pendente',
                isCartao: isCartao,
                parcela: i + 1,
                totalParcelas: parcelas,
                dataCadastro: new Date().toISOString()
            };

            this.contasPagar.push(conta);
        }

        this.saveData();
        this.renderAccounts();
        closeAddModal();
        this.showNotification('Conta(s) adicionada(s) com sucesso!', 'success');
    }
    
    updateAddButton() {
        const addBtn = document.getElementById('addBtn');
        if (this.contasPagar.length === 0) {
            addBtn.textContent = 'Nova Conta a Pagar';
            addBtn.classList.remove('compact');
        } else {
            addBtn.textContent = '+';
            addBtn.classList.add('compact');
        }
    }

    renderAccounts() {
        const lista = document.getElementById('accountsList');
        lista.innerHTML = '';
        
        this.updateAddButton();

        if (this.contasPagar.length === 0) {
            lista.innerHTML = '<div class="empty-state">Nenhuma conta cadastrada</div>';
            return;
        }
        
        let filteredAccounts = this.getFilteredAccounts();
        
        // Apply sorting
        const sortBy = document.getElementById('sortBy').value;
        filteredAccounts.sort((a, b) => {
            switch (sortBy) {
                case 'vencimento':
                    return new Date(a.vencimento) - new Date(b.vencimento);
                case 'pagamento':
                    const dateA = a.dataPagamento ? new Date(a.dataPagamento) : new Date('9999-12-31');
                    const dateB = b.dataPagamento ? new Date(b.dataPagamento) : new Date('9999-12-31');
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
            const vencimento = new Date(conta.vencimento);
            
            // Determinar status visual
            let statusVisual = conta.status;
            let statusText = '';
            let statusClass = '';
            
            if (conta.status === 'pago') {
                statusText = 'Pago';
                statusClass = 'pago';
            } else {
                // Conta pendente - verificar se venceu
                if (vencimento < hoje) {
                    statusVisual = 'vencida';
                    statusText = 'Vencida';
                    statusClass = 'vencida';
                } else {
                    statusVisual = 'a_pagar';
                    statusText = 'A Pagar';
                    statusClass = 'a_pagar';
                }
            }
            
            const isVencido = vencimento < hoje && conta.status !== 'pago';
            const venceHoje = vencimento.toDateString() === hoje.toDateString() && conta.status !== 'pago';

            const item = document.createElement('div');
            item.className = `account-item ${isVencido ? 'vencido' : ''} ${venceHoje ? 'vence-hoje' : ''}`;
            
            item.innerHTML = `
                <div class="account-info">
                    <h3>${conta.nome}</h3>
                    <p><strong>Categoria:</strong> ${conta.categoria}</p>
                    <p><strong>Vencimento:</strong> ${this.formatDate(conta.vencimento)}</p>
                    ${conta.totalParcelas > 1 ? `<p><strong>Parcela:</strong> ${conta.parcela}/${conta.totalParcelas}</p>` : ''}
                    ${conta.isCartao ? '<p><strong>Cartão de Crédito</strong></p>' : ''}
                    ${conta.dataPagamento ? `<p><strong>Pago em:</strong> ${this.formatDate(conta.dataPagamento)}</p>` : ''}
                    ${conta.formaPagamento ? `<p><strong>Forma:</strong> ${this.formatPaymentMethod(conta.formaPagamento)}</p>` : ''}
                </div>
                <div class="account-value">R$ ${conta.valor.toFixed(2)}</div>
                <div class="status-toggle">
                    <button class="status-btn ${statusClass}" onclick="${conta.status !== 'pago' ? `pagarManager.openPaymentModal(${conta.id})` : `pagarManager.toggleStatus(${conta.id})`}">
                        ${statusText}
                    </button>
                    <button class="btn-small btn-danger" onclick="pagarManager.openDeleteModal(${conta.id})">Excluir</button>
                </div>
            `;
            
            lista.appendChild(item);
        });
    }

    toggleStatus(id) {
        const conta = this.contasPagar.find(c => c.id === id);
        if (conta) {
            conta.status = conta.status === 'pendente' ? 'pago' : 'pendente';
            if (conta.status === 'pago') {
                conta.dataPagamento = new Date().toISOString().split('T')[0];
            } else {
                delete conta.dataPagamento;
            }
            this.saveData();
            this.renderAccounts();
        }
    }

    openDeleteModal(id) {
        const conta = this.contasPagar.find(c => c.id === id);
        if (!conta) return;
        
        this.currentDeleteId = id;
        
        // Configurar modal baseado no tipo de conta
        if (conta.totalParcelas > 1) {
            document.getElementById('deleteMessage').textContent = 
                `Tem certeza que deseja excluir "${conta.nome}"?`;
            document.getElementById('parcelasOptions').style.display = 'block';
        } else {
            document.getElementById('deleteMessage').textContent = 
                `Tem certeza que deseja excluir "${conta.nome}"?`;
            document.getElementById('parcelasOptions').style.display = 'none';
        }
        
        document.getElementById('deleteModal').style.display = 'flex';
    }
    
    executeDelete() {
        const conta = this.contasPagar.find(c => c.id === this.currentDeleteId);
        if (!conta) return;
        
        if (conta.totalParcelas > 1) {
            const deleteType = document.querySelector('input[name="deleteType"]:checked').value;
            
            if (deleteType === 'all') {
                // Excluir todas as parcelas relacionadas
                const nomeBase = conta.nome.replace(/ \(\d+\/\d+\)$/, '');
                this.contasPagar = this.contasPagar.filter(c => {
                    const nomeBaseConta = c.nome.replace(/ \(\d+\/\d+\)$/, '');
                    return nomeBaseConta !== nomeBase || c.totalParcelas !== conta.totalParcelas;
                });
                this.showNotification('Todas as parcelas foram removidas!', 'success');
            } else {
                // Excluir apenas esta parcela
                this.contasPagar = this.contasPagar.filter(c => c.id !== this.currentDeleteId);
                this.showNotification('Parcela removida!', 'success');
            }
        } else {
            // Conta não parcelada, excluir normalmente
            this.contasPagar = this.contasPagar.filter(c => c.id !== this.currentDeleteId);
            this.showNotification('Conta removida!', 'success');
        }
        
        this.saveData();
        this.renderAccounts();
    }

    populateFilters() {
        // Populate years
        const years = [...new Set(this.contasPagar.map(c => new Date(c.vencimento).getFullYear()))];
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
        
        return this.contasPagar.filter(conta => {
            const contaDate = new Date(conta.vencimento);
            const contaMonth = contaDate.getMonth() + 1;
            const contaYear = contaDate.getFullYear();
            const hoje = new Date();
            
            // Determinar status para filtro
            let statusFiltro = conta.status;
            if (conta.status !== 'pago') {
                statusFiltro = contaDate < hoje ? 'vencida' : 'a_pagar';
            }
            
            return (month === 'all' || contaMonth == month) &&
                   (year === 'all' || contaYear == year) &&
                   (category === 'all' || conta.categoria === category) &&
                   (status === 'all' || statusFiltro === status);
        });
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
    
    formatPaymentMethod(method) {
        const methods = {
            'dinheiro': 'Dinheiro',
            'cartao_debito': 'Cartão de Débito',
            'cartao_credito': 'Cartão de Crédito',
            'pix': 'PIX',
            'transferencia': 'Transferência',
            'boleto': 'Boleto'
        };
        return methods[method] || method;
    }

    saveData() {
        localStorage.setItem('contasPagar', JSON.stringify(this.contasPagar));
        localStorage.setItem('categoriasPagar', JSON.stringify(this.categorias));
    }

    openPaymentModal(id) {
        this.currentPaymentId = id;
        document.getElementById('dataPagamento').value = new Date().toISOString().split('T')[0];
        document.getElementById('paymentModal').style.display = 'flex';
    }
    
    savePayment() {
        const dataPagamento = document.getElementById('dataPagamento').value;
        const formaPagamento = document.getElementById('formaPagamento').value;
        
        if (!dataPagamento || !formaPagamento) {
            this.showNotification('Preencha todos os campos!', 'error');
            return;
        }
        
        const conta = this.contasPagar.find(c => c.id === this.currentPaymentId);
        if (conta) {
            conta.status = 'pago';
            conta.dataPagamento = dataPagamento;
            conta.formaPagamento = formaPagamento;
            
            this.saveData();
            this.renderAccounts();
            closePaymentModal();
            this.showNotification('Pagamento registrado com sucesso!', 'success');
        }
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
    document.getElementById('cartaoOptions').style.display = 'none';
    document.getElementById('parcelasGroup').style.display = 'none';
    document.getElementById('newCategoryInput').style.display = 'none';
}

function toggleCartaoOptions() {
    const isChecked = document.getElementById('isCartaoCredito').checked;
    document.getElementById('cartaoOptions').style.display = isChecked ? 'block' : 'none';
}

function showNewCategoryInput() {
    document.getElementById('newCategoryInput').style.display = 'flex';
}

function addNewCategory() {
    const novaCategoria = document.getElementById('novaCategoria').value.trim();
    if (novaCategoria && !pagarManager.categorias.includes(novaCategoria.toLowerCase())) {
        pagarManager.categorias.push(novaCategoria.toLowerCase());
        pagarManager.loadCategories();
        document.getElementById('categoria').value = novaCategoria.toLowerCase();
        document.getElementById('newCategoryInput').style.display = 'none';
        document.getElementById('novaCategoria').value = '';
        pagarManager.saveData();
    }
}

function hideNewCategoryInput() {
    document.getElementById('newCategoryInput').style.display = 'none';
    document.getElementById('novaCategoria').value = '';
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
    document.getElementById('paymentForm').reset();
    pagarManager.currentPaymentId = null;
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    pagarManager.currentDeleteId = null;
    // Reset radio buttons
    document.querySelector('input[name="deleteType"][value="single"]').checked = true;
}

function confirmDelete() {
    pagarManager.executeDelete();
    closeDeleteModal();
}

function sortAccounts() {
    pagarManager.sortAccounts();
}

function filterAccounts() {
    pagarManager.filterAccounts();
}

function clearFilters() {
    document.getElementById('filterMonth').value = 'all';
    document.getElementById('filterYear').value = 'all';
    document.getElementById('filterCategory').value = 'all';
    document.getElementById('filterStatus').value = 'all';
    pagarManager.renderAccounts();
}

// Initialize
const pagarManager = new PagarManager();