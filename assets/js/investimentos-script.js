class InvestimentosManager {
    constructor() {
        this.investimentos = JSON.parse(localStorage.getItem('investimentos')) || [];
        this.produtosRendaFixa = JSON.parse(localStorage.getItem('produtosRendaFixa')) || [];
        this.produtosRendaVariavel = JSON.parse(localStorage.getItem('produtosRendaVariavel')) || [];
        this.currentEditId = null;
        this.currentDeleteId = null;
        
        this.init();
    }

    init() {
        this.loadUserName();
        this.loadProdutos();
        this.renderInvestments();
        this.updateSummary();
        this.setupEventListeners();
    }
    
    loadProdutos() {
        this.produtosRendaFixa = JSON.parse(localStorage.getItem('produtosRendaFixa')) || [
            'CDB Pré-fixado', 'CDB Pós-fixado', 'LCI Pré-fixado', 'LCI Pós-fixado',
            'LCA Pré-fixado', 'LCA Pós-fixado', 'Tesouro Pré-fixado', 'Tesouro Selic',
            'Tesouro IPCA+', 'Fundo de Renda Fixa', 'Debêntures'
        ];
        this.produtosRendaVariavel = JSON.parse(localStorage.getItem('produtosRendaVariavel')) || [
            'Ação', 'FIIs', 'ETFs', 'Cripto'
        ];
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

    setupEventListeners() {
        document.getElementById('addInvestmentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addInvestment();
        });

        document.getElementById('editForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateValue();
        });
    }

    addInvestment() {
        const tipo = document.getElementById('tipoInvestimento').value;
        const produto = document.getElementById('produto').value;
        
        let investimento = {
            id: Date.now(),
            tipo: tipo,
            produto: produto,
            dataCadastro: new Date().toISOString()
        };
        
        if (tipo === 'renda_fixa') {
            const quantidade = parseFloat(document.getElementById('quantidade').value) || 0;
            const preco = parseFloat(document.getElementById('preco').value) || 0;
            const taxas = parseFloat(document.getElementById('taxas').value) || 0;
            const operacao = document.getElementById('operacao').value;
            const emissor = document.getElementById('emissor').value;
            const dataVencimento = document.getElementById('dataVencimento').value;
            
            const valorMovimentado = quantidade * preco;
            const valorLiquido = operacao === 'aporte' ? valorMovimentado + taxas : valorMovimentado - taxas;
            const ativo = `${produto} ${emissor} VCTO ${this.formatDateForAtivo(dataVencimento)}`;
            
            investimento = {
                ...investimento,
                data: document.getElementById('data').value,
                operacao: operacao,
                emissor: emissor,
                corretora: document.getElementById('corretora').value,
                dataVencimento: dataVencimento,
                ativo: ativo,
                quantidade: quantidade,
                preco: preco,
                valorMovimentado: valorMovimentado,
                taxas: taxas,
                valorLiquido: valorLiquido,
                valorAtual: valorLiquido,
                status: 'ativo',
                rendimentoValor: 0,
                rendimentoData: null
            };
        } else {
            const quantidade = parseFloat(document.getElementById('quantidadeRV').value) || 0;
            const preco = parseFloat(document.getElementById('precoRV').value) || 0;
            const tarifas = parseFloat(document.getElementById('tarifas').value) || 0;
            const operacao = document.getElementById('operacaoRV').value;
            
            const valorMovimentado = quantidade * preco;
            const valorLiquido = operacao === 'compra' ? valorMovimentado + tarifas : valorMovimentado - tarifas;
            
            investimento = {
                ...investimento,
                ativo: document.getElementById('ativoRV').value,
                operacao: operacao,
                corretora: document.getElementById('corretoraRV').value,
                data: document.getElementById('dataRV').value,
                quantidade: quantidade,
                preco: preco,
                valorMovimentado: valorMovimentado,
                tarifas: tarifas,
                valorLiquido: valorLiquido,
                valorAtual: valorLiquido,
                status: 'ativo',
                rendimentoValor: 0,
                rendimentoData: null
            };
        }

        this.investimentos.push(investimento);
        this.saveData();
        this.renderInvestments();
        this.updateSummary();
        closeAddModal();
        this.showNotification('Investimento adicionado com sucesso!', 'success');
    }

    updateAddButton() {
        const addBtn = document.getElementById('addBtn');
        if (this.investimentos.length === 0) {
            addBtn.textContent = 'Novo Investimento';
            addBtn.classList.remove('compact');
        } else {
            addBtn.textContent = '+';
            addBtn.classList.add('compact');
        }
    }

    renderInvestments() {
        this.updateAddButton();
        
        const todosList = document.getElementById('todosList');
        const rendaFixaList = document.getElementById('rendaFixaList');
        const rendaVariavelList = document.getElementById('rendaVariavelList');

        todosList.innerHTML = '';
        rendaFixaList.innerHTML = '';
        rendaVariavelList.innerHTML = '';

        if (this.investimentos.length === 0) {
            todosList.innerHTML = '<div class="empty-state">Nenhum investimento cadastrado</div>';
            return;
        }

        let filteredInvestments = this.getFilteredInvestments();
        
        // Apply sorting
        const sortBy = document.getElementById('sortBy').value;
        filteredInvestments.sort((a, b) => {
            switch (sortBy) {
                case 'aquisicao':
                    return new Date(a.dataAquisicao) - new Date(b.dataAquisicao);
                case 'nome':
                    return a.nome.localeCompare(b.nome);
                case 'valor_atual':
                    return b.valorAtual - a.valorAtual;
                case 'rendimento':
                    const rendA = (a.valorAtual - a.valorInvestido - a.taxasCustos);
                    const rendB = (b.valorAtual - b.valorInvestido - b.taxasCustos);
                    return rendB - rendA;
                default:
                    return 0;
            }
        });

        // Group by type
        const grupos = {
            renda_fixa: [],
            renda_variavel: []
        };

        filteredInvestments.forEach(inv => {
            if (grupos[inv.tipo]) {
                grupos[inv.tipo].push(inv);
            }
        });

        // Render each group
        this.renderGroup(filteredInvestments, todosList);
        this.renderGroup(grupos.renda_fixa, rendaFixaList);
        this.renderGroup(grupos.renda_variavel, rendaVariavelList);
    }

    renderGroup(investments, container) {
        if (investments.length === 0) {
            container.innerHTML = '<div class="empty-state">Nenhum investimento nesta categoria</div>';
            return;
        }

        investments.forEach(inv => {
            const item = document.createElement('div');
            item.className = 'account-item';
            
            let infoHtml = '';
            if (inv.tipo === 'renda_fixa') {
                infoHtml = `
                    <h3>${inv.ativo || inv.produto}</h3>
                    <p><strong>Produto:</strong> ${inv.produto}</p>
                    <p><strong>Emissor:</strong> ${inv.emissor || 'N/A'}</p>
                    <p><strong>Data:</strong> ${this.formatDate(inv.data)}</p>
                    <p><strong>Operação:</strong> ${inv.operacao}</p>
                    <p><strong>Quantidade:</strong> ${inv.quantidade}</p>
                    <p><strong>Preço:</strong> R$ ${inv.preco.toFixed(2)}</p>
                    <p><strong>Valor Movimentado:</strong> R$ ${inv.valorMovimentado.toFixed(2)}</p>
                    <p><strong>Taxas:</strong> R$ ${inv.taxas.toFixed(2)}</p>
                `;
            } else {
                infoHtml = `
                    <h3>${inv.ativo}</h3>
                    <p><strong>Produto:</strong> ${inv.produto}</p>
                    <p><strong>Corretora:</strong> ${inv.corretora || 'N/A'}</p>
                    <p><strong>Data:</strong> ${this.formatDate(inv.data)}</p>
                    <p><strong>Operação:</strong> ${inv.operacao}</p>
                    <p><strong>Quantidade:</strong> ${inv.quantidade}</p>
                    <p><strong>Preço:</strong> R$ ${inv.preco.toFixed(2)}</p>
                    <p><strong>Valor Movimentado:</strong> R$ ${inv.valorMovimentado.toFixed(2)}</p>
                    <p><strong>Tarifas:</strong> R$ ${inv.tarifas.toFixed(2)}</p>
                `;
            }
            
            item.innerHTML = `
                <div class="account-info">
                    ${infoHtml}
                </div>
                <div class="account-value">
                    <div>R$ ${(inv.valorAtual || inv.valorLiquido).toFixed(2)}</div>
                    <div class="status-badge ${inv.status || 'ativo'}">${inv.status === 'concluido' ? 'Concluído' : 'Ativo'}</div>
                    ${inv.rendimentoValor > 0 ? `<div class="rendimento-info">Rendimento: R$ ${inv.rendimentoValor.toFixed(2)}</div>` : ''}
                </div>
                <div class="status-toggle">
                    <button class="btn-small" onclick="investimentosManager.openEditModal(${inv.id})">Editar</button>
                    <button class="btn-small btn-danger" onclick="investimentosManager.openDeleteModal(${inv.id})">Excluir</button>
                </div>
            `;
            
            container.appendChild(item);
        });
    }

    getFilteredInvestments() {
        const tipo = document.getElementById('filterTipo').value;
        const resultado = document.getElementById('filterResultado').value;
        
        return this.investimentos.filter(inv => {
            const rendimento = inv.valorAtual - inv.valorInvestido - inv.taxasCustos;
            
            // Filter by type
            if (tipo !== 'all' && inv.tipo !== tipo) {
                return false;
            }
            
            // Filter by result
            if (resultado !== 'all') {
                if (resultado === 'positivo' && rendimento <= 0) return false;
                if (resultado === 'negativo' && rendimento >= 0) return false;
                if (resultado === 'neutro' && rendimento !== 0) return false;
            }
            
            return true;
        });
    }

    updateSummary() {
        const activeTab = document.querySelector('.investment-tab-btn.active');
        const tabType = activeTab ? activeTab.onclick.toString().match(/'([^']+)'/)[1] : 'todos';
        
        let investimentosFiltrados = this.investimentos;
        if (tabType === 'renda_fixa') {
            investimentosFiltrados = this.investimentos.filter(inv => inv.tipo === 'renda_fixa');
        } else if (tabType === 'renda_variavel') {
            investimentosFiltrados = this.investimentos.filter(inv => inv.tipo === 'renda_variavel');
        }
        
        const totalMovimentado = investimentosFiltrados.reduce((sum, inv) => sum + inv.valorMovimentado, 0);
        const valorLiquido = investimentosFiltrados.reduce((sum, inv) => sum + inv.valorLiquido, 0);
        const totalTaxas = investimentosFiltrados.reduce((sum, inv) => sum + (inv.taxas || inv.tarifas || 0), 0);
        
        document.getElementById('totalInvestido').textContent = `R$ ${totalMovimentado.toFixed(2)}`;
        document.getElementById('valorAtual').textContent = `R$ ${valorLiquido.toFixed(2)}`;
        document.getElementById('rendimentoTotal').textContent = `R$ ${totalTaxas.toFixed(2)}`;
    }

    openEditModal(id) {
        const investimento = this.investimentos.find(inv => inv.id === id);
        if (!investimento) return;
        
        this.currentEditId = id;
        
        document.getElementById('editValorAtual').value = investimento.valorAtual || investimento.valorLiquido || '';
        document.getElementById('editStatus').value = investimento.status || 'ativo';
        document.getElementById('rendimentoValor').value = investimento.rendimentoValor || '';
        document.getElementById('rendimentoData').value = investimento.rendimentoData || '';
        
        if (investimento.status === 'concluido') {
            document.getElementById('conclusaoFields').style.display = 'block';
            document.getElementById('dataConclusao').value = investimento.dataConclusao || '';
            document.getElementById('valorRecebido').value = investimento.valorRecebido || '';
        } else {
            document.getElementById('conclusaoFields').style.display = 'none';
        }
        
        document.getElementById('editModal').style.display = 'flex';
    }

    updateValue() {
        const investimento = this.investimentos.find(inv => inv.id === this.currentEditId);
        if (!investimento) return;
        
        investimento.valorAtual = parseFloat(document.getElementById('editValorAtual').value) || 0;
        investimento.status = document.getElementById('editStatus').value;
        investimento.rendimentoValor = parseFloat(document.getElementById('rendimentoValor').value) || 0;
        investimento.rendimentoData = document.getElementById('rendimentoData').value || null;
        
        if (investimento.status === 'concluido') {
            investimento.dataConclusao = document.getElementById('dataConclusao').value;
            investimento.valorRecebido = parseFloat(document.getElementById('valorRecebido').value) || 0;
        }
        
        this.saveData();
        this.renderInvestments();
        this.updateSummary();
        closeEditModal();
        this.showNotification('Investimento atualizado com sucesso!', 'success');
    }

    openDeleteModal(id) {
        const investimento = this.investimentos.find(inv => inv.id === id);
        if (!investimento) return;
        
        this.currentDeleteId = id;
        document.getElementById('deleteMessage').textContent = 
            `Tem certeza que deseja excluir "${investimento.nome}"?`;
        document.getElementById('deleteModal').style.display = 'flex';
    }

    executeDelete() {
        this.investimentos = this.investimentos.filter(inv => inv.id !== this.currentDeleteId);
        this.saveData();
        this.renderInvestments();
        this.updateSummary();
        this.showNotification('Investimento removido!', 'success');
    }

    sortInvestments() {
        this.renderInvestments();
    }
    
    filterInvestments() {
        this.renderInvestments();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }
    
    formatDateForAtivo(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    formatTipo(tipo) {
        const tipos = {
            'renda_fixa': 'Renda Fixa',
            'renda_variavel': 'Renda Variável',
            'fundos': 'Fundos',
            'criptomoedas': 'Criptomoedas',
            'outros': 'Outros'
        };
        return tipos[tipo] || tipo;
    }

    saveData() {
        localStorage.setItem('investimentos', JSON.stringify(this.investimentos));
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
function updateProductOptions() {
    const tipo = document.getElementById('tipoInvestimento').value;
    const produtoSelect = document.getElementById('produto');
    const rendaFixaFields = document.getElementById('rendaFixaFields');
    const rendaVariavelFields = document.getElementById('rendaVariavelFields');
    
    produtoSelect.innerHTML = '<option value="">Selecione o produto</option>';
    rendaFixaFields.style.display = 'none';
    rendaVariavelFields.style.display = 'none';
    
    if (tipo === 'renda_fixa') {
        // Recarregar produtos do localStorage
        const produtos = JSON.parse(localStorage.getItem('produtosRendaFixa')) || [
            'CDB Pré-fixado', 'CDB Pós-fixado', 'LCI Pré-fixado', 'LCI Pós-fixado',
            'LCA Pré-fixado', 'LCA Pós-fixado', 'Tesouro Pré-fixado', 'Tesouro Selic',
            'Tesouro IPCA+', 'Fundo de Renda Fixa', 'Debêntures'
        ];
        produtos.forEach(produto => {
            const option = document.createElement('option');
            option.value = produto;
            option.textContent = produto;
            produtoSelect.appendChild(option);
        });
        rendaFixaFields.style.display = 'block';
    } else if (tipo === 'renda_variavel') {
        // Recarregar produtos do localStorage
        const produtos = JSON.parse(localStorage.getItem('produtosRendaVariavel')) || [
            'Ação', 'FIIs', 'ETFs', 'Cripto'
        ];
        produtos.forEach(produto => {
            const option = document.createElement('option');
            option.value = produto;
            option.textContent = produto;
            produtoSelect.appendChild(option);
        });
        rendaVariavelFields.style.display = 'block';
    }
}

function openAddModal() {
    document.getElementById('addModal').style.display = 'flex';
}

function closeAddModal() {
    document.getElementById('addModal').style.display = 'none';
    document.getElementById('addInvestmentForm').reset();
}

function toggleConclusaoFields() {
    const status = document.getElementById('editStatus').value;
    const conclusaoFields = document.getElementById('conclusaoFields');
    conclusaoFields.style.display = status === 'concluido' ? 'block' : 'none';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    document.getElementById('editForm').reset();
    document.getElementById('conclusaoFields').style.display = 'none';
    investimentosManager.currentEditId = null;
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    investimentosManager.currentDeleteId = null;
}

function confirmDelete() {
    investimentosManager.executeDelete();
    closeDeleteModal();
}

function sortInvestments() {
    investimentosManager.sortInvestments();
}

function filterInvestments() {
    investimentosManager.filterInvestments();
}

function clearFilters() {
    document.getElementById('filterTipo').value = 'all';
    document.getElementById('filterResultado').value = 'all';
    investimentosManager.renderInvestments();
}

function showInvestmentTab(tabName) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.investment-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.investment-tab-content').forEach(content => content.classList.remove('active'));

    // Add active class to clicked tab and corresponding content
    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');
    
    // Update summary based on selected tab
    if (window.investimentosManager) {
        window.investimentosManager.updateSummary();
    }
}

// Initialize
const investimentosManager = new InvestimentosManager();
window.investimentosManager = investimentosManager;