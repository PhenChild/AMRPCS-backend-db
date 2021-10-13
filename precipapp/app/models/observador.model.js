'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Observador extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Observador.belongsTo(models.Estacion, { foreignKey: 'idEstacion'})
      Observador.belongsTo(models.User, { foreignKey: 'idUser'})
    }
  };
  Observador.init({
    state: {
      type: DataTypes.CHAR,
      defaultValue: 'A'
    },
    idEstacion: {
      field: 'idEstacion',
      type: DataTypes.INTEGER,
    },
    idUser: {
      field: 'idUser',
      type: DataTypes.INTEGER,
      unique: true
    },
    audCreatedAt: {
      field: 'aud_created_at',
      type: DataTypes.DATEONLY,
      defaultValue: sequelize.fn('now'),
      allowNull: false
    },
    audUpdatedAt: {
      field: 'aud_updated_at',
      type: DataTypes.DATEONLY,
    },
    audDeletedAt: {
      field: 'aud_deleted_at',
      type: DataTypes.DATEONLY
    },
  }, {
    sequelize,
    schema: 'bh',
    modelName: 'Observador',
    timestamps: false,
    freezeTableName: true,
    tableName: 'observador',
  })
  return Observador
}