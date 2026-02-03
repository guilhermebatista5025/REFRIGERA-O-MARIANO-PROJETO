// ===== MARIANO REFRIGERAÇÃO - SISTEMA DE GESTÃO =====
// Arquivo: app.js
// Sistema completo em JavaScript puro com localStorage

// ===== STORAGE KEYS =====
const STORAGE_KEYS = {
    CLIENTES: 'mariano_clientes',
    PRODUTOS: 'mariano_produtos',
    TECNICOS: 'mariano_tecnicos',
    ORDENS_SERVICO: 'mariano_os',
    VENDAS: 'mariano_vendas'
};

// ===== UTILITY FUNCTIONS =====

// Gera ID único
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Formata valor para moeda brasileira
function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Formata data
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR');
}

// Formata data e hora
function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString('pt-BR');
}

// ===== LOCAL STORAGE FUNCTIONS =====

function getFromStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// ===== DATA MANAGEMENT =====

// Clientes
const clientesDB = {
    getAll: () => getFromStorage(STORAGE_KEYS.CLIENTES),
    save: (data) => saveToStorage(STORAGE_KEYS.CLIENTES, data),
    add: function(cliente) {
        const clientes = this.getAll();
        const newCliente = {
            ...cliente,
            id: generateId(),
            dataCadastro: new Date().toISOString()
        };
        clientes.push(newCliente);
        this.save(clientes);
        return newCliente;
    },
    update: function(id, data) {
        const clientes = this.getAll();
        const index = clientes.findIndex(c => c.id === id);
        if (index !== -1) {
            clientes[index] = { ...clientes[index], ...data };
            this.save(clientes);
            return clientes[index];
        }
        return null;
    },
    delete: function(id) {
        const clientes = this.getAll();
        const filtered = clientes.filter(c => c.id !== id);
        this.save(filtered);
        return filtered.length !== clientes.length;
    },
    getById: function(id) {
        return this.getAll().find(c => c.id === id);
    }
};

// Produtos
const produtosDB = {
    getAll: () => getFromStorage(STORAGE_KEYS.PRODUTOS),
    save: (data) => saveToStorage(STORAGE_KEYS.PRODUTOS, data),
    add: function(produto) {
        const produtos = this.getAll();
        const newProduto = {
            ...produto,
            id: generateId()
        };
        produtos.push(newProduto);
        this.save(produtos);
        return newProduto;
    },
    update: function(id, data) {
        const produtos = this.getAll();
        const index = produtos.findIndex(p => p.id === id);
        if (index !== -1) {
            produtos[index] = { ...produtos[index], ...data };
            this.save(produtos);
            return produtos[index];
        }
        return null;
    },
    delete: function(id) {
        const produtos = this.getAll();
        const filtered = produtos.filter(p => p.id !== id);
        this.save(filtered);
        return filtered.length !== produtos.length;
    },
    getById: function(id) {
        return this.getAll().find(p => p.id === id);
    },
    updateStock: function(id, quantidade) {
        const produtos = this.getAll();
        const index = produtos.findIndex(p => p.id === id);
        if (index !== -1) {
            produtos[index].quantidade = Math.max(0, produtos[index].quantidade - quantidade);
            this.save(produtos);
            return true;
        }
        return false;
    },
    getLowStock: function() {
        return this.getAll().filter(p => p.quantidade <= p.estoqueMinimo);
    }
};

// Técnicos
const tecnicosDB = {
    getAll: () => getFromStorage(STORAGE_KEYS.TECNICOS),
    save: (data) => saveToStorage(STORAGE_KEYS.TECNICOS, data),
    add: function(tecnico) {
        const tecnicos = this.getAll();
        const newTecnico = {
            ...tecnico,
            id: generateId()
        };
        tecnicos.push(newTecnico);
        this.save(tecnicos);
        return newTecnico;
    },
    getById: function(id) {
        return this.getAll().find(t => t.id === id);
    }
};

// Ordens de Serviço
const ordensDB = {
    getAll: () => getFromStorage(STORAGE_KEYS.ORDENS_SERVICO),
    save: (data) => saveToStorage(STORAGE_KEYS.ORDENS_SERVICO, data),
    add: function(ordem) {
        const ordens = this.getAll();
        const newOrdem = {
            ...ordem,
            id: generateId(),
            dataCriacao: new Date().toISOString()
        };
        ordens.push(newOrdem);
        this.save(ordens);
        return newOrdem;
    },
    update: function(id, data) {
        const ordens = this.getAll();
        const index = ordens.findIndex(o => o.id === id);
        if (index !== -1) {
            ordens[index] = { ...ordens[index], ...data };
            this.save(ordens);
            return ordens[index];
        }
        return null;
    },
    delete: function(id) {
        const ordens = this.getAll();
        const filtered = ordens.filter(o => o.id !== id);
        this.save(filtered);
        return filtered.length !== ordens.length;
    },
    finalize: function(id) {
        return this.update(id, {
            status: 'finalizada',
            dataFinalizacao: new Date().toISOString()
        });
    }
};

// Vendas
const vendasDB = {
    getAll: () => getFromStorage(STORAGE_KEYS.VENDAS),
    save: (data) => saveToStorage(STORAGE_KEYS.VENDAS, data),
    add: function(venda) {
        const vendas = this.getAll();
        const newVenda = {
            ...venda,
            id: generateId(),
            dataVenda: new Date().toISOString()
        };
        vendas.push(newVenda);
        this.save(vendas);
        
        // Atualiza estoque
        venda.itens.forEach(item => {
            produtosDB.updateStock(item.produtoId, item.quantidade);
        });
        
        return newVenda;
    },
    getByPeriod: function(startDate, endDate) {
        return this.getAll().filter(v => {
            const vendaDate = new Date(v.dataVenda);
            return vendaDate >= startDate && vendaDate <= endDate;
        });
    }
};

// ===== INITIALIZE SAMPLE DATA =====

function initializeSampleData() {
    // Técnicos
    if (tecnicosDB.getAll().length === 0) {
        tecnicosDB.add({ nome: 'Carlos Silva', telefone: '(11) 98765-4321', especialidade: 'Ar Condicionado' });
        tecnicosDB.add({ nome: 'João Santos', telefone: '(11) 91234-5678', especialidade: 'Geladeira' });
        tecnicosDB.add({ nome: 'Pedro Oliveira', telefone: '(11) 99876-5432', especialidade: 'Freezer' });
    }

    // Produtos
    if (produtosDB.getAll().length === 0) {
        produtosDB.add({ nome: 'Gás Refrigerante R410A', codigo: 'GAS001', quantidade: 50, preco: 180.00, estoqueMinimo: 10 });
        produtosDB.add({ nome: 'Compressor 1HP', codigo: 'COMP001', quantidade: 8, preco: 850.00, estoqueMinimo: 3 });
        produtosDB.add({ nome: 'Filtro de Ar', codigo: 'FILT001', quantidade: 100, preco: 45.00, estoqueMinimo: 20 });
        produtosDB.add({ nome: 'Termostato Digital', codigo: 'TERM001', quantidade: 15, preco: 120.00, estoqueMinimo: 5 });
        produtosDB.add({ nome: 'Motor Ventilador', codigo: 'MOT001', quantidade: 12, preco: 280.00, estoqueMinimo: 4 });
    }
}

// ===== NAVIGATION =====

function navigateTo(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(`page-${pageName}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === pageName) {
            item.classList.add('active');
        }
    });
    
    // Load page specific data
    switch(pageName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'clientes':
            loadClientes();
            break;
        case 'ordens':
            loadOrdens();
            break;
        case 'produtos':
            loadProdutos();
            break;
        case 'vendas':
            loadVendas();
            break;
        case 'relatorios':
            initRelatorios();
            break;
    }
}

// ===== SIDEBAR =====

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
}

// ===== MODAL FUNCTIONS =====

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// ===== TOAST NOTIFICATIONS =====

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}"></i>
        <span>${message}</span>
    `;
    container.appendChild(toast);
    lucide.createIcons();
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ===== DASHBOARD =====

let osStatusChart = null;

function loadDashboard() {
    const clientes = clientesDB.getAll();
    const produtos = produtosDB.getAll();
    const tecnicos = tecnicosDB.getAll();
    const ordens = ordensDB.getAll();
    const vendas = vendasDB.getAll();
    const lowStock = produtosDB.getLowStock();

    const osAbertas = ordens.filter(o => o.status === 'aberta').length;
    const osEmAndamento = ordens.filter(o => o.status === 'em_andamento').length;
    const osFinalizadas = ordens.filter(o => o.status === 'finalizada').length;
    const osCanceladas = ordens.filter(o => o.status === 'cancelada').length;

    // Vendas do mês
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const vendasMes = vendas
        .filter(v => new Date(v.dataVenda) >= firstDayOfMonth)
        .reduce((acc, v) => acc + v.valorTotal, 0);

    // Update stats
    document.getElementById('stat-os-abertas').textContent = osAbertas;
    document.getElementById('stat-os-finalizadas').textContent = osFinalizadas;
    document.getElementById('stat-clientes').textContent = clientes.length;
    document.getElementById('stat-vendas').textContent = formatCurrency(vendasMes);
    document.getElementById('stat-produtos').textContent = produtos.length;
    document.getElementById('stat-tecnicos').textContent = tecnicos.length;
    document.getElementById('stat-manutencao').textContent = osAbertas + osEmAndamento;
    document.getElementById('stat-estoque-baixo').textContent = lowStock.length;

    // Update estoque icon color
    const estoqueIcon = document.getElementById('stat-estoque-icon');
    estoqueIcon.className = lowStock.length > 0 ? 'stat-icon danger' : 'stat-icon success';

    // Update OS Chart
    updateOSChart([osAbertas, osEmAndamento, osFinalizadas, osCanceladas]);

    // Recent OS table
    renderRecentOSTable(ordens.slice(-5).reverse());

    // Low stock alert
    const lowStockAlert = document.getElementById('low-stock-alert');
    if (lowStock.length > 0) {
        lowStockAlert.classList.remove('hidden');
        renderLowStockTable(lowStock);
    } else {
        lowStockAlert.classList.add('hidden');
    }
}

function updateOSChart(data) {
    const ctx = document.getElementById('osStatusChart').getContext('2d');
    
    if (osStatusChart) {
        osStatusChart.destroy();
    }
    
    osStatusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Abertas', 'Em Andamento', 'Finalizadas', 'Canceladas'],
            datasets: [{
                data: data,
                backgroundColor: ['#f59e0b', '#3b82f6', '#22c55e', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function renderRecentOSTable(ordens) {
    const container = document.getElementById('recent-os-table');
    
    if (ordens.length === 0) {
        container.innerHTML = '<p class="empty-message">Nenhuma OS cadastrada</p>';
        return;
    }
    
    const statusLabels = {
        aberta: { text: 'Aberta', class: 'badge-open' },
        em_andamento: { text: 'Em Andamento', class: 'badge-progress' },
        finalizada: { text: 'Finalizada', class: 'badge-completed' },
        cancelada: { text: 'Cancelada', class: 'badge-cancelled' }
    };
    
    const priorityLabels = {
        baixa: { text: 'Baixa', class: 'badge-low' },
        media: { text: 'Média', class: 'badge-medium' },
        alta: { text: 'Alta', class: 'badge-high' }
    };
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Equipamento</th>
                    <th>Status</th>
                    <th>Prioridade</th>
                    <th>Data</th>
                </tr>
            </thead>
            <tbody>
                ${ordens.map(os => `
                    <tr>
                        <td>#${os.id.slice(-6).toUpperCase()}</td>
                        <td>${os.equipamento}</td>
                        <td><span class="badge ${statusLabels[os.status].class}">${statusLabels[os.status].text}</span></td>
                        <td><span class="badge ${priorityLabels[os.prioridade].class}">${priorityLabels[os.prioridade].text}</span></td>
                        <td>${formatDate(os.dataCriacao)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderLowStockTable(produtos) {
    const container = document.getElementById('low-stock-table');
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Produto</th>
                    <th>Qtd</th>
                    <th>Mínimo</th>
                </tr>
            </thead>
            <tbody>
                ${produtos.map(p => `
                    <tr>
                        <td>${p.codigo}</td>
                        <td>${p.nome}</td>
                        <td style="color: var(--danger); font-weight: 600;">${p.quantidade}</td>
                        <td>${p.estoqueMinimo}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// ===== CLIENTES =====

function loadClientes(searchTerm = '') {
    let clientes = clientesDB.getAll();
    
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        clientes = clientes.filter(c => 
            c.nome.toLowerCase().includes(term) ||
            c.telefone.includes(term) ||
            c.email.toLowerCase().includes(term)
        );
    }
    
    renderClientesTable(clientes);
}

function renderClientesTable(clientes) {
    const container = document.getElementById('clientes-table');
    
    if (clientes.length === 0) {
        container.innerHTML = '<p class="empty-message">Nenhum cliente encontrado</p>';
        return;
    }
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Telefone</th>
                    <th>Email</th>
                    <th>Endereço</th>
                    <th>Cadastro</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${clientes.map(c => `
                    <tr>
                        <td>${c.nome}</td>
                        <td>${c.telefone}</td>
                        <td>${c.email || '-'}</td>
                        <td>${c.endereco || '-'}</td>
                        <td>${formatDate(c.dataCadastro)}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-ghost btn-sm" onclick="editCliente('${c.id}')" title="Editar">
                                    <i data-lucide="pencil"></i>
                                </button>
                                <button class="btn btn-ghost btn-sm danger" onclick="confirmDeleteCliente('${c.id}', '${c.nome}')" title="Excluir">
                                    <i data-lucide="trash-2"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    lucide.createIcons();
}

function openClienteModal(cliente = null) {
    const modal = document.getElementById('modal-cliente');
    const title = document.getElementById('modal-cliente-title');
    const btn = document.getElementById('btn-salvar-cliente');
    const form = document.getElementById('form-cliente');
    
    form.reset();
    document.getElementById('cliente-id').value = '';
    
    if (cliente) {
        title.textContent = 'Editar Cliente';
        btn.textContent = 'Salvar';
        document.getElementById('cliente-id').value = cliente.id;
        document.getElementById('cliente-nome').value = cliente.nome;
        document.getElementById('cliente-telefone').value = cliente.telefone;
        document.getElementById('cliente-email').value = cliente.email || '';
        document.getElementById('cliente-endereco').value = cliente.endereco || '';
    } else {
        title.textContent = 'Novo Cliente';
        btn.textContent = 'Cadastrar';
    }
    
    openModal('modal-cliente');
}

function editCliente(id) {
    const cliente = clientesDB.getById(id);
    if (cliente) {
        openClienteModal(cliente);
    }
}

function salvarCliente(event) {
    event.preventDefault();
    
    const id = document.getElementById('cliente-id').value;
    const data = {
        nome: document.getElementById('cliente-nome').value,
        telefone: document.getElementById('cliente-telefone').value,
        email: document.getElementById('cliente-email').value,
        endereco: document.getElementById('cliente-endereco').value
    };
    
    if (id) {
        clientesDB.update(id, data);
        showToast('Cliente atualizado com sucesso!');
    } else {
        clientesDB.add(data);
        showToast('Cliente cadastrado com sucesso!');
    }
    
    closeModal('modal-cliente');
    loadClientes();
}

function confirmDeleteCliente(id, nome) {
    document.getElementById('confirm-message').textContent = 
        `Tem certeza que deseja excluir o cliente "${nome}"? Esta ação não pode ser desfeita.`;
    
    document.getElementById('btn-confirm-delete').onclick = () => {
        clientesDB.delete(id);
        showToast('Cliente excluído com sucesso!');
        closeModal('modal-confirm');
        loadClientes();
    };
    
    openModal('modal-confirm');
}

// ===== ORDENS DE SERVIÇO =====

function loadOrdens(filters = {}) {
    let ordens = ordensDB.getAll().reverse();
    
    if (filters.search) {
        const term = filters.search.toLowerCase();
        ordens = ordens.filter(o => 
            o.equipamento.toLowerCase().includes(term) ||
            o.descricao?.toLowerCase().includes(term)
        );
    }
    
    if (filters.status && filters.status !== 'all') {
        ordens = ordens.filter(o => o.status === filters.status);
    }
    
    if (filters.prioridade && filters.prioridade !== 'all') {
        ordens = ordens.filter(o => o.prioridade === filters.prioridade);
    }
    
    renderOrdensTable(ordens);
}

function renderOrdensTable(ordens) {
    const container = document.getElementById('ordens-table');
    
    if (ordens.length === 0) {
        container.innerHTML = '<p class="empty-message">Nenhuma ordem de serviço encontrada</p>';
        return;
    }
    
    const statusLabels = {
        aberta: { text: 'Aberta', class: 'badge-open' },
        em_andamento: { text: 'Em Andamento', class: 'badge-progress' },
        finalizada: { text: 'Finalizada', class: 'badge-completed' },
        cancelada: { text: 'Cancelada', class: 'badge-cancelled' }
    };
    
    const priorityLabels = {
        baixa: { text: 'Baixa', class: 'badge-low' },
        media: { text: 'Média', class: 'badge-medium' },
        alta: { text: 'Alta', class: 'badge-high' }
    };
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Equipamento</th>
                    <th>Técnico</th>
                    <th>Status</th>
                    <th>Prioridade</th>
                    <th>Data</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${ordens.map(os => {
                    const cliente = clientesDB.getById(os.clienteId);
                    const tecnico = tecnicosDB.getById(os.tecnicoId);
                    return `
                        <tr>
                            <td>#${os.id.slice(-6).toUpperCase()}</td>
                            <td>${cliente?.nome || 'N/A'}</td>
                            <td>${os.equipamento}</td>
                            <td>${tecnico?.nome || 'N/A'}</td>
                            <td><span class="badge ${statusLabels[os.status].class}">${statusLabels[os.status].text}</span></td>
                            <td><span class="badge ${priorityLabels[os.prioridade].class}">${priorityLabels[os.prioridade].text}</span></td>
                            <td>${formatDate(os.dataCriacao)}</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-ghost btn-sm" onclick="viewOrdem('${os.id}')" title="Detalhes">
                                        <i data-lucide="file-text"></i>
                                    </button>
                                    ${os.status !== 'finalizada' && os.status !== 'cancelada' ? `
                                        <button class="btn btn-ghost btn-sm success" onclick="finalizarOrdem('${os.id}')" title="Finalizar">
                                            <i data-lucide="check-circle"></i>
                                        </button>
                                    ` : ''}
                                    <button class="btn btn-ghost btn-sm" onclick="editOrdem('${os.id}')" title="Editar">
                                        <i data-lucide="pencil"></i>
                                    </button>
                                    <button class="btn btn-ghost btn-sm danger" onclick="confirmDeleteOrdem('${os.id}')" title="Excluir">
                                        <i data-lucide="trash-2"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
    lucide.createIcons();
}

function openOrdemModal(ordem = null) {
    const modal = document.getElementById('modal-ordem');
    const title = document.getElementById('modal-ordem-title');
    const btn = document.getElementById('btn-salvar-ordem');
    const form = document.getElementById('form-ordem');
    
    // Populate selects
    populateClienteSelect('ordem-cliente');
    populateTecnicoSelect('ordem-tecnico');
    
    form.reset();
    document.getElementById('ordem-id').value = '';
    document.getElementById('ordem-prioridade').value = 'media';
    
    if (ordem) {
        title.textContent = 'Editar Ordem de Serviço';
        btn.textContent = 'Salvar';
        document.getElementById('ordem-id').value = ordem.id;
        document.getElementById('ordem-cliente').value = ordem.clienteId;
        document.getElementById('ordem-tecnico').value = ordem.tecnicoId;
        document.getElementById('ordem-equipamento').value = ordem.equipamento;
        document.getElementById('ordem-descricao').value = ordem.descricao || '';
        document.getElementById('ordem-status').value = ordem.status;
        document.getElementById('ordem-prioridade').value = ordem.prioridade;
        document.getElementById('ordem-valor').value = ordem.valorServico || 0;
    } else {
        title.textContent = 'Nova Ordem de Serviço';
        btn.textContent = 'Criar OS';
    }
    
    openModal('modal-ordem');
}

function populateClienteSelect(selectId) {
    const select = document.getElementById(selectId);
    const clientes = clientesDB.getAll();
    select.innerHTML = '<option value="">Selecione</option>' +
        clientes.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
}

function populateTecnicoSelect(selectId) {
    const select = document.getElementById(selectId);
    const tecnicos = tecnicosDB.getAll();
    select.innerHTML = '<option value="">Selecione</option>' +
        tecnicos.map(t => `<option value="${t.id}">${t.nome}</option>`).join('');
}

function editOrdem(id) {
    const ordens = ordensDB.getAll();
    const ordem = ordens.find(o => o.id === id);
    if (ordem) {
        openOrdemModal(ordem);
    }
}

function salvarOrdem(event) {
    event.preventDefault();
    
    const id = document.getElementById('ordem-id').value;
    const data = {
        clienteId: document.getElementById('ordem-cliente').value,
        tecnicoId: document.getElementById('ordem-tecnico').value,
        equipamento: document.getElementById('ordem-equipamento').value,
        descricao: document.getElementById('ordem-descricao').value,
        status: document.getElementById('ordem-status').value,
        prioridade: document.getElementById('ordem-prioridade').value,
        valorServico: parseFloat(document.getElementById('ordem-valor').value) || 0
    };
    
    if (id) {
        ordensDB.update(id, data);
        showToast('Ordem de serviço atualizada!');
    } else {
        ordensDB.add(data);
        showToast('Ordem de serviço criada!');
    }
    
    closeModal('modal-ordem');
    loadOrdens();
}

function viewOrdem(id) {
    const ordens = ordensDB.getAll();
    const ordem = ordens.find(o => o.id === id);
    if (!ordem) return;
    
    const cliente = clientesDB.getById(ordem.clienteId);
    const tecnico = tecnicosDB.getById(ordem.tecnicoId);
    
    const statusLabels = {
        aberta: 'Aberta',
        em_andamento: 'Em Andamento',
        finalizada: 'Finalizada',
        cancelada: 'Cancelada'
    };
    
    const priorityLabels = {
        baixa: 'Baixa',
        media: 'Média',
        alta: 'Alta'
    };
    
    document.getElementById('modal-os-detalhes-title').textContent = 
        `Detalhes da OS #${ordem.id.slice(-6).toUpperCase()}`;
    
    document.getElementById('os-detalhes-content').innerHTML = `
        <div class="os-detail-item">
            <p>Cliente</p>
            <p>${cliente?.nome || 'N/A'}</p>
        </div>
        <div class="os-detail-item">
            <p>Técnico</p>
            <p>${tecnico?.nome || 'N/A'}</p>
        </div>
        <div class="os-detail-item">
            <p>Equipamento</p>
            <p>${ordem.equipamento}</p>
        </div>
        <div class="os-detail-item">
            <p>Valor</p>
            <p>${formatCurrency(ordem.valorServico || 0)}</p>
        </div>
        <div class="os-detail-item">
            <p>Status</p>
            <p>${statusLabels[ordem.status]}</p>
        </div>
        <div class="os-detail-item">
            <p>Prioridade</p>
            <p>${priorityLabels[ordem.prioridade]}</p>
        </div>
        <div class="os-detail-item">
            <p>Criada em</p>
            <p>${formatDateTime(ordem.dataCriacao)}</p>
        </div>
        ${ordem.dataFinalizacao ? `
            <div class="os-detail-item">
                <p>Finalizada em</p>
                <p>${formatDateTime(ordem.dataFinalizacao)}</p>
            </div>
        ` : ''}
        ${ordem.descricao ? `
            <div class="os-detail-item os-detail-full">
                <p>Descrição</p>
                <div class="description-box">${ordem.descricao}</div>
            </div>
        ` : ''}
    `;
    
    openModal('modal-os-detalhes');
}

function finalizarOrdem(id) {
    ordensDB.finalize(id);
    showToast('Ordem de serviço finalizada!');
    loadOrdens();
}

function confirmDeleteOrdem(id) {
    document.getElementById('confirm-message').textContent = 
        'Tem certeza que deseja excluir esta ordem de serviço? Esta ação não pode ser desfeita.';
    
    document.getElementById('btn-confirm-delete').onclick = () => {
        ordensDB.delete(id);
        showToast('Ordem de serviço excluída!');
        closeModal('modal-confirm');
        loadOrdens();
    };
    
    openModal('modal-confirm');
}

// ===== PRODUTOS =====

function loadProdutos(searchTerm = '') {
    let produtos = produtosDB.getAll();
    
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        produtos = produtos.filter(p => 
            p.nome.toLowerCase().includes(term) ||
            p.codigo.toLowerCase().includes(term)
        );
    }
    
    const lowStock = produtosDB.getLowStock();
    const alertEl = document.getElementById('produtos-low-stock-alert');
    if (lowStock.length > 0) {
        alertEl.classList.remove('hidden');
        document.getElementById('low-stock-count').textContent = lowStock.length;
    } else {
        alertEl.classList.add('hidden');
    }
    
    renderProdutosTable(produtos);
}

function renderProdutosTable(produtos) {
    const container = document.getElementById('produtos-table');
    
    if (produtos.length === 0) {
        container.innerHTML = '<p class="empty-message">Nenhum produto encontrado</p>';
        return;
    }
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Nome</th>
                    <th>Estoque</th>
                    <th>Mínimo</th>
                    <th>Preço</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${produtos.map(p => `
                    <tr>
                        <td>${p.codigo}</td>
                        <td>${p.nome}</td>
                        <td>
                            <span style="${p.quantidade <= p.estoqueMinimo ? 'color: var(--danger); font-weight: 600;' : ''}">
                                ${p.quantidade}
                            </span>
                            ${p.quantidade <= p.estoqueMinimo ? '<i data-lucide="alert-triangle" style="width:16px;height:16px;color:var(--danger);margin-left:4px;"></i>' : ''}
                        </td>
                        <td>${p.estoqueMinimo}</td>
                        <td>${formatCurrency(p.preco)}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-ghost btn-sm" onclick="editProduto('${p.id}')" title="Editar">
                                    <i data-lucide="pencil"></i>
                                </button>
                                <button class="btn btn-ghost btn-sm danger" onclick="confirmDeleteProduto('${p.id}', '${p.nome}')" title="Excluir">
                                    <i data-lucide="trash-2"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    lucide.createIcons();
}

function openProdutoModal(produto = null) {
    const modal = document.getElementById('modal-produto');
    const title = document.getElementById('modal-produto-title');
    const btn = document.getElementById('btn-salvar-produto');
    const form = document.getElementById('form-produto');
    
    form.reset();
    document.getElementById('produto-id').value = '';
    document.getElementById('produto-quantidade').value = 0;
    document.getElementById('produto-minimo').value = 5;
    document.getElementById('produto-preco').value = 0;
    
    if (produto) {
        title.textContent = 'Editar Produto';
        btn.textContent = 'Salvar';
        document.getElementById('produto-id').value = produto.id;
        document.getElementById('produto-nome').value = produto.nome;
        document.getElementById('produto-codigo').value = produto.codigo;
        document.getElementById('produto-quantidade').value = produto.quantidade;
        document.getElementById('produto-minimo').value = produto.estoqueMinimo;
        document.getElementById('produto-preco').value = produto.preco;
    } else {
        title.textContent = 'Novo Produto';
        btn.textContent = 'Cadastrar';
    }
    
    openModal('modal-produto');
}

function editProduto(id) {
    const produto = produtosDB.getById(id);
    if (produto) {
        openProdutoModal(produto);
    }
}

function salvarProduto(event) {
    event.preventDefault();
    
    const id = document.getElementById('produto-id').value;
    const data = {
        nome: document.getElementById('produto-nome').value,
        codigo: document.getElementById('produto-codigo').value,
        quantidade: parseInt(document.getElementById('produto-quantidade').value) || 0,
        estoqueMinimo: parseInt(document.getElementById('produto-minimo').value) || 5,
        preco: parseFloat(document.getElementById('produto-preco').value) || 0
    };
    
    if (id) {
        produtosDB.update(id, data);
        showToast('Produto atualizado com sucesso!');
    } else {
        produtosDB.add(data);
        showToast('Produto cadastrado com sucesso!');
    }
    
    closeModal('modal-produto');
    loadProdutos();
}

function confirmDeleteProduto(id, nome) {
    document.getElementById('confirm-message').textContent = 
        `Tem certeza que deseja excluir o produto "${nome}"? Esta ação não pode ser desfeita.`;
    
    document.getElementById('btn-confirm-delete').onclick = () => {
        produtosDB.delete(id);
        showToast('Produto excluído com sucesso!');
        closeModal('modal-confirm');
        loadProdutos();
    };
    
    openModal('modal-confirm');
}

// ===== VENDAS =====

let carrinho = [];
let formaPagamento = 'dinheiro';

function loadVendas() {
    loadVendasProdutos();
    loadVendaClientes();
    renderCarrinho();
    setupPaymentButtons();
}

function loadVendasProdutos(searchTerm = '') {
    let produtos = produtosDB.getAll();
    
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        produtos = produtos.filter(p => 
            p.nome.toLowerCase().includes(term) ||
            p.codigo.toLowerCase().includes(term)
        );
    }
    
    renderVendasProdutos(produtos);
}

function renderVendasProdutos(produtos) {
    const container = document.getElementById('vendas-produtos-grid');
    
    if (produtos.length === 0) {
        container.innerHTML = '<p class="empty-message">Nenhum produto disponível</p>';
        return;
    }
    
    container.innerHTML = produtos.map(p => `
        <button class="produto-card ${p.quantidade <= 0 ? 'disabled' : ''}" 
                onclick="addToCart('${p.id}')" 
                ${p.quantidade <= 0 ? 'disabled' : ''}>
            <div class="nome">${p.nome}</div>
            <div class="codigo">${p.codigo}</div>
            <div class="info">
                <span class="preco">${formatCurrency(p.preco)}</span>
                <span class="estoque ${p.quantidade <= p.estoqueMinimo ? 'low' : ''}">Est: ${p.quantidade}</span>
            </div>
        </button>
    `).join('');
}

function loadVendaClientes() {
    const select = document.getElementById('venda-cliente');
    const clientes = clientesDB.getAll();
    select.innerHTML = '<option value="">Selecione um cliente</option>' +
        clientes.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
}

function setupPaymentButtons() {
    const buttons = document.querySelectorAll('.payment-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            formaPagamento = btn.dataset.method;
        });
    });
}

function addToCart(produtoId) {
    const produto = produtosDB.getById(produtoId);
    if (!produto || produto.quantidade <= 0) {
        showToast('Produto sem estoque', 'error');
        return;
    }
    
    const existingItem = carrinho.find(item => item.produtoId === produtoId);
    if (existingItem) {
        if (existingItem.quantidade >= produto.quantidade) {
            showToast('Quantidade máxima atingida', 'error');
            return;
        }
        existingItem.quantidade++;
    } else {
        carrinho.push({
            produtoId: produto.id,
            quantidade: 1,
            precoUnitario: produto.preco,
            produto: produto
        });
    }
    
    renderCarrinho();
}

function updateCartQty(produtoId, delta) {
    const produto = produtosDB.getById(produtoId);
    if (!produto) return;
    
    const item = carrinho.find(i => i.produtoId === produtoId);
    if (!item) return;
    
    const newQty = item.quantidade + delta;
    
    if (newQty <= 0) {
        carrinho = carrinho.filter(i => i.produtoId !== produtoId);
    } else if (newQty > produto.quantidade) {
        showToast('Quantidade máxima atingida', 'error');
        return;
    } else {
        item.quantidade = newQty;
    }
    
    renderCarrinho();
}

function removeFromCart(produtoId) {
    carrinho = carrinho.filter(i => i.produtoId !== produtoId);
    renderCarrinho();
}

function renderCarrinho() {
    const container = document.getElementById('carrinho-items');
    const countEl = document.getElementById('carrinho-count');
    const totalEl = document.getElementById('carrinho-total');
    
    countEl.textContent = carrinho.length;
    
    if (carrinho.length === 0) {
        container.innerHTML = '<p class="empty-message">Carrinho vazio</p>';
        totalEl.textContent = 'R$ 0,00';
        return;
    }
    
    const total = carrinho.reduce((acc, item) => acc + (item.quantidade * item.precoUnitario), 0);
    totalEl.textContent = formatCurrency(total);
    
    container.innerHTML = carrinho.map(item => `
        <div class="carrinho-item">
            <div class="carrinho-item-info">
                <div class="carrinho-item-nome">${item.produto.nome}</div>
                <div class="carrinho-item-preco">${formatCurrency(item.precoUnitario)}</div>
            </div>
            <div class="carrinho-item-qty">
                <button onclick="updateCartQty('${item.produtoId}', -1)">
                    <i data-lucide="minus" style="width:12px;height:12px;"></i>
                </button>
                <span>${item.quantidade}</span>
                <button onclick="updateCartQty('${item.produtoId}', 1)">
                    <i data-lucide="plus" style="width:12px;height:12px;"></i>
                </button>
            </div>
            <button class="carrinho-item-remove" onclick="removeFromCart('${item.produtoId}')">
                <i data-lucide="trash-2" style="width:16px;height:16px;"></i>
            </button>
        </div>
    `).join('');
    
    lucide.createIcons();
}

function finalizarVenda() {
    if (carrinho.length === 0) {
        showToast('Adicione produtos ao carrinho', 'error');
        return;
    }
    
    const clienteId = document.getElementById('venda-cliente').value;
    const cliente = clienteId ? clientesDB.getById(clienteId) : null;
    const total = carrinho.reduce((acc, item) => acc + (item.quantidade * item.precoUnitario), 0);
    
    const venda = vendasDB.add({
        clienteId: clienteId || null,
        itens: carrinho.map(item => ({
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            precoUnitario: item.precoUnitario
        })),
        valorTotal: total,
        formaPagamento: formaPagamento
    });
    
    // Show receipt
    showRecibo({
        items: carrinho,
        total: total,
        formaPagamento: formaPagamento,
        cliente: cliente?.nome,
        data: formatDateTime(new Date().toISOString())
    });
    
    // Reset
    carrinho = [];
    document.getElementById('venda-cliente').value = '';
    formaPagamento = 'dinheiro';
    document.querySelectorAll('.payment-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.method === 'dinheiro') btn.classList.add('active');
    });
    
    showToast('Venda realizada com sucesso!');
    loadVendas();
}

function showRecibo(venda) {
    const paymentLabels = {
        dinheiro: 'Dinheiro',
        cartao_debito: 'Cartão Débito',
        cartao_credito: 'Cartão Crédito',
        pix: 'PIX'
    };
    
    document.getElementById('recibo-content').innerHTML = `
        <div class="recibo-header">
            <h2>MARIANO REFRIGERAÇÃO</h2>
            <p>Sistema de Gestão</p>
        </div>
        <div class="recibo-info">
            <p>Data: ${venda.data}</p>
            ${venda.cliente ? `<p>Cliente: ${venda.cliente}</p>` : ''}
            <p>Pagamento: ${paymentLabels[venda.formaPagamento]}</p>
        </div>
        <div class="recibo-items">
            ${venda.items.map(item => `
                <div class="recibo-item">
                    <span>${item.quantidade}x ${item.produto.nome}</span>
                    <span>${formatCurrency(item.quantidade * item.precoUnitario)}</span>
                </div>
            `).join('')}
        </div>
        <div class="recibo-total">
            <span>TOTAL:</span>
            <span>${formatCurrency(venda.total)}</span>
        </div>
        <div class="recibo-footer">
            <p>Obrigado pela preferência!</p>
        </div>
    `;
    
    openModal('modal-recibo');
}

// ===== RELATÓRIOS =====

let vendasDiaChart = null;
let produtosVendidosChart = null;

function initRelatorios() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    
    document.getElementById('relatorio-data-inicio').value = firstDay.toISOString().split('T')[0];
    document.getElementById('relatorio-data-fim').value = now.toISOString().split('T')[0];
    
    carregarRelatorios();
}

function carregarRelatorios() {
    const startDate = new Date(document.getElementById('relatorio-data-inicio').value);
    const endDate = new Date(document.getElementById('relatorio-data-fim').value);
    endDate.setHours(23, 59, 59, 999);
    
    // Vendas no período
    const vendas = vendasDB.getByPeriod(startDate, endDate);
    const totalVendas = vendas.reduce((acc, v) => acc + v.valorTotal, 0);
    
    // OS finalizadas no período
    const ordens = ordensDB.getAll();
    const ordensFinalizadas = ordens.filter(os => {
        if (os.status !== 'finalizada' || !os.dataFinalizacao) return false;
        const data = new Date(os.dataFinalizacao);
        return data >= startDate && data <= endDate;
    });
    const totalOS = ordensFinalizadas.reduce((acc, os) => acc + (os.valorServico || 0), 0);
    
    // Update stats
    document.getElementById('rel-total-vendas').textContent = formatCurrency(totalVendas);
    document.getElementById('rel-qtd-vendas').textContent = `${vendas.length} vendas no período`;
    document.getElementById('rel-total-os').textContent = formatCurrency(totalOS);
    document.getElementById('rel-qtd-os').textContent = `${ordensFinalizadas.length} OS no período`;
    document.getElementById('rel-receita-total').textContent = formatCurrency(totalVendas + totalOS);
    
    // Vendas por dia
    const vendasPorDia = {};
    vendas.forEach(v => {
        const dia = formatDate(v.dataVenda);
        vendasPorDia[dia] = (vendasPorDia[dia] || 0) + v.valorTotal;
    });
    
    updateVendasDiaChart(vendasPorDia);
    
    // Produtos mais vendidos
    const produtosCounts = {};
    vendas.forEach(v => {
        v.itens.forEach(item => {
            produtosCounts[item.produtoId] = (produtosCounts[item.produtoId] || 0) + item.quantidade;
        });
    });
    
    const produtos = produtosDB.getAll();
    const maisVendidos = Object.entries(produtosCounts)
        .map(([produtoId, quantidade]) => ({
            produto: produtos.find(p => p.id === produtoId),
            quantidade
        }))
        .filter(item => item.produto)
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 5);
    
    updateProdutosVendidosChart(maisVendidos);
    
    // Tables
    renderRelatorioVendasTable(vendas);
    renderRelatorioOSTable(ordensFinalizadas);
}

function updateVendasDiaChart(data) {
    const ctx = document.getElementById('vendasDiaChart').getContext('2d');
    
    if (vendasDiaChart) {
        vendasDiaChart.destroy();
    }
    
    const labels = Object.keys(data);
    const values = Object.values(data);
    
    vendasDiaChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Vendas',
                data: values,
                borderColor: '#0891b2',
                backgroundColor: 'rgba(8, 145, 178, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => formatCurrency(value)
                    }
                }
            }
        }
    });
}

function updateProdutosVendidosChart(data) {
    const ctx = document.getElementById('produtosVendidosChart').getContext('2d');
    
    if (produtosVendidosChart) {
        produtosVendidosChart.destroy();
    }
    
    const labels = data.map(d => d.produto.nome.substring(0, 15) + (d.produto.nome.length > 15 ? '...' : ''));
    const values = data.map(d => d.quantidade);
    
    produtosVendidosChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Quantidade',
                data: values,
                backgroundColor: '#22c55e'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function renderRelatorioVendasTable(vendas) {
    const container = document.getElementById('relatorio-vendas-table');
    
    if (vendas.length === 0) {
        container.innerHTML = '<p class="empty-message">Nenhuma venda no período</p>';
        return;
    }
    
    const paymentLabels = {
        dinheiro: 'Dinheiro',
        cartao_debito: 'Débito',
        cartao_credito: 'Crédito',
        pix: 'PIX'
    };
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Data</th>
                    <th>Cliente</th>
                    <th>Itens</th>
                    <th>Pagamento</th>
                    <th>Valor</th>
                </tr>
            </thead>
            <tbody>
                ${vendas.map(v => {
                    const cliente = v.clienteId ? clientesDB.getById(v.clienteId) : null;
                    return `
                        <tr>
                            <td>#${v.id.slice(-6).toUpperCase()}</td>
                            <td>${formatDateTime(v.dataVenda)}</td>
                            <td>${cliente?.nome || 'Não informado'}</td>
                            <td>${v.itens.length}</td>
                            <td>${paymentLabels[v.formaPagamento]}</td>
                            <td>${formatCurrency(v.valorTotal)}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function renderRelatorioOSTable(ordens) {
    const container = document.getElementById('relatorio-os-table');
    
    if (ordens.length === 0) {
        container.innerHTML = '<p class="empty-message">Nenhuma OS finalizada no período</p>';
        return;
    }
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Equipamento</th>
                    <th>Status</th>
                    <th>Finalizada em</th>
                    <th>Valor</th>
                </tr>
            </thead>
            <tbody>
                ${ordens.map(os => `
                    <tr>
                        <td>#${os.id.slice(-6).toUpperCase()}</td>
                        <td>${os.equipamento}</td>
                        <td><span class="badge badge-completed">Finalizada</span></td>
                        <td>${formatDate(os.dataFinalizacao)}</td>
                        <td>${formatCurrency(os.valorServico || 0)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function exportarCSV(type) {
    const startDate = new Date(document.getElementById('relatorio-data-inicio').value);
    const endDate = new Date(document.getElementById('relatorio-data-fim').value);
    endDate.setHours(23, 59, 59, 999);
    
    let data, filename, headers;
    
    if (type === 'vendas') {
        const vendas = vendasDB.getByPeriod(startDate, endDate);
        headers = ['ID', 'Data', 'Cliente', 'Itens', 'Pagamento', 'Valor'];
        data = vendas.map(v => {
            const cliente = v.clienteId ? clientesDB.getById(v.clienteId) : null;
            return [
                v.id,
                formatDateTime(v.dataVenda),
                cliente?.nome || 'Não informado',
                v.itens.length,
                v.formaPagamento,
                v.valorTotal
            ];
        });
        filename = 'relatorio_vendas';
    } else {
        const ordens = ordensDB.getAll().filter(os => {
            if (os.status !== 'finalizada' || !os.dataFinalizacao) return false;
            const data = new Date(os.dataFinalizacao);
            return data >= startDate && data <= endDate;
        });
        headers = ['ID', 'Equipamento', 'Status', 'Finalizada em', 'Valor'];
        data = ordens.map(os => [
            os.id,
            os.equipamento,
            os.status,
            formatDate(os.dataFinalizacao),
            os.valorServico || 0
        ]);
        filename = 'relatorio_os';
    }
    
    const csv = [
        headers.join(','),
        ...data.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Relatório exportado com sucesso!');
}

// ===== EVENT LISTENERS =====

document.addEventListener('DOMContentLoaded', function() {
    // Initialize icons
    lucide.createIcons();
    
    // Initialize sample data
    initializeSampleData();
    
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(item.dataset.page);
        });
    });
    
    // Sidebar toggle
    document.getElementById('collapseBtn').addEventListener('click', toggleSidebar);
    
    // Search inputs
    document.getElementById('search-clientes')?.addEventListener('input', (e) => {
        loadClientes(e.target.value);
    });
    
    document.getElementById('search-ordens')?.addEventListener('input', (e) => {
        loadOrdens({
            search: e.target.value,
            status: document.getElementById('filter-status').value,
            prioridade: document.getElementById('filter-prioridade').value
        });
    });
    
    document.getElementById('filter-status')?.addEventListener('change', () => {
        loadOrdens({
            search: document.getElementById('search-ordens').value,
            status: document.getElementById('filter-status').value,
            prioridade: document.getElementById('filter-prioridade').value
        });
    });
    
    document.getElementById('filter-prioridade')?.addEventListener('change', () => {
        loadOrdens({
            search: document.getElementById('search-ordens').value,
            status: document.getElementById('filter-status').value,
            prioridade: document.getElementById('filter-prioridade').value
        });
    });
    
    document.getElementById('search-produtos')?.addEventListener('input', (e) => {
        loadProdutos(e.target.value);
    });
    
    document.getElementById('search-vendas-produtos')?.addEventListener('input', (e) => {
        loadVendasProdutos(e.target.value);
    });
    
    // Tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            
            // Update tabs
            tab.closest('.tabs').querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
                if (content.id === `tab-${tabId}`) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // Close modal on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Load initial page
    loadDashboard();
});
