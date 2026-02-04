const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ===== BANCO DE DADOS (JSON) =====
const DB_FILE = path.join(__dirname, "db.json");

function readDB() {
  try {
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    return {
      clientes: [],
      produtos: [],
      ordens: [],
      vendas: []
    };
  }
}

function writeDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// ===== CLIENTES =====
app.get("/api/clientes", (req, res) => {
  const db = readDB();
  res.json(db.clientes);
});

app.post("/api/clientes", (req, res) => {
  const db = readDB();

  const cliente = {
    id: Date.now().toString(),
    nome: req.body.nome,
    telefone: req.body.telefone,
    email: req.body.email || "",
    endereco: req.body.endereco || "",
    criadoEm: new Date()
  };

  db.clientes.push(cliente);
  writeDB(db);

  res.json(cliente);
});

app.put("/api/clientes/:id", (req, res) => {
  const db = readDB();
  const index = db.clientes.findIndex(c => c.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Cliente não encontrado" });
  }

  db.clientes[index] = { ...db.clientes[index], ...req.body };
  writeDB(db);

  res.json(db.clientes[index]);
});

app.delete("/api/clientes/:id", (req, res) => {
  const db = readDB();
  db.clientes = db.clientes.filter(c => c.id !== req.params.id);
  writeDB(db);
  res.json({ ok: true });
});

// ===== PRODUTOS =====
app.get("/api/produtos", (req, res) => {
  const db = readDB();
  res.json(db.produtos);
});

app.post("/api/produtos", (req, res) => {
  const db = readDB();

  const produto = {
    id: Date.now().toString(),
    nome: req.body.nome,
    codigo: req.body.codigo,
    quantidade: Number(req.body.quantidade) || 0,
    minimo: Number(req.body.minimo) || 0,
    preco: Number(req.body.preco) || 0
  };

  db.produtos.push(produto);
  writeDB(db);

  res.json(produto);
});

app.put("/api/produtos/:id", (req, res) => {
  const db = readDB();
  const index = db.produtos.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Produto não encontrado" });
  }

  db.produtos[index] = { ...db.produtos[index], ...req.body };
  writeDB(db);

  res.json(db.produtos[index]);
});

app.delete("/api/produtos/:id", (req, res) => {
  const db = readDB();
  db.produtos = db.produtos.filter(p => p.id !== req.params.id);
  writeDB(db);
  res.json({ ok: true });
});

// ===== ORDENS DE SERVIÇO =====
app.get("/api/ordens", (req, res) => {
  const db = readDB();
  res.json(db.ordens);
});

app.post("/api/ordens", (req, res) => {
  const db = readDB();

  const ordem = {
    id: Date.now().toString(),
    clienteId: req.body.clienteId,
    tecnico: req.body.tecnico || "",
    equipamento: req.body.equipamento,
    descricao: req.body.descricao || "",
    status: req.body.status || "aberta",
    prioridade: req.body.prioridade || "media",
    valor: Number(req.body.valor) || 0,
    criadoEm: new Date()
  };

  db.ordens.push(ordem);
  writeDB(db);

  res.json(ordem);
});

app.put("/api/ordens/:id", (req, res) => {
  const db = readDB();
  const index = db.ordens.findIndex(o => o.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "OS não encontrada" });
  }

  db.ordens[index] = { ...db.ordens[index], ...req.body };
  writeDB(db);

  res.json(db.ordens[index]);
});

app.delete("/api/ordens/:id", (req, res) => {
  const db = readDB();
  db.ordens = db.ordens.filter(o => o.id !== req.params.id);
  writeDB(db);
  res.json({ ok: true });
});

// ===== VENDAS =====
app.get("/api/vendas", (req, res) => {
  const db = readDB();
  res.json(db.vendas);
});

app.post("/api/vendas", (req, res) => {
  const db = readDB();

  const venda = {
    id: Date.now().toString(),
    clienteId: req.body.clienteId || null,
    itens: req.body.itens || [],
    total: Number(req.body.total) || 0,
    pagamento: req.body.pagamento,
    data: new Date()
  };

  // Atualiza estoque
  venda.itens.forEach(item => {
    const produto = db.produtos.find(p => p.id === item.produtoId);
    if (produto) {
      produto.quantidade -= item.quantidade;
    }
  });

  db.vendas.push(venda);
  writeDB(db);

  res.json(venda);
});

// ===== START =====
app.listen(PORT, () => {
  console.log(`🔥 Backend rodando em http://localhost:${PORT}`);
});
