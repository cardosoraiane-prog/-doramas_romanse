const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
const PORT = 3000;

// Permite receber JSON no body
app.use(express.json());

// CORS - Permite que qualquer origem acesse a API
app.use(cors());

/*
========================

http://localhost:3000/saudacao?nome=Joao
*/
app.get("/saudacao", (req, res) => {
    const nome = req.query.nome;

    if (!nome) {
        return res.status(400).json({ erro: "Nome não enviado" });
    }

    res.json({ mensagem: `Seu nome é ${nome}` });
});


/*
========================
POST - Calcula IMC
========================

POST http://localhost:3000/imc

Body JSON esperado:
{
  "nome": "Joao",
  "idade": 25,
  "altura": 1.75,
  "peso": 70
}
*/
app.post("/imc", (req, res) => {
    const { nome, idade, altura, peso } = req.body;

    if (!nome || !idade || !altura || !peso) {
        return res.status(400).json({ erro: "Dados incompletos" });
    }

    const imc = peso / (altura * altura);

    res.json({
        nome,
        idade,
        imc: imc.toFixed(2)
    });
});

/*
========================
CLIENTES ENDPOINTS
========================
*/
const clientesFile = path.join(__dirname, "clientes.json");

function lerClientes() {
    if (!fs.existsSync(clientesFile)) {
        return [];
    }
    const data = fs.readFileSync(clientesFile, "utf-8");
    try {
        return JSON.parse(data) || [];
    } catch (e) {
        return [];
    }
}

function salvarClientes(clientes) {
    fs.writeFileSync(clientesFile, JSON.stringify(clientes, null, 2), "utf-8");
}

// GET http://localhost:3000/clientes
app.get("/clientes", (req, res) => {
    const clientes = lerClientes();
    res.json(clientes);
});

// POST http://localhost:3000/clientes
app.post("/clientes", (req, res) => {
    const { cpf, nome, idade, endereco, bairro, contato } = req.body;

    if (!cpf || !nome) {
        return res.status(400).json({ erro: "O CPF e o Nome são obrigatórios." });
    }

    const clientes = lerClientes();

    if (clientes.some(c => c.cpf === cpf)) {
        return res.status(400).json({ erro: "Já existe um cliente com este CPF." });
    }

    const novoCliente = { cpf, nome, idade, endereco, bairro, contato };
    clientes.push(novoCliente);
    salvarClientes(clientes);

    res.status(201).json({ mensagem: "Cliente adicionado com sucesso", cliente: novoCliente });
});

// PUT http://localhost:3000/clientes/:cpf
app.put("/clientes/:cpf", (req, res) => {
    const { cpf } = req.params;
    const { nome, idade, endereco, bairro, contato } = req.body;

    const clientes = lerClientes();
    const index = clientes.findIndex(c => c.cpf === cpf);

    if (index === -1) {
        return res.status(404).json({ erro: "Cliente não encontrado." });
    }

    clientes[index] = {
        ...clientes[index],
        cpf, // Mantém o CPF inalterado
        ...(nome !== undefined && { nome }),
        ...(idade !== undefined && { idade }),
        ...(endereco !== undefined && { endereco }),
        ...(bairro !== undefined && { bairro }),
        ...(contato !== undefined && { contato })
    };

    salvarClientes(clientes);

    res.json({ mensagem: "Cliente atualizado com sucesso", cliente: clientes[index] });
});

/*
========================
USUÁRIOS / LOGIN ENDPOINTS
========================
*/
const usuariosFile = path.join(__dirname, "usuarios.json");

function lerUsuarios() {
    if (!fs.existsSync(usuariosFile)) {
        return [];
    }
    const data = fs.readFileSync(usuariosFile, "utf-8");
    try {
        return JSON.parse(data) || [];
    } catch (e) {
        return [];
    }
}

function salvarUsuarios(usuarios) {
    fs.writeFileSync(usuariosFile, JSON.stringify(usuarios, null, 2), "utf-8");
}

// POST http://localhost:3000/usuarios
app.post("/usuarios", (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ erro: "Nome, e-mail e senha são obrigatórios." });
    }

    const usuarios = lerUsuarios();

    if (usuarios.some(u => u.email === email)) {
        return res.status(400).json({ erro: "Este e-mail já está cadastrado." });
    }

    const novoUsuario = { nome, email, senha };
    usuarios.push(novoUsuario);
    salvarUsuarios(usuarios);

    // Gera um token para o usuário recém-cadastrado
    const token = crypto.randomUUID();
    res.status(201).json({ token, mensagem: "Usuário cadastrado com sucesso!" });
});

// POST http://localhost:3000/login
app.post("/login", (req, res) => {
    const { user, senha } = req.body; // 'user' é o e-mail no front-end

    if (!user || !senha) {
        return res.status(400).json({ erro: "E-mail (user) e senha são obrigatórios." });
    }

    const usuarios = lerUsuarios();
    const usuario = usuarios.find(u => u.email === user);

    if (!usuario || usuario.senha !== senha) {
        return res.status(401).json({ erro: "E-mail ou senha incorretos." });
    }

    // Gera um token para a sessão
    const token = crypto.randomUUID();
    res.json({ token, mensagem: "Login realizado com sucesso!" });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});