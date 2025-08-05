class CadastrosManager {
    constructor() {
        this.bancos = JSON.parse(localStorage.getItem('bancos')) || [];
        this.contas = JSON.parse(localStorage.getItem('contas')) || [];
        this.cartoes = JSON.parse(localStorage.getItem('cartoes')) || [];
        this.categoriasPagar = JSON.parse(localStorage.getItem('categoriasPagar')) || [];
        this.categoriasReceber = JSON.parse(localStorage.getItem('categoriasReceber')) || [];
        this.formasPagamento = JSON.parse(localStorage.getItem('formasPagamento')) || [];
        this.produtosRendaFixa = JSON.parse(localStorage.getItem('produtosRendaFixa')) || [
            'CDB Pré-fixado', 'CDB Pós-fixado', 'LCI Pré-fixado', 'LCI Pós-fixado',
            'LCA Pré-fixado', 'LCA Pós-fixado', 'Tesouro Pré-fixado', 'Tesouro Selic',
            'Tesouro IPCA+', 'Fundo de Renda Fixa', 'Debêntures'
        ];
        this.produtosRendaVariavel = JSON.parse(localStorage.getItem('produtosRendaVariavel')) || [
            'Ação', 'FIIs', 'ETFs', 'Cripto'
        ];
        this.perfil = JSON.parse(localStorage.getItem('perfil')) || {};
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderAll();
        this.loadPerfil();
        this.updateSelects();
        
        // Mostrar aba bancos por padrão se houver bancos cadastrados
        if (this.bancos.length > 0) {
            setTimeout(() => {
                const bancosTab = document.querySelector('[onclick="showConfigTab(\'bancos\')"]');
                if (bancosTab) {
                    bancosTab.click();
                }
            }, 100);
        }
    }

    setupEventListeners() {
        const formPerfil = document.getElementById('formPerfil');
        if (formPerfil) {
            formPerfil.addEventListener('submit', (e) => {
                e.preventDefault();
                this.savePerfil();
            });
        }

        const formBanco = document.getElementById('formBanco');
        if (formBanco) {
            formBanco.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addBanco();
            });
        }

        const formCategoriaPagar = document.getElementById('formCategoriaPagar');
        if (formCategoriaPagar) {
            formCategoriaPagar.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addCategoriaPagar();
            });
        }

        const formCategoriaReceber = document.getElementById('formCategoriaReceber');
        if (formCategoriaReceber) {
            formCategoriaReceber.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addCategoriaReceber();
            });
        }

        const formPagamento = document.getElementById('formPagamento');
        if (formPagamento) {
            formPagamento.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addFormaPagamento();
            });
        }

        const formRendaFixa = document.getElementById('formRendaFixa');
        if (formRendaFixa) {
            formRendaFixa.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addProdutoRendaFixa();
            });
        }

        const formRendaVariavel = document.getElementById('formRendaVariavel');
        if (formRendaVariavel) {
            formRendaVariavel.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addProdutoRendaVariavel();
            });
        }
    }

    savePerfil() {
        const senhaAtual = document.getElementById('senhaAtual').value;
        const novaSenha = document.getElementById('novaSenha').value;
        const confirmarSenha = document.getElementById('confirmarSenha').value;
        const nomeAtual = document.getElementById('nomeUsuario').value;
        const emailAtual = document.getElementById('emailUsuario').value;
        
        if (novaSenha && novaSenha !== confirmarSenha) {
            this.showNotification('Senhas não coincidem!', 'error');
            return;
        }
        
        // Verificar se houve alterações
        const perfilAnterior = this.perfil;
        let houveMudanca = false;
        
        if (perfilAnterior.nome !== nomeAtual || perfilAnterior.email !== emailAtual || novaSenha) {
            houveMudanca = true;
        }
        
        this.perfil = {
            nome: nomeAtual,
            email: emailAtual
        };
        
        if (novaSenha) {
            this.perfil.senha = novaSenha; // Em produção, usar hash
        }

        localStorage.setItem('perfil', JSON.stringify(this.perfil));
        localStorage.setItem('userData', JSON.stringify({ name: this.perfil.nome }));
        
        if (houveMudanca) {
            this.showNotification('Perfil alterado com sucesso!', 'success');
        } else {
            this.showNotification('Nenhuma alteração foi feita no perfil.', 'warning');
        }
        
        // Limpar campos de senha
        document.getElementById('senhaAtual').value = '';
        document.getElementById('novaSenha').value = '';
        document.getElementById('confirmarSenha').value = '';
    }
    
    addBanco() {
        const nomeBanco = document.getElementById('nomeBanco').value.trim();
        
        // Verificar se já existe banco com mesmo nome
        if (this.bancos.some(b => b.nome.toLowerCase() === nomeBanco.toLowerCase())) {
            this.showNotification('Já existe um banco com este nome!', 'error');
            return;
        }
        
        const banco = {
            id: Date.now(),
            nome: nomeBanco
        };

        this.bancos.push(banco);
        this.saveData();
        this.renderBancos();
        this.updateSelects();
        document.getElementById('formBanco').reset();
        this.showNotification('Banco adicionado!', 'success');
        
        // Forçar atualização da lista
        console.log('Banco adicionado, total de bancos:', this.bancos.length);
        setTimeout(() => {
            console.log('Executando renderBancos após timeout');
            this.renderBancos();
        }, 100);
    }
    
    addConta() {
        const conta = {
            id: Date.now(),
            banco: document.getElementById('bancoConta').value,
            nome: document.getElementById('nomeConta').value,
            tipo: document.getElementById('tipoConta').value,
            agencia: document.getElementById('agencia').value,
            numero: document.getElementById('numeroConta').value
        };

        this.contas.push(conta);
        this.saveData();
        this.renderContas();
        document.getElementById('formConta').reset();
        this.showNotification('Conta adicionada!', 'success');
    }
    
    addCartao() {
        const cartao = {
            id: Date.now(),
            banco: document.getElementById('bancoCartao').value,
            nome: document.getElementById('nomeCartao').value,
            tipo: document.getElementById('tipoCartao').value,
            limite: parseFloat(document.getElementById('limiteCartao').value) || 0,
            diaVencimento: parseInt(document.getElementById('diaVencimento').value) || null,
            ultimosDigitos: document.getElementById('ultimosDigitos').value
        };

        this.cartoes.push(cartao);
        this.saveData();
        this.renderCartoes();
        document.getElementById('formCartao').reset();
        this.showNotification('Cartão adicionado!', 'success');
    }

    addCategoriaPagar() {
        const categoria = document.getElementById('nomeCategoriaPagar').value.toLowerCase();
        if (categoria && !this.categoriasPagar.includes(categoria)) {
            this.categoriasPagar.push(categoria);
            this.saveData();
            this.renderCategoriasPagar();
            document.getElementById('formCategoriaPagar').reset();
            this.showNotification('Categoria adicionada!', 'success');
        }
    }
    
    addCategoriaReceber() {
        const categoria = document.getElementById('nomeCategoriaReceber').value.toLowerCase();
        if (categoria && !this.categoriasReceber.includes(categoria)) {
            this.categoriasReceber.push(categoria);
            this.saveData();
            this.renderCategoriasReceber();
            document.getElementById('formCategoriaReceber').reset();
            this.showNotification('Categoria adicionada!', 'success');
        }
    }
    
    addFormaPagamento() {
        const forma = {
            id: Date.now(),
            nome: document.getElementById('nomePagamento').value,
            tipo: document.getElementById('tipoPagamento').value,
            descricao: document.getElementById('descricaoPagamento').value
        };

        this.formasPagamento.push(forma);
        this.saveData();
        this.renderFormasPagamento();
        document.getElementById('formPagamento').reset();
        this.showNotification('Forma de pagamento adicionada!', 'success');
    }

    savePerfil() {
        this.perfil = {
            nome: document.getElementById('nomeUsuario').value,
            email: document.getElementById('emailUsuario').value,
            telefone: document.getElementById('telefoneUsuario').value,
            cpf: document.getElementById('cpfUsuario').value,
            nascimento: document.getElementById('nascimentoUsuario').value
        };

        localStorage.setItem('perfil', JSON.stringify(this.perfil));
        localStorage.setItem('userData', JSON.stringify({ name: this.perfil.nome }));
        this.renderPerfil();
        this.showNotification('Perfil salvo!', 'success');
    }

    renderPessoas() {
        const lista = document.getElementById('listaPessoas');
        lista.innerHTML = '';

        this.pessoas.forEach(pessoa => {
            const item = document.createElement('div');
            item.className = 'config-item';
            item.innerHTML = `
                <div class="config-item-info">
                    <h4>${pessoa.nome}</h4>
                    <p>Tipo: ${pessoa.tipo}</p>
                    ${pessoa.telefone ? `<p>Telefone: ${pessoa.telefone}</p>` : ''}
                    ${pessoa.email ? `<p>Email: ${pessoa.email}</p>` : ''}
                </div>
                <button class="btn-small btn-danger" onclick="cadastrosManager.removePessoa(${pessoa.id})">Excluir</button>
            `;
            lista.appendChild(item);
        });
    }

    renderCategoriasPagar() {
        const lista = document.getElementById('listaCategoriasPagar');
        lista.innerHTML = '';

        this.categoriasPagar.forEach((categoria, index) => {
            const item = document.createElement('div');
            item.className = 'config-item';
            item.innerHTML = `
                <div class="config-item-info">
                    <h4>${categoria.charAt(0).toUpperCase() + categoria.slice(1)}</h4>
                </div>
                <button class="add-btn compact btn-danger" onclick="cadastrosManager.removeCategoriaPagar(${index})">-</button>
            `;
            lista.appendChild(item);
        });
    }
    
    renderCategoriasReceber() {
        const lista = document.getElementById('listaCategoriasReceber');
        lista.innerHTML = '';

        this.categoriasReceber.forEach((categoria, index) => {
            const item = document.createElement('div');
            item.className = 'config-item';
            item.innerHTML = `
                <div class="config-item-info">
                    <h4>${categoria.charAt(0).toUpperCase() + categoria.slice(1)}</h4>
                </div>
                <button class="add-btn compact btn-danger" onclick="cadastrosManager.removeCategoriaReceber(${index})">-</button>
            `;
            lista.appendChild(item);
        });
    }
    
    renderFormasPagamento() {
        const lista = document.getElementById('listaPagamentos');
        lista.innerHTML = '';

        this.formasPagamento.forEach(forma => {
            const item = document.createElement('div');
            item.className = 'config-item';
            item.innerHTML = `
                <div class="config-item-info">
                    <h4>${forma.nome}</h4>
                    <p>Tipo: ${forma.tipo}</p>
                    ${forma.descricao ? `<p>${forma.descricao}</p>` : ''}
                </div>
                <button class="add-btn compact btn-danger" onclick="cadastrosManager.removeFormaPagamento(${forma.id})">-</button>
            `;
            lista.appendChild(item);
        });
    }

    renderPerfil() {
        const info = document.getElementById('infoPerfil');
        if (!info) return;
        
        if (this.perfil.nome) {
            info.innerHTML = `
                <div class="perfil-info">
                    <h4>${this.perfil.nome}</h4>
                    ${this.perfil.email ? `<p>Email: ${this.perfil.email}</p>` : ''}
                    ${this.perfil.telefone ? `<p>Telefone: ${this.perfil.telefone}</p>` : ''}
                    ${this.perfil.cpf ? `<p>CPF: ${this.perfil.cpf}</p>` : ''}
                    ${this.perfil.nascimento ? `<p>Nascimento: ${this.formatDate(this.perfil.nascimento)}</p>` : ''}
                </div>
            `;
        } else {
            info.innerHTML = '<p>Preencha seus dados pessoais para personalizar sua experiência no Cherry.</p>';
        }
    }

    loadPerfil() {
        if (this.perfil.nome) {
            const nomeUsuario = document.getElementById('nomeUsuario');
            const emailUsuario = document.getElementById('emailUsuario');
            
            if (nomeUsuario) nomeUsuario.value = this.perfil.nome;
            if (emailUsuario) emailUsuario.value = this.perfil.email || '';
        }
    }

    renderAll() {
        this.renderBancos();
        this.renderCategoriasPagar();
        this.renderCategoriasReceber();
        this.renderFormasPagamento();
        this.renderProdutosInvestimentos();
        this.renderPerfil();
    }
    
    renderBancos() {
        const lista = document.getElementById('listaBancos');
        if (!lista) {
            console.log('Elemento listaBancos não encontrado');
            return;
        }
        
        console.log('Renderizando bancos:', this.bancos);
        lista.innerHTML = '';

        this.bancos.forEach(banco => {
            const item = document.createElement('div');
            item.className = 'account-item-wrapper';
            item.innerHTML = `
                <div class="account-item">
                    <div class="account-info" onclick="window.cadastrosManager.toggleBancoContas(${banco.id})" style="cursor: pointer;">
                        <div class="account-details">
                            <h4>${banco.nome}</h4>
                            <p>Clique para gerenciar contas e cartões</p>
                        </div>
                    </div>
                    <div class="account-actions">
                        <button class="btn-small btn-danger" onclick="window.cadastrosManager.removeBanco(${banco.id})">Excluir</button>
                    </div>
                </div>
                <div id="contas-${banco.id}" class="banco-contas" style="display: none;">
                    <div class="banco-tabs">
                        <button class="banco-tab-btn active" onclick="showBancoTab(${banco.id}, 'contas')">Contas</button>
                        <button class="banco-tab-btn" onclick="showBancoTab(${banco.id}, 'cartoes')">Cartões</button>
                    </div>
                    
                    <div id="contas-tab-${banco.id}" class="banco-tab-content active">
                        <form class="conta-form" onsubmit="window.cadastrosManager.addContaToBanco(event, ${banco.id})">
                            <input type="text" placeholder="Nome da Conta" required>
                            <select required>
                                <option value="">Tipo da Conta</option>
                                <option value="corrente">Conta Corrente</option>
                                <option value="poupanca">Poupança</option>
                                <option value="salario">Conta Salário</option>
                                <option value="investimento">Conta Investimento</option>
                                <option value="pagamento">Conta de Pagamento</option>
                            </select>
                            <input type="text" placeholder="Agência">
                            <input type="text" placeholder="Número da Conta">
                            <input type="number" placeholder="Saldo Atual" step="0.01" required>
                            <button type="submit" class="add-btn compact">+</button>
                        </form>
                        <div class="contas-list" id="contas-list-${banco.id}"></div>
                    </div>
                    
                    <div id="cartoes-tab-${banco.id}" class="banco-tab-content">
                        <form class="conta-form" onsubmit="window.cadastrosManager.addCartaoToBanco(event, ${banco.id})">
                            <input type="text" placeholder="Nome do Cartão" required>
                            <select required>
                                <option value="">Tipo</option>
                                <option value="credito">Crédito</option>
                                <option value="debito">Débito</option>
                            </select>
                            <select required>
                                <option value="fisico">Físico</option>
                                <option value="digital">Digital</option>
                            </select>
                            <input type="number" placeholder="Limite" step="0.01">
                            <input type="number" placeholder="Dia Venc" min="1" max="31">
                            <input type="text" placeholder="4 dígitos" maxlength="4" pattern="[0-9]{4}">
                            <button type="submit" class="add-btn compact">+</button>
                        </form>
                        <div class="cartoes-list" id="cartoes-list-${banco.id}"></div>
                    </div>
                </div>
            `;
            lista.appendChild(item);
            
            // Renderizar contas e cartões do banco
            this.renderContasDoBanco(banco.id);
            this.renderCartoesDoBanco(banco.id);
        });
    }
    
    renderContas() {
        const lista = document.getElementById('listaContas');
        lista.innerHTML = '';

        this.contas.forEach(conta => {
            const banco = this.bancos.find(b => b.id == conta.banco);
            const item = document.createElement('div');
            item.className = 'config-item';
            item.innerHTML = `
                <div class="config-item-info">
                    <h4>${conta.nome}</h4>
                    <p>Banco: ${banco ? banco.nome : 'N/A'}</p>
                    <p>Tipo: ${conta.tipo}</p>
                    ${conta.agencia ? `<p>Agência: ${conta.agencia}</p>` : ''}
                    ${conta.numero ? `<p>Conta: ${conta.numero}</p>` : ''}
                </div>
                <button class="add-btn compact btn-danger" onclick="cadastrosManager.removeConta(${conta.id})">-</button>
            `;
            lista.appendChild(item);
        });
    }
    
    renderCartoes() {
        const lista = document.getElementById('listaCartoes');
        lista.innerHTML = '';

        this.cartoes.forEach(cartao => {
            const banco = this.bancos.find(b => b.id == cartao.banco);
            const item = document.createElement('div');
            item.className = 'config-item';
            item.innerHTML = `
                <div class="config-item-info">
                    <h4>${cartao.nome}</h4>
                    <p>Banco: ${banco ? banco.nome : 'N/A'}</p>
                    <p>Tipo: ${cartao.tipo}</p>
                    ${cartao.limite ? `<p>Limite: R$ ${cartao.limite.toFixed(2)}</p>` : ''}
                    ${cartao.diaVencimento ? `<p>Vencimento: Dia ${cartao.diaVencimento}</p>` : ''}
                    ${cartao.ultimosDigitos ? `<p>Final: ****${cartao.ultimosDigitos}</p>` : ''}
                </div>
                <button class="add-btn compact btn-danger" onclick="cadastrosManager.removeCartao(${cartao.id})">-</button>
            `;
            lista.appendChild(item);
        });
    }

    removePessoa(id) {
        if (confirm('Tem certeza que deseja excluir esta pessoa?')) {
            this.pessoas = this.pessoas.filter(p => p.id !== id);
            this.saveData();
            this.renderPessoas();
            this.showNotification('Pessoa removida!', 'success');
        }
    }

    removeCategoria(tipo, index) {
        if (confirm('Tem certeza que deseja excluir esta categoria?')) {
            if (tipo === 'pagar') {
                this.categoriasPagar.splice(index, 1);
            } else {
                this.categoriasReceber.splice(index, 1);
            }
            this.saveData();
            this.renderCategorias();
            this.showNotification('Categoria removida!', 'success');
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    updateSelects() {
        // Update banco selects
        const bancoContaSelect = document.getElementById('bancoConta');
        const bancoCartaoSelect = document.getElementById('bancoCartao');
        
        [bancoContaSelect, bancoCartaoSelect].filter(select => select).forEach(select => {
            const currentValue = select.value;
            select.innerHTML = '<option value="">Selecione o Banco</option>';
            
            this.bancos.forEach(banco => {
                const option = document.createElement('option');
                option.value = banco.id;
                option.textContent = banco.nome;
                select.appendChild(option);
            });
            
            select.value = currentValue;
        });
        
        // Update conta and cartao selects for formas de pagamento
        const contaPagamentoSelect = document.getElementById('contaPagamento');
        const cartaoPagamentoSelect = document.getElementById('cartaoPagamento');
        
        if (contaPagamentoSelect) {
            contaPagamentoSelect.innerHTML = '<option value="">Selecione a Conta</option>';
            this.contas.forEach(conta => {
                const banco = this.bancos.find(b => b.id == conta.banco);
                const option = document.createElement('option');
                option.value = conta.id;
                option.textContent = `${conta.nome} - ${banco ? banco.nome : 'N/A'}`;
                contaPagamentoSelect.appendChild(option);
            });
        }
        
        if (cartaoPagamentoSelect) {
            cartaoPagamentoSelect.innerHTML = '<option value="">Selecione o Cartão</option>';
            this.cartoes.forEach(cartao => {
                const banco = this.bancos.find(b => b.id == cartao.banco);
                const option = document.createElement('option');
                option.value = cartao.id;
                option.textContent = `${cartao.nome} - ${banco ? banco.nome : 'N/A'} ${cartao.ultimosDigitos ? `(****${cartao.ultimosDigitos})` : ''}`;
                cartaoPagamentoSelect.appendChild(option);
            });
        }
    }
    
    removeBanco(id) {
        if (confirm('Tem certeza que deseja excluir este banco?')) {
            this.bancos = this.bancos.filter(b => b.id !== id);
            this.contas = this.contas.filter(c => c.banco != id);
            this.cartoes = this.cartoes.filter(c => c.banco != id);
            
            this.saveData();
            this.renderBancos();
            this.updateSelects();
            this.showNotification('Banco removido!', 'success');
        }
    }
    
    editBanco(id) {
        const banco = this.bancos.find(b => b.id === id);
        if (!banco) return;
        
        const novoNome = prompt('Digite o novo nome do banco:', banco.nome);
        if (novoNome && novoNome.trim() !== '') {
            banco.nome = novoNome.trim();
            this.saveData();
            this.renderBancos();
            this.updateSelects();
            this.showNotification('Banco alterado com sucesso!', 'success');
        }
    }
    
    toggleBancoContas(bancoId) {
        const contasDiv = document.getElementById(`contas-${bancoId}`);
        contasDiv.style.display = contasDiv.style.display === 'none' ? 'block' : 'none';
    }
    
    addContaToBanco(event, bancoId) {
        event.preventDefault();
        const form = event.target;
        const inputs = form.querySelectorAll('input, select');
        
        const nomeConta = inputs[0].value.trim();
        const tipoConta = inputs[1].value;
        const agenciaConta = inputs[2].value.trim();
        const numeroConta = inputs[3].value.trim();
        
        // Verificar se já existe conta com mesmo nome no mesmo banco
        const contasExistentes = this.contas.filter(c => c.banco === bancoId);
        const contaExiste = contasExistentes.some(c => 
            c.nome.toLowerCase() === nomeConta.toLowerCase()
        );
        
        if (contaExiste) {
            this.showNotification('Já existe uma conta com este nome neste banco!', 'error');
            return;
        }
        
        const conta = {
            id: Date.now(),
            banco: bancoId,
            nome: nomeConta,
            tipo: tipoConta,
            agencia: agenciaConta,
            numero: numeroConta,
            saldo: parseFloat(inputs[4].value) || 0
        };
        
        this.contas.push(conta);
        this.saveData();
        this.renderContasDoBanco(bancoId);
        form.reset();
        this.showNotification('Conta adicionada!', 'success');
    }
    
    addCartaoToBanco(event, bancoId) {
        event.preventDefault();
        const form = event.target;
        const inputs = form.querySelectorAll('input, select');
        
        const nomeCartao = inputs[0].value.trim();
        const tipoCartao = inputs[1].value;
        const formatoCartao = inputs[2].value;
        const ultimosDigitosCartao = inputs[5].value.trim();
        
        // Verificar se já existe cartão com mesmo nome no mesmo banco
        const cartoesExistentes = this.cartoes.filter(c => c.banco === bancoId);
        const cartaoExiste = cartoesExistentes.some(c => 
            c.nome.toLowerCase() === nomeCartao.toLowerCase()
        );
        
        if (cartaoExiste) {
            this.showNotification('Já existe um cartão com este nome neste banco!', 'error');
            return;
        }
        
        const cartao = {
            id: Date.now(),
            banco: bancoId,
            nome: nomeCartao,
            tipo: tipoCartao,
            formato: formatoCartao,
            limite: parseFloat(inputs[3].value) || 0,
            diaVencimento: parseInt(inputs[4].value) || null,
            ultimosDigitos: ultimosDigitosCartao
        };
        
        this.cartoes.push(cartao);
        this.saveData();
        this.renderCartoesDoBanco(bancoId);
        form.reset();
        this.showNotification('Cartão adicionado!', 'success');
    }
    
    renderContasDoBanco(bancoId) {
        const contasList = document.getElementById(`contas-list-${bancoId}`);
        if (!contasList) return;
        
        const contasDoBanco = this.contas.filter(c => c.banco === bancoId);
        contasList.innerHTML = '';
        
        contasDoBanco.forEach(conta => {
            const item = document.createElement('div');
            item.className = 'conta-item';
            item.innerHTML = `
                <div class="conta-info">
                    <strong>${conta.nome}</strong> - ${conta.tipo}
                    ${conta.agencia ? ` | Ag: ${conta.agencia}` : ''}
                    ${conta.numero ? ` | Conta: ${conta.numero}` : ''}
                    | Saldo: R$ ${conta.saldo ? conta.saldo.toFixed(2) : '0,00'}
                </div>
                <button class="add-btn compact btn-danger" onclick="window.cadastrosManager.removeConta(${conta.id})">-</button>
            `;
            contasList.appendChild(item);
        });
    }
    
    renderCartoesDoBanco(bancoId) {
        const cartoesList = document.getElementById(`cartoes-list-${bancoId}`);
        if (!cartoesList) return;
        
        const cartoesDoBanco = this.cartoes.filter(c => c.banco === bancoId);
        cartoesList.innerHTML = '';
        
        cartoesDoBanco.forEach(cartao => {
            const item = document.createElement('div');
            item.className = 'conta-item';
            item.innerHTML = `
                <div class="conta-info">
                    <strong>${cartao.nome}</strong> - ${cartao.tipo}
                    ${cartao.formato ? ` | ${cartao.formato.charAt(0).toUpperCase() + cartao.formato.slice(1)}` : ''}
                    ${cartao.limite ? ` | Limite: R$ ${cartao.limite.toFixed(2)}` : ''}
                    ${cartao.diaVencimento ? ` | Venc: Dia ${cartao.diaVencimento}` : ''}
                    ${cartao.ultimosDigitos ? ` | ****${cartao.ultimosDigitos}` : ''}
                </div>
                <button class="add-btn compact btn-danger" onclick="window.cadastrosManager.removeCartao(${cartao.id})">-</button>
            `;
            cartoesList.appendChild(item);
        });
    }
    
    removeConta(id) {
        if (confirm('Tem certeza que deseja excluir esta conta?')) {
            this.contas = this.contas.filter(c => c.id !== id);
            this.saveData();
            this.renderBancos();
            this.showNotification('Conta removida!', 'success');
        }
    }
    
    removeCartao(id) {
        if (confirm('Tem certeza que deseja excluir este cartão?')) {
            this.cartoes = this.cartoes.filter(c => c.id !== id);
            this.saveData();
            this.renderBancos();
            this.showNotification('Cartão removido!', 'success');
        }
    }
    
    removeCategoriaPagar(index) {
        if (confirm('Tem certeza que deseja excluir esta categoria?')) {
            this.categoriasPagar.splice(index, 1);
            this.saveData();
            this.renderCategoriasPagar();
            this.showNotification('Categoria removida!', 'success');
        }
    }
    
    removeCategoriaReceber(index) {
        if (confirm('Tem certeza que deseja excluir esta categoria?')) {
            this.categoriasReceber.splice(index, 1);
            this.saveData();
            this.renderCategoriasReceber();
            this.showNotification('Categoria removida!', 'success');
        }
    }
    
    removeFormaPagamento(id) {
        if (confirm('Tem certeza que deseja excluir esta forma de pagamento?')) {
            this.formasPagamento = this.formasPagamento.filter(f => f.id !== id);
            this.saveData();
            this.renderFormasPagamento();
            this.showNotification('Forma de pagamento removida!', 'success');
        }
    }

    addProdutoRendaFixa() {
        const produto = document.getElementById('nomeProdutoRF').value.trim();
        if (produto && !this.produtosRendaFixa.includes(produto)) {
            this.produtosRendaFixa.push(produto);
            this.saveData();
            this.renderProdutosInvestimentos();
            document.getElementById('formRendaFixa').reset();
            this.showNotification('Produto adicionado!', 'success');
        }
    }
    
    addProdutoRendaVariavel() {
        const produto = document.getElementById('nomeProdutoRV').value.trim();
        if (produto && !this.produtosRendaVariavel.includes(produto)) {
            this.produtosRendaVariavel.push(produto);
            this.saveData();
            this.renderProdutosInvestimentos();
            document.getElementById('formRendaVariavel').reset();
            this.showNotification('Produto adicionado!', 'success');
        }
    }
    
    renderProdutosInvestimentos() {
        this.renderProdutosRendaFixa();
        this.renderProdutosRendaVariavel();
    }
    
    renderProdutosRendaFixa() {
        const lista = document.getElementById('listaProdutosRF');
        if (!lista) return;
        
        lista.innerHTML = '';
        this.produtosRendaFixa.forEach((produto, index) => {
            const item = document.createElement('div');
            item.className = 'config-item';
            item.innerHTML = `
                <div class="config-item-info">
                    <h4>${produto}</h4>
                </div>
                <button class="add-btn compact btn-danger" onclick="cadastrosManager.removeProdutoRendaFixa(${index})">-</button>
            `;
            lista.appendChild(item);
        });
    }
    
    renderProdutosRendaVariavel() {
        const lista = document.getElementById('listaProdutosRV');
        if (!lista) return;
        
        lista.innerHTML = '';
        this.produtosRendaVariavel.forEach((produto, index) => {
            const item = document.createElement('div');
            item.className = 'config-item';
            item.innerHTML = `
                <div class="config-item-info">
                    <h4>${produto}</h4>
                </div>
                <button class="add-btn compact btn-danger" onclick="cadastrosManager.removeProdutoRendaVariavel(${index})">-</button>
            `;
            lista.appendChild(item);
        });
    }
    
    removeProdutoRendaFixa(index) {
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            this.produtosRendaFixa.splice(index, 1);
            this.saveData();
            this.renderProdutosRendaFixa();
            this.showNotification('Produto removido!', 'success');
        }
    }
    
    removeProdutoRendaVariavel(index) {
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            this.produtosRendaVariavel.splice(index, 1);
            this.saveData();
            this.renderProdutosRendaVariavel();
            this.showNotification('Produto removido!', 'success');
        }
    }

    saveData() {
        localStorage.setItem('bancos', JSON.stringify(this.bancos));
        localStorage.setItem('contas', JSON.stringify(this.contas));
        localStorage.setItem('cartoes', JSON.stringify(this.cartoes));
        localStorage.setItem('categoriasPagar', JSON.stringify(this.categoriasPagar));
        localStorage.setItem('categoriasReceber', JSON.stringify(this.categoriasReceber));
        localStorage.setItem('formasPagamento', JSON.stringify(this.formasPagamento));
        localStorage.setItem('produtosRendaFixa', JSON.stringify(this.produtosRendaFixa));
        localStorage.setItem('produtosRendaVariavel', JSON.stringify(this.produtosRendaVariavel));
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.success};
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

function showConfigTab(tabName) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.config-content').forEach(content => content.classList.remove('active'));

    // Add active class to clicked tab and corresponding content
    if (event && event.target) {
        event.target.classList.add('active');
    }
    const tabContent = document.getElementById(tabName);
    if (tabContent) {
        tabContent.classList.add('active');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.cadastrosManager = new CadastrosManager();
});