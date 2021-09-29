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
      Estacion.belongsTo(models.Division, { foreignKey: 'idUbicacion', as: 'Ubicacion' })
    }
  };
  Estacion.init({
    codigo: { type: DataTypes.STRING, unique: true },
    nombre: DataTypes.STRING,
    posicion: DataTypes.GEOMETRY,
    altitud: DataTypes.FLOAT,
    direccion: DataTypes.STRING,
    referencias: DataTypes.STRING,
    foto: DataTypes.BLOB,
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
    modelName: 'Estacion',
    timestamps: false,
    freezeTableName: true,
    tableName: 'estacion',
  })
  return Estacion
}
