'use strict'
const {
    Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class Cuestionario extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Cuestionario.belongsTo(models.Observador, { foreignKey: 'idObservador' })
        }
    };
    Cuestionario.init({
        fecha: {type: DataTypes.DATE},
        respSuelo: {
            field: 'resp_suelo',
            type: DataTypes.INTEGER
        },
        respVeg: {
            field: 'resp_veg',
            type: DataTypes.INTEGER
        },
        respPrec: {
            field: 'resp_prec',
            type: DataTypes.INTEGER
        },
        respTempPrec: {
            field: 'resp_temp_prec',
            type: DataTypes.INTEGER
        },
        respTemps: {
            field: 'resp_temps',
            type: DataTypes.INTEGER
        },
        respGana: {
            field: 'resp_gana',
            type: DataTypes.INTEGER
        },
        total: {type: DataTypes.FLOAT},
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
        modelName: 'Cuestionario',
        timestamps: false,
        freezeTableName: true,
        tableName: 'cuestionario',
    })
    return Cuestionario
}
