const { DataSource } = require("typeorm");
const { OrderEntity, ItemEntity } = require("./dist/main");

exports.datasource = new DataSource({
  "type": "mysql",
  "host": "localhost",
  "port": 3307,
  "username": "root",
  "password": "testIssue",
  "database": "testDb",
  "entities": [
    OrderEntity,
    ItemEntity
  ],
  "migrations": ["src/migrations/"],
  "migrationsTableName": "migrations"
});
