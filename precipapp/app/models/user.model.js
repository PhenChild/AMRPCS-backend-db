'use strict'
const ROLES = require('../constants/ENUM').ROLES
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.belongsTo(models.Pais, { foreignKey: 'idPais', as: "Pais"})
      User.belongsTo(models.Ocupacion, { foreignKey: 'idOcupacion'})
    }
  };
  User.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    nombre: DataTypes.STRING,
    apellido: DataTypes.STRING,
    telefono: DataTypes.STRING,
    genero: DataTypes.STRING,
    foto: DataTypes.BLOB,
    idPais: {
      field: 'idPais',
      type: DataTypes.INTEGER,
    },
    idOcupacion: {
      field: 'idOcupacion',
      type: DataTypes.INTEGER
    },
    state: {
      type: DataTypes.CHAR,
      defaultValue: 'A'
    },
    role: {
      type: DataTypes.ENUM(ROLES),
      defaultValue: 'user' /** pending validation in backend for observer only type observer */
    },
    audCreatedAt: {
      field: 'aud_created_at',
      type: DataTypes.DATE,
      defaultValue: sequelize.fn('now'),
      allowNull: false
    },
    audUpdatedAt: {
      field: 'aud_updated_at',
      type: DataTypes.DATE,
    },
    audDeletedAt: {
      field: 'aud_deleted_at',
      type: DataTypes.DATE
    },
  }, {
    sequelize,
    schema: 'bh',
    modelName: 'User',
    timestamps: false,
    freezeTableName: true,
    tableName: 'user',
  })
  return User
}
