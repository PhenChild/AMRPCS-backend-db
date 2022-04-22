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
        inundacion: DataTypes.INTEGER,
        granizo: DataTypes.INTEGER,
        rayos: DataTypes.INTEGER,
        deslizamiento: DataTypes.INTEGER,
        vientos: DataTypes.INTEGER,
        isNotificacion: DataTypes.BOOLEAN,
        comentario: DataTypes.STRING(300),
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
        modelName: 'PrecEx',
        timestamps: false,
        freezeTableName: true,
        tableName: 'prec_ex',
    })
    return Precipitacion
}
