class MetasManager {
    constructor() {
        this.metas = JSON.parse(localStorage.getItem('metas')) || [];
        this.currentEditId = null;
        this.currentDeleteId = null;
        
        this.init();
    }

    init() {
        this.loadUserName();
        this.renderMetas();
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

    setupEventListeners() {
        document.getElementById('addMetaForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addMeta();
        });

        document.getElementById('editForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateMeta();
        });
    }

    addMeta() {
        const nome = document.getElementById('nomeMeta').value;
        const valorObjetivo = parseFloat(document.getElementById('valorObjetivo').value);
        const valorAtual = parseFloat(document.getElementById('valorAtual').value) || 0;
        const dataPrazo = document.getElementById('dataPrazo').value;
        const status = document.getElementById('statusMeta').value;

        const meta = {
            id: Date.now(),
            nome: nome,
            valorObjetivo: valorObjetivo,
            valorAtual: valorAtual,
            dataPrazo: dataPrazo,
            status: status,
            prazoTipo: this.calcularPrazoTipo(dataPrazo),
            dataCadastro: new Date().toISOString()
        };

        this.metas.push(meta);
        this.saveData();
        this.renderMetas();
        closeAddModal();
        this.showNotification('Meta adicionada com sucesso!', 'success');
    }

    calcularPrazoTipo(dataPrazo) {
        const hoje = new Date();
        const prazo = new Date(dataPrazo);
        const diffTime = prazo - hoje;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 365) return 'curto'; // até 1 ano
        if (diffDays <= 1095) return 'medio'; // até 3 anos
        return 'longo'; // mais de 3 anos
    }

    updateAddButton() {
        const addBtn = document.getElementById('addBtn');
        if (this.metas.length === 0) {
            addBtn.textContent = 'Nova Meta';
            addBtn.classList.remove('compact');
        } else {
            addBtn.textContent = '+';
            addBtn.classList.add('compact');
        }
    }

    renderMetas() {
        this.updateAddButton();
        
        const todasList = document.getElementById('todasList');
        const curtoList = document.getElementById('curtoList');
        const medioList = document.getElementById('medioList');
        const longoList = document.getElementById('longoList');

        todasList.innerHTML = '';
        curtoList.innerHTML = '';
        medioList.innerHTML = '';
        longoList.innerHTML = '';

        if (this.metas.length === 0) {
            todasList.innerHTML = '<div class="empty-state">Nenhuma meta cadastrada</div>';
            return;
        }

        let filteredMetas = this.getFilteredMetas();
        
        // Apply sorting
        const sortBy = document.getElementById('sortBy').value;
        filteredMetas.sort((a, b) => {
            switch (sortBy) {
                case 'prazo':
                    return new Date(a.dataPrazo) - new Date(b.dataPrazo);
                case 'nome':
                    return a.nome.localeCompare(b.nome);
                case 'valor':
                    return b.valorObjetivo - a.valorObjetivo;
                case 'progresso':
                    const progressoA = (a.valorAtual / a.valorObjetivo) * 100;
                    const progressoB = (b.valorAtual / b.valorObjetivo) * 100;
                    return progressoB - progressoA;
                default:
                    return 0;
            }
        });

        // Group by prazo tipo
        const grupos = {
            curto: [],
            medio: [],
            longo: []
        };

        filteredMetas.forEach(meta => {
            if (grupos[meta.prazoTipo]) {
                grupos[meta.prazoTipo].push(meta);
            }
        });

        // Render each group
        this.renderGroup(filteredMetas, todasList);
        this.renderGroup(grupos.curto, curtoList);
        this.renderGroup(grupos.medio, medioList);
        this.renderGroup(grupos.longo, longoList);
    }

    renderGroup(metas, container) {
        if (metas.length === 0) {
            container.innerHTML = '<div class="empty-state">Nenhuma meta nesta categoria</div>';
            return;
        }

        metas.forEach(meta => {
            const progresso = Math.min((meta.valorAtual / meta.valorObjetivo) * 100, 100);
            const diasRestantes = this.calcularDiasRestantes(meta.dataPrazo);
            
            const item = document.createElement('div');
            item.className = 'account-item';
            
            item.innerHTML = `
                <div class="account-info">
                    <h3>${meta.nome}</h3>
                    <p><strong>Prazo:</strong> ${this.formatDate(meta.dataPrazo)} (${diasRestantes})</p>
                    <p><strong>Progresso:</strong> R$ ${meta.valorAtual.toFixed(2)} / R$ ${meta.valorObjetivo.toFixed(2)}</p>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progresso}%"></div>
                        <span class="progress-text">${progresso.toFixed(1)}%</span>
                    </div>
                </div>
                <div class="account-value">
                    <div class="status-badge ${meta.status}">${this.formatStatus(meta.status)}</div>
                    <div class="prazo-badge ${meta.prazoTipo}">${this.formatPrazoTipo(meta.prazoTipo)}</div>
                </div>
                <div class="status-toggle">
                    <button class="btn-small" onclick="metasManager.openEditModal(${meta.id})">Editar</button>
                    <button class="btn-small btn-danger" onclick="metasManager.openDeleteModal(${meta.id})">Excluir</button>
                </div>
            `;
            
            container.appendChild(item);
        });
    }

    calcularDiasRestantes(dataPrazo) {
        const hoje = new Date();
        const prazo = new Date(dataPrazo);
        const diffTime = prazo - hoje;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'Vencido';
        if (diffDays === 0) return 'Hoje';
        if (diffDays === 1) return '1 dia';
        if (diffDays < 30) return `${diffDays} dias`;
        if (diffDays < 365) return `${Math.ceil(diffDays / 30)} meses`;
        return `${Math.ceil(diffDays / 365)} anos`;
    }

    formatStatus(status) {
        const statusMap = {
            'ativa': 'Ativa',
            'pausada': 'Pausada',
            'concluida': 'Concluída'
        };
        return statusMap[status] || status;
    }

    formatPrazoTipo(prazoTipo) {
        const prazoMap = {
            'curto': 'Curto Prazo',
            'medio': 'Médio Prazo',
            'longo': 'Longo Prazo'
        };
        return prazoMap[prazoTipo] || prazoTipo;
    }

    getFilteredMetas() {
        const prazo = document.getElementById('filterPrazo').value;
        const status = document.getElementById('filterStatus').value;
        
        return this.metas.filter(meta => {
            if (prazo !== 'all' && meta.prazoTipo !== prazo) {
                return false;
            }
            
            if (status !== 'all' && meta.status !== status) {
                return false;
            }
            
            return true;
        });
    }

    openEditModal(id) {
        const meta = this.metas.find(m => m.id === id);
        if (!meta) return;
        
        this.currentEditId = id;
        document.getElementById('editValorAtual').value = meta.valorAtual;
        document.getElementById('editStatusMeta').value = meta.status;
        document.getElementById('editModal').style.display = 'flex';
    }

    updateMeta() {
        const meta = this.metas.find(m => m.id === this.currentEditId);
        if (!meta) return;
        
        meta.valorAtual = parseFloat(document.getElementById('editValorAtual').value) || 0;
        meta.status = document.getElementById('editStatusMeta').value;
        
        // Auto-complete if reached objective
        if (meta.valorAtual >= meta.valorObjetivo && meta.status !== 'concluida') {
            meta.status = 'concluida';
        }
        
        this.saveData();
        this.renderMetas();
        closeEditModal();
        this.showNotification('Meta atualizada com sucesso!', 'success');
    }

    openDeleteModal(id) {
        const meta = this.metas.find(m => m.id === id);
        if (!meta) return;
        
        this.currentDeleteId = id;
        document.getElementById('deleteMessage').textContent = 
            `Tem certeza que deseja excluir "${meta.nome}"?`;
        document.getElementById('deleteModal').style.display = 'flex';
    }

    executeDelete() {
        this.metas = this.metas.filter(m => m.id !== this.currentDeleteId);
        this.saveData();
        this.renderMetas();
        this.showNotification('Meta removida!', 'success');
    }

    sortMetas() {
        this.renderMetas();
    }
    
    filterMetas() {
        this.renderMetas();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    saveData() {
        localStorage.setItem('metas', JSON.stringify(this.metas));
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
    document.getElementById('addMetaForm').reset();
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    document.getElementById('editForm').reset();
    metasManager.currentEditId = null;
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    metasManager.currentDeleteId = null;
}

function confirmDelete() {
    metasManager.executeDelete();
    closeDeleteModal();
}

function sortMetas() {
    metasManager.sortMetas();
}

function filterMetas() {
    metasManager.filterMetas();
}

function clearFilters() {
    document.getElementById('filterPrazo').value = 'all';
    document.getElementById('filterStatus').value = 'all';
    metasManager.renderMetas();
}

function showMetaTab(tabName) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.meta-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.meta-tab-content').forEach(content => content.classList.remove('active'));

    // Add active class to clicked tab and corresponding content
    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

// Initialize
const metasManager = new MetasManager();
window.metasManager = metasManager;