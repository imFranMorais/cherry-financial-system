// Cherry Financial System - Main JavaScript File
// Consolidated scripts for the financial management system

class FinancasApp {
    constructor() {
        this.contasPagar = JSON.parse(localStorage.getItem('contasPagar')) || [];
        this.contasReceber = JSON.parse(localStorage.getItem('contasReceber')) || [];
        this.investimentos = JSON.parse(localStorage.getItem('investimentos')) || [];
        this.bancos = JSON.parse(localStorage.getItem('bancos')) || [];
        this.contas = JSON.parse(localStorage.getItem('contas')) || [];
        this.cartoes = JSON.parse(localStorage.getItem('cartoes')) || [];
        this.categoriasPagar = JSON.parse(localStorage.getItem('categoriasPagar')) || [];
        this.categoriasReceber = JSON.parse(localStorage.getItem('categoriasReceber')) || [];
        this.formasPagamento = JSON.parse(localStorage.getItem('formasPagamento')) || [];
        
        this.filters = {
            year: 'all',
            month: 'all',
            account: 'all',
            bank: 'all'
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateSummary();
        this.loadUserName();
        this.setupFilters();
        this.createCharts();
        if (typeof this.renderAll === 'function') {
            this.renderAll();
        }
    }

    setupEventListeners() {
        this.checkNotifications();
        setInterval(() => this.checkNotifications(), 60000);
        
        this.setupFilterListeners();
        this.setupCustomYearListener();
        this.setupMonthSelectListener();
        this.setupAccountSelectListener();
        this.setupBankSelectListener();
    }

    updateSummary() {
        const filteredPagar = this.filterData(this.contasPagar);
        const filteredReceber = this.filterData(this.contasReceber);
        const filteredInvestimentos = this.filterData(this.investimentos, 'dataDeposito');

        const totalPagar = filteredPagar
            .filter(conta => conta.status !== 'pago')
            .reduce((sum, conta) => sum + conta.valor, 0);

        const totalReceber = filteredReceber
            .filter(conta => conta.status !== 'recebido')
            .reduce((sum, conta) => sum + conta.valor, 0);
            
        const totalRecebido = filteredReceber
            .filter(conta => conta.status === 'recebido')
            .reduce((sum, conta) => sum + conta.valor, 0);

        const totalInvestimentos = filteredInvestimentos
            .reduce((sum, inv) => sum + (inv.valorAtual || inv.valorLiquido || 0), 0);
            
        const saldoContas = this.contas.reduce((sum, conta) => sum + (conta.saldo || 0), 0);
        const saldo = totalReceber - totalPagar + saldoContas;
        
        const elements = {
            'totalPagar': totalPagar,
            'totalReceber': totalReceber,
            'totalSaldo': saldo,
            'totalRecebido': totalRecebido,
            'totalInvestimentos': totalInvestimentos
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = `R$ ${value.toFixed(2)}`;
            }
        });
    }

    checkNotifications() {
        const hoje = new Date();
        
        const contasVencidas = this.contasPagar.filter(conta => {
            const vencimento = new Date(conta.vencimento);
            return vencimento < hoje && conta.status === 'pendente';
        });

        if (contasVencidas.length > 0) {
            this.showNotification(`${contasVencidas.length} conta(s) vencida(s)!`, 'warning');
        }

        const investimentosVencendo = this.investimentos.filter(inv => {
            if (!inv.dataVencimento) return false;
            const vencimento = new Date(inv.dataVencimento);
            return vencimento.toDateString() === hoje.toDateString();
        });

        if (investimentosVencendo.length > 0) {
            this.showNotification(`${investimentosVencendo.length} investimento(s) vencendo hoje!`, 'warning');
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
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

    createCharts() {
        this.createPagarChart();
        this.createReceberChart();
        this.createInvestimentosChart();
        this.createDiferencaChart();
        this.createFontesReceitaChart();
        this.createFontesDespesasChart();
        this.createDesempenhoMesChart();
        this.createPatrimonioChart();
        this.createPerfilInvestidorChart();
        this.createSaldoBancosChart();
        this.createAlocacaoRendaFixaChart();
        this.createAlocacaoRendaVariavelChart();
        this.createMetasChart();
    }

    createPagarChart() {
        const canvas = document.getElementById('pagarChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const filteredData = this.filterData(this.contasPagar);
        const hoje = new Date();
        
        const aPagar = filteredData.filter(c => c.status !== 'pago' && new Date(c.vencimento) >= hoje).length;
        const vencidas = filteredData.filter(c => c.status !== 'pago' && new Date(c.vencimento) < hoje).length;
        const pagas = filteredData.filter(c => c.status === 'pago').length;
        
        this.drawPieChart(ctx, [aPagar, vencidas, pagas], ['#3498db', '#e74c3c', '#27ae60'], ['A Pagar', 'Vencidas', 'Pagas']);
    }

    createReceberChart() {
        const canvas = document.getElementById('receberChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const filteredData = this.filterData(this.contasReceber);
        const hoje = new Date();
        
        const aReceber = filteredData.filter(c => c.status !== 'recebido' && new Date(c.vencimento) >= hoje).length;
        const vencidas = filteredData.filter(c => c.status !== 'recebido' && new Date(c.vencimento) < hoje).length;
        const recebidas = filteredData.filter(c => c.status === 'recebido').length;
        
        this.drawPieChart(ctx, [aReceber, vencidas, recebidas], ['#3498db', '#e74c3c', '#27ae60'], ['A Receber', 'Vencidas', 'Recebidas']);
    }

    createInvestimentosChart() {
        const canvas = document.getElementById('investimentosChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const filteredData = this.filterData(this.investimentos, 'dataDeposito');
        const tipos = {};
        
        filteredData.forEach(inv => {
            const tipo = inv.tipo || inv.produto || 'Outros';
            tipos[tipo] = (tipos[tipo] || 0) + (inv.valorAtual || inv.valorLiquido || 0);
        });
        
        const values = Object.values(tipos);
        const labels = Object.keys(tipos);
        const colors = ['#3498db', '#9b59b6', '#e67e22', '#1abc9c', '#34495e'];
        
        this.drawPieChart(ctx, values, colors, labels);
    }

    createDiferencaChart() {
        const canvas = document.getElementById('diferencaChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const filteredPagar = this.filterData(this.contasPagar);
        const filteredReceber = this.filterData(this.contasReceber);
        
        const totalPagar = filteredPagar.reduce((sum, c) => sum + c.valor, 0);
        const totalReceber = filteredReceber.reduce((sum, c) => sum + c.valor, 0);
        const diferenca = totalReceber - totalPagar;
        
        this.drawBarChart(ctx, [totalPagar, totalReceber, Math.abs(diferenca)], 
                         ['#e74c3c', '#27ae60', diferenca >= 0 ? '#27ae60' : '#e74c3c'], 
                         ['Pagar', 'Receber', diferenca >= 0 ? 'Superávit' : 'Déficit']);
    }

    createFontesReceitaChart() {
        const canvas = document.getElementById('fontesReceitaChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const filteredData = this.filterData(this.contasReceber);
        const fontes = {};
        
        filteredData.forEach(conta => {
            fontes[conta.categoria] = (fontes[conta.categoria] || 0) + conta.valor;
        });
        
        const values = Object.values(fontes);
        const labels = Object.keys(fontes);
        const colors = ['#27ae60', '#2ecc71', '#58d68d', '#82e0aa', '#abebc6'];
        
        this.drawPieChart(ctx, values, colors, labels);
    }

    createFontesDespesasChart() {
        const canvas = document.getElementById('fontesDespesasChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const filteredData = this.filterData(this.contasPagar);
        const fontes = {};
        
        filteredData.forEach(conta => {
            fontes[conta.categoria] = (fontes[conta.categoria] || 0) + conta.valor;
        });
        
        const values = Object.values(fontes);
        const labels = Object.keys(fontes);
        const colors = ['#e74c3c', '#ec7063', '#f1948a', '#f5b7b1', '#fadbd8'];
        
        this.drawPieChart(ctx, values, colors, labels);
    }

    createDesempenhoMesChart() {
        const canvas = document.getElementById('desempenhoMesChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        
        const categorias = {
            'Moradia': ['aluguel', 'agua', 'luz'],
            'Alimentação': ['alimentacao', 'mercado'],
            'Transporte': ['transporte', 'combustivel'],
            'Outros': ['telefone', 'celular', 'cartao']
        };
        
        const valores = {};
        Object.keys(categorias).forEach(cat => {
            valores[cat] = 0;
        });
        
        this.contasPagar.forEach(conta => {
            const date = new Date(conta.vencimento);
            if (date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear) {
                Object.keys(categorias).forEach(cat => {
                    if (categorias[cat].includes(conta.categoria)) {
                        valores[cat] += conta.valor;
                    }
                });
            }
        });
        
        const values = Object.values(valores);
        const labels = Object.keys(valores);
        const colors = ['#3498db', '#e67e22', '#9b59b6', '#1abc9c'];
        
        this.drawBarChart(ctx, values, colors, labels);
    }

    createPatrimonioChart() {
        const canvas = document.getElementById('patrimonioChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        const ativo = this.investimentos.reduce((sum, inv) => sum + (inv.valorAtual || inv.valorLiquido || 0), 0) +
                     this.contas.reduce((sum, conta) => sum + (conta.saldo || 0), 0);
        
        const passivo = this.contasPagar
            .filter(conta => conta.status === 'pendente')
            .reduce((sum, conta) => sum + conta.valor, 0);
        
        this.drawBarChart(ctx, [ativo, passivo], ['#27ae60', '#e74c3c'], ['Ativo', 'Passivo']);
    }

    createPerfilInvestidorChart() {
        const canvas = document.getElementById('perfilInvestidorChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const tipos = {};
        
        this.investimentos.forEach(inv => {
            let perfil = 'Conservador';
            if (inv.tipo === 'acoes' || inv.tipo === 'renda_variavel') perfil = 'Arrojado';
            else if (inv.tipo === 'fundos' || inv.tipo === 'cdb') perfil = 'Moderado';
            
            tipos[perfil] = (tipos[perfil] || 0) + (inv.valorAtual || inv.valorLiquido || 0);
        });
        
        const values = Object.values(tipos);
        const labels = Object.keys(tipos);
        const colors = ['#3498db', '#f39c12', '#e74c3c'];
        
        this.drawPieChart(ctx, values, colors, labels);
    }
    
    createSaldoBancosChart() {
        const canvas = document.getElementById('saldoBancosChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const saldosPorBanco = {};
        
        this.contas.forEach(conta => {
            const banco = this.bancos.find(b => b.id == conta.banco);
            const nomeBanco = banco ? banco.nome : 'Banco não encontrado';
            
            if (!saldosPorBanco[nomeBanco]) {
                saldosPorBanco[nomeBanco] = 0;
            }
            saldosPorBanco[nomeBanco] += conta.saldo || 0;
        });
        
        const values = Object.values(saldosPorBanco);
        const labels = Object.keys(saldosPorBanco);
        const colors = ['#3498db', '#27ae60', '#e67e22', '#9b59b6', '#1abc9c', '#34495e', '#f39c12'];
        
        this.drawBarChart(ctx, values, colors, labels);
    }
    
    createAlocacaoRendaFixaChart() {
        const canvas = document.getElementById('alocacaoRendaFixaChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const investimentosRF = this.investimentos.filter(inv => inv.tipo === 'renda_fixa');
        const alocacao = {};
        
        investimentosRF.forEach(inv => {
            const produto = inv.produto || 'Outros';
            alocacao[produto] = (alocacao[produto] || 0) + (inv.valorLiquido || inv.valorAtual || 0);
        });
        
        const values = Object.values(alocacao);
        const labels = Object.keys(alocacao);
        const colors = ['#3498db', '#2ecc71', '#e67e22', '#9b59b6', '#1abc9c', '#34495e', '#f39c12'];
        
        this.drawPieChart(ctx, values, colors, labels);
    }
    
    createAlocacaoRendaVariavelChart() {
        const canvas = document.getElementById('alocacaoRendaVariavelChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const investimentosRV = this.investimentos.filter(inv => inv.tipo === 'renda_variavel');
        const alocacao = {};
        
        investimentosRV.forEach(inv => {
            const produto = inv.produto || inv.ativo || 'Outros';
            alocacao[produto] = (alocacao[produto] || 0) + (inv.valorLiquido || inv.valorAtual || 0);
        });
        
        const values = Object.values(alocacao);
        const labels = Object.keys(alocacao);
        const colors = ['#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#34495e', '#3498db', '#27ae60'];
        
        this.drawPieChart(ctx, values, colors, labels);
    }
    
    createMetasChart() {
        const canvas = document.getElementById('metasChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const metas = JSON.parse(localStorage.getItem('metas')) || [];
        
        const metasPorPrazo = {
            'Curto Prazo': 0,
            'Médio Prazo': 0,
            'Longo Prazo': 0
        };
        
        metas.forEach(meta => {
            const progresso = (meta.valorAtual / meta.valorObjetivo) * 100;
            if (meta.prazoTipo === 'curto') {
                metasPorPrazo['Curto Prazo'] += progresso;
            } else if (meta.prazoTipo === 'medio') {
                metasPorPrazo['Médio Prazo'] += progresso;
            } else {
                metasPorPrazo['Longo Prazo'] += progresso;
            }
        });
        
        const values = Object.values(metasPorPrazo);
        const labels = Object.keys(metasPorPrazo);
        const colors = ['#e74c3c', '#f39c12', '#27ae60'];
        
        this.drawBarChart(ctx, values, colors, labels);
    }

    drawBarChart(ctx, data, colors, labels) {
        ctx.clearRect(0, 0, 350, 250);
        
        if (data.length === 0 || data.every(val => val === 0)) {
            ctx.fillStyle = '#999';
            ctx.font = '16px Roboto';
            ctx.textAlign = 'center';
            ctx.fillText('Sem dados disponíveis', 175, 125);
            return;
        }
        
        const maxValue = Math.max(...data);
        const barWidth = Math.min(60, 280 / data.length);
        const chartHeight = 140;
        const startX = (350 - (barWidth * data.length)) / 2;
        
        data.forEach((value, index) => {
            const barHeight = (value / maxValue) * chartHeight;
            const x = startX + index * barWidth;
            const y = 180 - barHeight;
            
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
            ctx.shadowBlur = 6;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            
            const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
            gradient.addColorStop(0, colors[index % colors.length]);
            gradient.addColorStop(1, this.darkenColor(colors[index % colors.length], 0.3));
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x + 5, y, barWidth - 15, barHeight);
            
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 5, y, barWidth - 15, barHeight);
            
            ctx.restore();
            
            ctx.fillStyle = '#333';
            ctx.font = 'bold 12px Roboto';
            ctx.textAlign = 'center';
            ctx.fillText(this.formatCurrency(value), x + barWidth/2, y - 8);
            
            ctx.font = '11px Roboto';
            ctx.fillText(labels[index], x + barWidth/2, 200);
        });
    }

    drawPieChart(ctx, data, colors, labels) {
        ctx.clearRect(0, 0, 350, 250);
        
        const total = data.reduce((sum, val) => sum + val, 0);
        if (total === 0) {
            ctx.fillStyle = '#999';
            ctx.font = '16px Roboto';
            ctx.textAlign = 'center';
            ctx.fillText('Sem dados disponíveis', 175, 125);
            return;
        }
        
        let currentAngle = -Math.PI / 2;
        const centerX = 175;
        const centerY = 125;
        const radius = 70;
        
        data.forEach((value, index) => {
            const sliceAngle = (value / total) * 2 * Math.PI;
            
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.lineTo(centerX, centerY);
            
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            gradient.addColorStop(0, colors[index % colors.length]);
            gradient.addColorStop(1, this.darkenColor(colors[index % colors.length], 0.2));
            
            ctx.fillStyle = gradient;
            ctx.fill();
            
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.restore();
            currentAngle += sliceAngle;
        });
        
        const legendX = 20;
        const legendY = 180;
        ctx.font = '12px Roboto';
        ctx.textAlign = 'left';
        
        labels.forEach((label, index) => {
            const y = legendY + index * 18;
            
            ctx.fillStyle = colors[index % colors.length];
            ctx.fillRect(legendX, y - 8, 12, 12);
            ctx.strokeStyle = '#ddd';
            ctx.lineWidth = 1;
            ctx.strokeRect(legendX, y - 8, 12, 12);
            
            ctx.fillStyle = '#333';
            const percentage = ((data[index] / total) * 100).toFixed(1);
            ctx.fillText(`${label} (${percentage}%)`, legendX + 18, y + 2);
        });
    }
    
    darkenColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - Math.round(255 * amount));
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - Math.round(255 * amount));
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - Math.round(255 * amount));
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    formatCurrency(value) {
        if (value >= 1000) {
            return `R$ ${(value/1000).toFixed(1)}k`;
        }
        return `R$ ${value.toFixed(0)}`;
    }

    setupFilters() {
        this.populateYearFilters();
        this.populateAccountFilters();
        this.populateBankFilters();
    }

    populateYearFilters() {
        const years = new Set();
        [...this.contasPagar, ...this.contasReceber].forEach(item => {
            const year = new Date(item.vencimento).getFullYear();
            years.add(year);
        });
        
        const yearFilters = document.getElementById('yearFilters');
        if (yearFilters) {
            years.forEach(year => {
                const btn = document.createElement('button');
                btn.className = 'filter-btn';
                btn.setAttribute('data-year', year);
                btn.textContent = year;
                yearFilters.appendChild(btn);
            });
        }
    }

    populateAccountFilters() {
        const accounts = new Set();
        [...this.categoriasPagar, ...this.categoriasReceber].forEach(cat => {
            accounts.add(cat);
        });
        
        const accountSelect = document.getElementById('accountSelect');
        if (accountSelect) {
            accountSelect.innerHTML = '<option value="all">Todas</option>';
            
            accounts.forEach(account => {
                const option = document.createElement('option');
                option.value = account;
                option.textContent = account.charAt(0).toUpperCase() + account.slice(1);
                accountSelect.appendChild(option);
            });
        }
    }

    populateBankFilters() {
        const banks = new Set();
        this.bancos.forEach(banco => {
            banks.add(banco.nome);
        });
        
        const bankSelect = document.getElementById('bankSelect');
        if (bankSelect) {
            bankSelect.innerHTML = '<option value="all">Todos</option>';
            
            banks.forEach(bank => {
                const option = document.createElement('option');
                option.value = bank;
                option.textContent = bank;
                bankSelect.appendChild(option);
            });
        }
    }

    setupFilterListeners() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filterType = Object.keys(e.target.dataset)[0];
                const filterValue = e.target.dataset[filterType];
                
                e.target.parentElement.querySelectorAll('.filter-btn').forEach(sibling => {
                    sibling.classList.remove('active');
                });
                
                e.target.classList.add('active');
                this.filters[filterType] = filterValue;
                this.applyFilters();
            });
        });
    }

    applyFilters() {
        this.updateSummary();
        this.createCharts();
    }

    filterData(data, dateField = 'vencimento') {
        return data.filter(item => {
            const date = new Date(item[dateField]);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            
            if (this.filters.year !== 'all' && year !== parseInt(this.filters.year)) {
                return false;
            }
            
            if (this.filters.month !== 'all' && month !== parseInt(this.filters.month)) {
                return false;
            }
            
            if (this.filters.account !== 'all' && item.categoria !== this.filters.account) {
                return false;
            }
            
            return true;
        });
    }

    clearFilters() {
        this.filters = {
            year: 'all',
            month: 'all',
            account: 'all',
            bank: 'all'
        };
        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.year === 'all' || btn.dataset.account === 'all' || btn.dataset.bank === 'all') {
                btn.classList.add('active');
            }
        });
        
        const customYearInput = document.getElementById('customYear');
        if (customYearInput) {
            customYearInput.value = '';
        }
        
        const monthSelect = document.getElementById('monthSelect');
        if (monthSelect) {
            monthSelect.value = 'all';
        }
        
        const accountSelect = document.getElementById('accountSelect');
        if (accountSelect) {
            accountSelect.value = 'all';
        }
        
        const bankSelect = document.getElementById('bankSelect');
        if (bankSelect) {
            bankSelect.value = 'all';
        }
        
        this.applyFilters();
    }

    setupCustomYearListener() {
        const customYearInput = document.getElementById('customYear');
        if (customYearInput) {
            customYearInput.addEventListener('input', (e) => {
                const year = e.target.value;
                if (year && year.length === 4) {
                    document.querySelectorAll('#yearFilters .filter-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    
                    this.filters.year = year;
                    this.applyFilters();
                }
            });
            
            customYearInput.addEventListener('blur', (e) => {
                if (!e.target.value) {
                    const allBtn = document.querySelector('#yearFilters .filter-btn[data-year="all"]');
                    if (allBtn) allBtn.classList.add('active');
                    this.filters.year = 'all';
                    this.applyFilters();
                }
            });
        }
    }

    setupMonthSelectListener() {
        const monthSelect = document.getElementById('monthSelect');
        if (monthSelect) {
            monthSelect.addEventListener('change', (e) => {
                this.filters.month = e.target.value;
                this.applyFilters();
            });
        }
    }

    setupAccountSelectListener() {
        const accountSelect = document.getElementById('accountSelect');
        if (accountSelect) {
            accountSelect.addEventListener('change', (e) => {
                this.filters.account = e.target.value;
                this.applyFilters();
            });
        }
    }

    setupBankSelectListener() {
        const bankSelect = document.getElementById('bankSelect');
        if (bankSelect) {
            bankSelect.addEventListener('change', (e) => {
                this.filters.bank = e.target.value;
                this.applyFilters();
            });
        }
    }
}

// Global functions for tab management
function showTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    const tabContent = document.getElementById(tabName);
    if (tabContent) {
        tabContent.classList.add('active');
    }
}

// User profile management
let userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};

function showUserModal() {
    const modal = document.getElementById('userModal');
    if (modal) {
        modal.style.display = 'block';
        
        if (userProfile.name) {
            const nameInput = document.getElementById('userName');
            const emailInput = document.getElementById('userEmail');
            const phoneInput = document.getElementById('userPhone');
            
            if (nameInput) nameInput.value = userProfile.name;
            if (emailInput) emailInput.value = userProfile.email || '';
            if (phoneInput) phoneInput.value = userProfile.phone || '';
        }
    }
}

function closeUserModal() {
    const modal = document.getElementById('userModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('userModal');
    if (modal && event.target === modal) {
        closeUserModal();
    }
}

// Handle user form submission
document.addEventListener('DOMContentLoaded', function() {
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nameInput = document.getElementById('userName');
            const emailInput = document.getElementById('userEmail');
            const phoneInput = document.getElementById('userPhone');
            
            userProfile = {
                name: nameInput ? nameInput.value : '',
                email: emailInput ? emailInput.value : '',
                phone: phoneInput ? phoneInput.value : ''
            };
            
            localStorage.setItem('userProfile', JSON.stringify(userProfile));
            
            if (window.app) {
                app.showNotification('Perfil salvo com sucesso!', 'success');
            }
            closeUserModal();
        });
    }
});

// Handle navigation based on URL hash
function handleNavigation() {
    const hash = window.location.hash.substring(1);
    if (hash && ['setup', 'pagar', 'receber', 'investimentos'].includes(hash)) {
        showTab(hash);
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') && link.getAttribute('href').includes(hash)) {
                link.classList.add('active');
            }
        });
    }
}

// Listen for hash changes
window.addEventListener('hashchange', handleNavigation);
window.addEventListener('load', handleNavigation);

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.app = new FinancasApp();
});