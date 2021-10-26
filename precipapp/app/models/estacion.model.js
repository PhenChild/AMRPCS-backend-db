'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Estacion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Estacion.belongsTo(models.Division, { foreignKey: 'idUbicacion'})
    }
  };
  Estacion.init({
    codigo: { type: DataTypes.STRING(7), unique: true },
    nombre: DataTypes.STRING,
    posicion: DataTypes.GEOMETRY,
    altitud: DataTypes.FLOAT,
    direccion: DataTypes.STRING,
    referencias: DataTypes.STRING,
    foto: DataTypes.BLOB,
    hasPluviometro: {
      field: 'tiene_pluv',
      type: DataTypes.BOOLEAN,
    },
    state: {
      type: DataTypes.CHAR,
      defaultValue: 'A'
    },
    idUbicacion: {
      field: 'idUbicacion',
      type: DataTypes.INTEGER,
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
    modelName: 'Estacion',
    timestamps: false,
    freezeTableName: true,
    tableName: 'estacion',
  })
  return Estacion
}
