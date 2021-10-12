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
      Observador.belongsTo(models.Estacion)
      Observador.belongsTo(models.User)
    }
  };
  Observador.init({
    state: {
      type: DataTypes.CHAR,
      defaultValue: 'A'
    },
    isForSequia: {
      field: 'is_sequia',
      type: DataTypes.BOOLEAN,
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
