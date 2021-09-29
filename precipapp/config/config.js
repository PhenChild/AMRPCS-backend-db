module.exports = {
  "development": {
    "username": "bits",
    "password": '123.456',
    "database": "precdb",
    "host": "localhost",
    "dialect": "postgres",
    "port":"5434"
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
