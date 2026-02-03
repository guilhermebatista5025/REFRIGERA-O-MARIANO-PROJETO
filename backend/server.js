const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express(); // ✅ precisa estar antes do app.use(cors)
app.use(cors());
app.use(express.json());

// Arquivo JSON para simular banco
const DB_FILE = path.join(__dirname, "db.json");

// Funções de leitura/escrita no JSON
function readDB() {
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
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

// ===== ROTAS DA API =====

// GET /api/clientes
app.get("/api/clientes", (req, res) => {
  const db = readDB();
  res.json(db.clientes);
});

// POST /api/clientes
app.post("/api/clientes", (req, res) => {
  const db = readDB();
  const newCliente = { id: Date.now().toString(), ...req.body };
  db.clientes.push(newCliente);
  writeDB(db);
  res.json(newCliente);
});

// GET /api/produtos
app.get("/api/produtos", (req, res) => {
  const db = readDB();
  res.json(db.produtos);
});

// POST /api/produtos
app.post("/api/produtos", (req, res) => {
  const db = readDB();
  const newProduto = { id: Date.now().toString(), ...req.body };
  db.produtos.push(newProduto);
  writeDB(db);
  res.json(newProduto);
});

// GET /api/ordens
app.get("/api/ordens", (req, res) => {
  const db = readDB();
  res.json(db.ordens);
});

// POST /api/ordens
app.post("/api/ordens", (req, res) => {
  const db = readDB();
  const newOrdem = { id: Date.now().toString(), ...req.body };
  db.ordens.push(newOrdem);
  writeDB(db);
  res.json(newOrdem);
});

// GET /api/vendas
app.get("/api/vendas", (req, res) => {
  const db = readDB();
  res.json(db.vendas);
});

// POST /api/vendas
app.post("/api/vendas", (req, res) => {
  const db = readDB();
  const newVenda = { id: Date.now().toString(), ...req.body };
  db.vendas.push(newVenda);
  writeDB(db);
  res.json(newVenda);
});

// ===== SERVIR FRONTEND =====
app.use(express.static(path.join(__dirname, "..")));

// Rota principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

// ===== INICIAR SERVIDOR =====
app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
