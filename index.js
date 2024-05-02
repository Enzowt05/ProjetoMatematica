const express = require("express");
const app = express();
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const bodyParser = require('body-parser');
const Post = require('./models/Post');
const path = require('path');
const db = require('./models/db');
const session = require('express-session');

// carregando o cabeçalho do html em outras páginas
app.engine('handlebars', handlebars.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// arquivos estáticos
app.use(express.static('public'));
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));

// imagens
app.get('/image', (req, res) => {
    res.sendFile(path.join(__dirname, 'public'));
});

// Session and COOKIES!
app.use(session({
    secret: 'Volta-Vida',
    resave: false,
    saveUninitialized: false
}));

// Helper de adição
Handlebars.registerHelper('add', function (a, b) { return parseInt(a) + parseInt(b); });

// rota principal
app.get('/', function (req, res) {
    req.session.destroy();
    res.render('home')
});

// rota para o menu
app.post('/menu', function (req, res) {
    req.session.nome = req.body.nome;
    req.session.turma = req.body.turma;
    res.render('menu')

});

// rota para as regras
app.get('/regras', function (req, res) {
    res.render('regras');
});

app.get('/creditos', function (req, res) {
    res.render('creditos');
});

app.get('/comecar', function (req, res) {
    res.render('comecar')
});

app.get('/ranking', function (req, res) {
    const query = 'SELECT * FROM tb_pessoas ORDER BY tb_pessoa_pontos DESC';
    db.sequelize.query(query, { type: db.sequelize.QueryTypes.SELECT })
        .then(results => {
            res.render('ranking', { posts: results });
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Internal Server Error');
        });
});

let questao = 1;
let category = '';

let seconds = 0;
let minutes = 0;
app.get('/modo/:nivel', function (req, res) {
    const dificuldade = req.params;
    req.session.nivel = dificuldade.nivel;
    const nivel = req.session.nivel;
    const nome = req.session.nome;
    const turma = req.session.turma;
    Post.create({
        tb_pessoa_nome: nome,
        tb_pessoa_turma: turma,
        tb_pessoa_nivel: nivel,
        tb_pessoa_pontos: 0,
        tb_pessoa_tempo: 0
    });
    seconds = 0;
    minutes = 0;
    res.redirect('/timer')
});
app.get('/timer', function (req, res) {
    timer = setInterval(() => {
        seconds++;
        if (seconds === 60) {
            minutes++;
            seconds = 0;
        }
    }, 1000);
    res.redirect('/pergunta')
});

app.get('/pergunta', function (req, res) {
    const { readFile } = require('fs');
    console.log(timer);
    readFile('questions.json', 'utf8', (err, jsonString) => {
        const jsonObject = JSON.parse(jsonString);
        if (req.session.nivel == "Fácil") {
            category = jsonObject.quiz.category.find(c => c["@name"] === "Fácil");
        }
        else if (req.session.nivel == "Médio") {
            category = jsonObject.quiz.category.find(c => c["@name"] === "Médio");
        }
        else {
            category = jsonObject.quiz.category.find(c => c["@name"] === "Difícil");
        }
        const questions = category.question[questao - 1];
        const question = questions.text;
        const answers = questions.answers;
        res.render('pergunta', { question: question, answers, questao, seconds, minutes })
    });
});

app.get('/correto', function (req, res) {
    if (questao < 15) {
        questao++;
        res.redirect(`/pergunta`);
    }
    else {
        req.session.pontos = questao;
        res.redirect('/atualizar')
    }

})

app.get('/errado', function (req, res) {
    questao -= 1;
    req.session.pontos = questao;
    res.redirect(`/atualizar`);
})

app.get('/atualizar', function (req, res) {
    const pontuacao = req.session.pontos;
    const nome = req.session.nome;
    const turma = req.session.turma;
    const nivel = req.session.nivel;
    console.log(req.session.nome + ' ' + req.session.turma + ' ' + pontuacao);
    questao = 1;

    // Atualiza o registro no banco de dados
    db.sequelize.query("UPDATE tb_pessoas SET tb_pessoa_pontos = " + pontuacao + ", tb_pessoa_tempo = " + minutes + "" + seconds + ", tb_pessoa_nivel = '" + nivel + "' WHERE tb_pessoa_nome = '" + nome + "' AND tb_pessoa_turma = '" + turma + "'");
    console.log(`Pontuação de ${nome} atualizada com sucesso`);
    clearInterval(timer);
    res.redirect('/');
});
const PORT = process.env.PORT || 8081;
app.listen(PORT, function () {
    console.log("Servidor Rodando, vambora cambada");
});
