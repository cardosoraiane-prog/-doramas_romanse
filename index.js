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
    const { nome,anoDeLansamento , quantidadeDeEpisodios, } = req.body;

    if (!nome || !anoDeLansamento  || quantidadeDeEpisodios) {
        return res.status(400).json({ erro: "Dados incompletos" });
    }

    const imc = peso / (  quantidadeDeEpisodios * quantidadeDeEpisodios );

    res.json({
        nome,
        anoDeLansamento ,
        imc: imc.toFixed(2)
    });
});

/*
========================
CLIENTES ENDPOINTS
========================
*/
const doramaromanticosFile = path.join(__dirname, "Doramaromanticos.json");

function lerDoramaromanticos() {
    if (!fs.existsSync(doramaRomanticosFile)) {
        return [];
    }
    const data = fs.readFileSync(doramaRomanticosFile, "utf-8");
    try {
        return JSON.parse(data) || [];
    } catch (e) {
        return [];
    }
}

function salvarDoramaromanticos(Doramaromanticos) {
    fs.writeFileSync(doramaRomanticosFile, JSON.stringify(Doramaromanticos, null, 2), "utf-8");
}

// GET http://localhost:3000/Doramaromanticos
app.get("/Doramaromanticos", (req, res) => {
    const Doramaromanticos = lerDoramaromanticos();
    res.json(Doramaromanticos);
});

// POST http://localhost:3000/Doramaromanticos
app.post("/Doramaromanticos", (req, res) => {
    const { nome, quantidadeDeEpisodios, anoDeLansamento , endereco, bairro, contato } = req.body;

    if (!nome || !nome) {
        return res.status(400).json({ erro: "O nome e o Nome são obrigatórios." });
    }

    const doRamaromanticos = lerDoramaromanticos();

    if (doramaRomanticos.some(c => c.nome === nome)) {
        return res.status(400).json({ erro: "Já existe um Doramaromanticos com este nome." });
    }

    const novoDoramaromanticos = { nome, quantidadeDeEpisodios, anoDeLansamento, endereco, bairro, contato };
    doramaRomanticos.push(novoDoramaromanticos);
    salvarDoramaromanticos(doramaRomanticos);

    res.status(201).json({ mensagem: "Doramaromanticos adicionado com sucesso", Doramaromanticos: novoDoramaromanticos });
});

// PUT http://localhost:3000/Doramaromanticos/:nome
app.put("/Doramaromanticos/:nome", (req, res) => {
    const { nome } = req.params;
    const {quantidadeDeEpisodios, anoDeLansamento, endereco, bairro, contato } = req.body;

    const doramaRomanticos  = lerDoramaromanticos();
    const index = Doramaromanticos.findIndex(c => c.cpf === cpf);

    if (index === -1) {
        return res.status(404).json({ erro: "Doramaromanticos não encontrado." });
    }

    doramaRomanticos [index] = {
        ...doramaRomanticos [index],
        nome, // Mantém o nome inalterado
        ...(nome !== undefined && { nome }),
        ...(anoDeLansamento !== undefined && { anoDeLansamento}),
        ...(endereco !== undefined && { endereco }),
        ...(bairro !== undefined && { bairro }),
        ...(contato !== undefined && { contato }),
        ...(quantidadeDeEpisodios !== undefined && {quantidadeDeEpisodios })
    };

    salvarDoramaromanticos (doramaRomanticos );

    res.json({ mensagem: "Doramaromanticos  atualizado com sucesso", Doramaromanticos : Doramaromanticos [index] });
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