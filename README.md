# 🍒 Cherry Financial System

Um sistema completo de gestão financeira pessoal desenvolvido com HTML, CSS e JavaScript vanilla.

## 📋 Funcionalidades

### 💰 Gestão Financeira
- **Contas a Pagar**: Controle de despesas com categorização e status
- **Contas a Receber**: Gerenciamento de receitas e recebimentos
- **Terceiros**: Sistema de empréstimos (dados e recebidos)
- **Investimentos**: Acompanhamento de renda fixa e variável
- **Metas**: Definição e acompanhamento de objetivos financeiros

### 📊 Dashboard e Relatórios
- Dashboard interativo com gráficos em tempo real
- Filtros por ano, mês, conta e banco
- Análise de patrimônio (ativo vs passivo)
- Perfil de investidor e alocação de ativos
- Progresso de metas por prazo

### ⚙️ Configurações
- Cadastro de bancos, contas e cartões
- Categorias personalizadas
- Formas de pagamento
- Produtos de investimento

## 🚀 Tecnologias

- **HTML5**: Estrutura semântica e acessível
- **CSS3**: Design responsivo com tema Cherry (#DE3163)
- **JavaScript ES6+**: Lógica de negócio e manipulação do DOM
- **LocalStorage**: Persistência de dados no navegador
- **Canvas API**: Gráficos customizados

## 📁 Estrutura do Projeto

```
cherry-financial-system/
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── scripts.js (dashboard)
│   │   ├── pagar-script.js
│   │   ├── receber-script.js
│   │   ├── terceiros-script.js
│   │   ├── investimentos-script.js
│   │   ├── metas-script.js
│   │   └── cadastros-script.js
│   └── images/
├── pages/
│   ├── pagar.html
│   ├── receber.html
│   ├── terceiros.html
│   ├── investimentos.html
│   ├── metas.html
│   └── cadastros.html
├── index.html
└── README.md
```

## 🎨 Design System

### Cores Principais
- **Cherry**: #DE3163 (cor principal)
- **Cherry Gradient**: #DE3163 → #ff6b9d
- **Sucesso**: #27ae60
- **Aviso**: #f39c12
- **Erro**: #e74c3c
- **Neutro**: #2c3e50

### Tipografia
- **Fonte**: Roboto (Google Fonts)
- **Pesos**: 300, 400, 500, 700

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (até 767px)

## ♿ Acessibilidade

- Navegação por teclado
- Atributos ARIA apropriados
- Contraste adequado de cores
- Labels descritivos
- Estrutura semântica

## 🔧 Como Usar

1. Abra o arquivo `index.html` em um navegador moderno
2. Configure seus bancos e contas em "Cadastros"
3. Adicione suas transações nas respectivas seções
4. Acompanhe seu progresso no dashboard

## 💾 Armazenamento

Todos os dados são armazenados localmente no navegador usando LocalStorage:
- `contasPagar`: Lista de contas a pagar
- `contasReceber`: Lista de contas a receber
- `loans`: Empréstimos de terceiros
- `investimentos`: Carteira de investimentos
- `metas`: Objetivos financeiros
- `bancos`: Instituições financeiras
- `contas`: Contas bancárias
- `cartoes`: Cartões de crédito/débito

## 🔒 Segurança

- Dados armazenados apenas localmente
- Nenhuma informação enviada para servidores externos
- Controle total do usuário sobre seus dados

## 🌟 Características Técnicas

- **Performance**: Carregamento rápido com assets otimizados
- **Compatibilidade**: Funciona em navegadores modernos
- **Manutenibilidade**: Código organizado e documentado
- **Escalabilidade**: Arquitetura modular para futuras expansões

## 📈 Funcionalidades Avançadas

### Gráficos Interativos
- Gráficos de pizza para distribuição
- Gráficos de barras para comparações
- Gradientes e sombras para melhor visualização
- Legendas informativas com percentuais

### Sistema de Filtros
- Filtros dinâmicos por período
- Busca por categorias
- Agrupamento por instituições
- Limpeza rápida de filtros

### Notificações Inteligentes
- Alertas de contas vencidas
- Lembretes de investimentos
- Feedback visual de ações
- Sistema de toast messages

## 🎯 Roadmap Futuro

- [ ] Exportação de dados (CSV/PDF)
- [ ] Backup na nuvem
- [ ] Modo escuro
- [ ] PWA (Progressive Web App)
- [ ] Sincronização entre dispositivos
- [ ] Relatórios avançados
- [ ] Integração com APIs bancárias

## 👨‍💻 Desenvolvimento

Desenvolvido com foco em:
- **Usabilidade**: Interface intuitiva e amigável
- **Performance**: Otimização de recursos e carregamento
- **Acessibilidade**: Inclusão e facilidade de uso
- **Manutenibilidade**: Código limpo e bem estruturado

---

**Cherry Financial System** - Sua gestão financeira pessoal simplificada 🍒

© 2025 - Feito com ♥ em Minas Gerais