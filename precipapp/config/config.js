module.exports = {
  "development": {
    "username": "postgres",
    "password": 'admin',
    "database": "precdb",
    "host": "localhost",
    "dialect": "postgres",
    "port":"5433"
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
    "password": null,
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
