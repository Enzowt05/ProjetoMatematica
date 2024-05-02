const Sequelize = require('sequelize');
//Conexão com o banco de dados
const sequelize = new Sequelize('db_matematica', 'db_matematica_user', 'uBzmxXvonWf3WAFiyaboVKIxRJBacmZc', {
    host: "dpg-coq1aon79t8c738841rg-a",
    port: "5432",
    dialect: 'mysql'
});
//Vamos exportar as variáveis
module.exports = {
    Sequelize: Sequelize,
    sequelize: sequelize
}
