const { Sequelize, DataTypes, Op, QueryTypes } = require("sequelize");
const fs = require("fs");
const path = require("path");
const basename = path.basename(__filename);
const dotenv = require("dotenv");
dotenv.config();

const { MYSQL_DB, MYSQL_DB_USER, MYSQL_DB_PASSWORD, MYSQL_DB_HOST } =
    process.env;

const sequelize = new Sequelize(MYSQL_DB, MYSQL_DB_USER, MYSQL_DB_PASSWORD, {
    host: MYSQL_DB_HOST,
    dialect: "mysql",
    operatorsAliases: 0,
    timezone: "+09:00",
    pool: {
        max: 300,
        min: 10,
        idle: 10 * 10000,
    },
});

let db = [];

fs.readdirSync(__dirname)
    .filter((file) => {
        return (
            file.indexOf(".") !== 0 &&
            file !== basename &&
            file.slice(-3) === ".js"
        );
    })
    .forEach((file) => {
        const model = require(path.join(__dirname, file))(sequelize, DataTypes);
        db[model.name] = model;
    });

Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Op = Op;
db.QueryTypes = QueryTypes;

module.exports = db;
