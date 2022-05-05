'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ocupacion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Ocupacion.belongsTo(models.Sector, { foreignKey: 'idSector'})
    }
  }
  Ocupacion.init({
    descripcion: DataTypes.STRING,
    idSector: {
      field: 'idSector',
      type: DataTypes.INTEGER
    },
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
    modelName: 'Ocupacion',
    timestamps: false,
    freezeTableName: true,
    tableName: 'ocupacion',
  });
  return Ocupacion;
};