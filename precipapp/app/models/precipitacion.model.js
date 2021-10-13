'use strict'
const {
    Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class Precipitacion extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Precipitacion.belongsTo(models.Observador, { foreignKey: 'idObservador'})
        }
    };
    Precipitacion.init({
        fecha: DataTypes.DATE,
        valor: DataTypes.FLOAT,
        comentario: DataTypes.STRING,
        state: {
            type: DataTypes.CHAR,
            defaultValue: 'A'
        },
        idObservador: {
            field: 'idObservador',
            type: DataTypes.INTEGER,
            allowNull: false
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
        modelName: 'Precipitacion',
        timestamps: false,
        freezeTableName: true,
        tableName: 'precipitacion',
    })
    return Precipitacion
}
