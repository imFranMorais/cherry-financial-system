class TerceirosManager {
    constructor() {
        this.loans = JSON.parse(localStorage.getItem('loans')) || [];
        this.init();
    }

    init() {
        this.loadLoans();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('addTransactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addLoan();
        });
    }

    addLoan() {
        const nome = document.getElementById('nomePessoa').value;
        const tipo = document.getElementById('tipoTransacao').value;
        const valor = parseFloat(document.getElementById('valor').value);
        const data = document.getElementById('dataTransacao').value;

        const loan = {
            id: Date.now(),
            nome,
            tipo,
            valor,
            valorPago: 0,
            data,
            status: 'pendente',
            dataPagamento: null
        };

        this.loans.push(loan);
        this.saveLoans();
        this.addToMainLists(loan);
        this.loadLoans();
        this.closeAddModal();
        this.showNotification('Empréstimo adicionado com sucesso!', 'success');
    }

    addToMainLists(loan) {
        if (loan.tipo === 'emprestado') {
            this.addToReceber(loan);
        } else if (loan.tipo === 'recebido') {
            this.addToPagar(loan);
        }
    }

    addToReceber(loan) {
        const receber = JSON.parse(localStorage.getItem('contasReceber')) || [];
        receber.push({
            id: `loan_${loan.id}`,
            nome: `Empréstimo - ${loan.nome}`,
            categoria: 'emprestimo',
            valor: loan.valor,
            dataPrevista: loan.data,
            status: 'a_receber',
            dataRecebimento: null,
            origem: 'terceiros'
        });
        localStorage.setItem('contasReceber', JSON.stringify(receber));
    }

    addToPagar(loan) {
        const pagar = JSON.parse(localStorage.getItem('contasPagar')) || [];
        pagar.push({
            id: `loan_${loan.id}`,
            nome: `Empréstimo - ${loan.nome}`,
            categoria: 'emprestimo',
            valor: loan.valor,
            vencimento: loan.data,
            status: 'a_pagar',
            dataPagamento: null,
            origem: 'terceiros'
        });
        localStorage.setItem('contasPagar', JSON.stringify(pagar));
    }

    updateMainLists(loan) {
        if (loan.tipo === 'emprestado') {
            this.updateReceber(loan);
        } else if (loan.tipo === 'recebido') {
            this.updatePagar(loan);
        }
    }

    updateReceber(loan) {
        const receber = JSON.parse(localStorage.getItem('contasReceber')) || [];
        const index = receber.findIndex(item => item.id === `loan_${loan.id}`);
        if (index !== -1) {
            receber[index].status = loan.status === 'pago' ? 'recebido' : 'a_receber';
            receber[index].dataRecebimento = loan.dataPagamento;
            localStorage.setItem('contasReceber', JSON.stringify(receber));
        }
    }

    updatePagar(loan) {
        const pagar = JSON.parse(localStorage.getItem('contasPagar')) || [];
        const index = pagar.findIndex(item => item.id === `loan_${loan.id}`);
        if (index !== -1) {
            pagar[index].status = loan.status === 'pago' ? 'pago' : 'a_pagar';
            pagar[index].dataPagamento = loan.dataPagamento;
            localStorage.setItem('contasPagar', JSON.stringify(pagar));
        }
    }

    loadLoans() {
        const container = document.getElementById('transactionsList');
        container.innerHTML = '';

        this.loans.forEach(loan => {
            const item = document.createElement('div');
            item.className = 'account-item';
            
            const statusClass = loan.status === 'pago' ? 'status-pago' : 'status-pendente';
            const tipoText = loan.tipo === 'emprestado' ? 'Emprestado para' : 'Recebido de';
            const progressoText = loan.valorPago > 0 ? `(R$ ${loan.valorPago.toFixed(2)} pago)` : '';

            item.innerHTML = `
                <div class="account-info">
                    <h4>${tipoText}: ${loan.nome}</h4>
                    <p>Data: ${new Date(loan.data).toLocaleDateString('pt-BR')}</p>
                    <p class="${statusClass}">Status: ${loan.status === 'pago' ? 'Quitado' : 'Pendente'} ${progressoText}</p>
                </div>
                <div class="account-value">R$ ${loan.valor.toFixed(2)}</div>
                <div class="account-actions">
                    ${loan.status === 'pendente' ? `<button class="btn-small" onclick="terceiros.openPaymentModal(${loan.id})">Pagar</button>` : ''}
                    <button class="btn-small btn-delete" onclick="terceiros.deleteLoan(${loan.id})">Excluir</button>
                </div>
            `;
            container.appendChild(item);
        });
    }

    openPaymentModal(loanId) {
        this.currentLoanId = loanId;
        const loan = this.loans.find(l => l.id === loanId);
        document.getElementById('paymentModalTitle').textContent = 
            loan.tipo === 'emprestado' ? 'Registrar Recebimento' : 'Registrar Pagamento';
        document.getElementById('paymentModal').style.display = 'flex';
    }

    closePaymentModal() {
        document.getElementById('paymentModal').style.display = 'none';
        document.getElementById('paymentForm').reset();
    }

    registerPayment() {
        const data = document.getElementById('dataPagamento').value;
        const valor = parseFloat(document.getElementById('valorPagamento').value);
        
        const loan = this.loans.find(l => l.id === this.currentLoanId);
        loan.valorPago += valor;
        
        if (loan.valorPago >= loan.valor) {
            loan.status = 'pago';
            loan.dataPagamento = data;
        }
        
        this.saveLoans();
        this.updateMainLists(loan);
        this.loadLoans();
        this.closePaymentModal();
        this.showNotification('Pagamento registrado com sucesso!', 'success');
    }

    deleteLoan(loanId) {
        if (confirm('Tem certeza que deseja excluir este empréstimo?')) {
            this.loans = this.loans.filter(l => l.id !== loanId);
            this.saveLoans();
            this.removeFromMainLists(loanId);
            this.loadLoans();
            this.showNotification('Empréstimo excluído com sucesso!', 'success');
        }
    }

    removeFromMainLists(loanId) {
        const receber = JSON.parse(localStorage.getItem('contasReceber')) || [];
        const pagar = JSON.parse(localStorage.getItem('contasPagar')) || [];
        
        const newReceber = receber.filter(item => item.id !== `loan_${loanId}`);
        const newPagar = pagar.filter(item => item.id !== `loan_${loanId}`);
        
        localStorage.setItem('contasReceber', JSON.stringify(newReceber));
        localStorage.setItem('contasPagar', JSON.stringify(newPagar));
    }

    saveLoans() {
        localStorage.setItem('loans', JSON.stringify(this.loans));
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

function openAddModal() {
    document.getElementById('addModal').style.display = 'flex';
}

function closeAddModal() {
    document.getElementById('addModal').style.display = 'none';
    document.getElementById('addTransactionForm').reset();
}

function closePaymentModal() {
    terceiros.closePaymentModal();
}

const terceiros = new TerceirosManager();

document.getElementById('paymentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    terceiros.registerPayment();
});