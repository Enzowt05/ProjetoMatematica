const db = require('./db');
//criando a tabela postagens
const Post = db.sequelize.define('tb_pessoa', {
    tb_pessoa_nome: {
        type: db.Sequelize.TEXT
    },
    tb_pessoa_turma: {
        type: db.Sequelize.TEXT
    },
    tb_pessoa_pontos: {
        type: db.Sequelize.INTEGER
    },
    tb_pessoa_tempo: {
        type: db.Sequelize.TIME
    },
    tb_pessoa_nivel: {
        type: db.Sequelize.TEXT
    },
});
//Post.sync({ force: true });
module.exports = Post;

