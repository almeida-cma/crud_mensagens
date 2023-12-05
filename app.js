const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

// Configuração do Body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuração do SQLite
const db = new sqlite3.Database('database.db');

// Criação da tabela se ela não existir
db.run(`
  CREATE TABLE IF NOT EXISTS mensagens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    email TEXT,
    mensagem TEXT
  )
`);

// Rotas CRUD
app.get('/mensagens', (req, res) => {
  db.all('SELECT * FROM mensagens', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ mensagens: rows });
  });
});

app.post('/mensagens', (req, res) => {
  const { nome, email, mensagem } = req.body;

  if (!nome || !email || !mensagem) {
    res.status(400).json({ error: 'Preencha todos os campos.' });
    return;
  }

  db.run('INSERT INTO mensagens (nome, email, mensagem) VALUES (?, ?, ?)',
    [nome, email, mensagem],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    });
});

app.put('/mensagens/:id', (req, res) => {
  const id = req.params.id;
  const { nome, email, mensagem } = req.body;

  if (!nome || !email || !mensagem) {
    res.status(400).json({ error: 'Preencha todos os campos.' });
    return;
  }

  db.run('UPDATE mensagens SET nome = ?, email = ?, mensagem = ? WHERE id = ?',
    [nome, email, mensagem, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ rowsAffected: this.changes });
    });
});

app.delete('/mensagens/:id', (req, res) => {
  const id = req.params.id;

  db.run('DELETE FROM mensagens WHERE id = ?',
    [id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ rowsAffected: this.changes });
    });
});

// Rota para servir a página admin.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor está rodando em http://localhost:${port}`);
});