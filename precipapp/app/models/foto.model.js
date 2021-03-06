'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Foto extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Foto.belongsTo(models.Cuestionario, { foreignKey: 'idCuestionario'})
    }
  };
  Foto.init({
    idCuestionario: {
      field: 'idCuestionario',
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    foto: { type: DataTypes.BLOB },
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
    modelName: 'Foto',
    timestamps: false,
    freezeTableName: true,
    tableName: 'foto',
  })
  return Foto
}
