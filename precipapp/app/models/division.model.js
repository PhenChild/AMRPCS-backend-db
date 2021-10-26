'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Division extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Division.belongsTo(models.Pais, { foreignKey: 'idPais' })
      Division.belongsTo(models.Division, { foreignKey: 'idPadre'})
    }
  };
  Division.init({
    idPais: {
      field: 'idPais',
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: 'ubicacion'
    },
    idPadre: {
      field: 'idPadre',
      type: DataTypes.INTEGER,
      unique: 'ubicacion'
    },
    nombre: { type: DataTypes.STRING, unique: 'ubicacion' },
    nivel: { type: DataTypes.SMALLINT },
    state: {
      type: DataTypes.CHAR,
      defaultValue: 'A'
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
    modelName: 'Division',
    timestamps: false,
    freezeTableName: true,
    tableName: 'division',
  })
  return Division
}
