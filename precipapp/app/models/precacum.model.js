'use strict'
const {
    Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class PrecAcum extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            PrecAcum.belongsTo(models.Observador, { foreignKey: 'idObservador'})
        }
    };
    PrecAcum.init({
        fechaInicio: {field: 'fecha_inicio', type: DataTypes.DATEONLY},
        fechaFin: {field: 'fecha_fin', type: DataTypes.DATE},
        valor: DataTypes.FLOAT,
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
        modelName: 'PrecAcum',
        timestamps: false,
        freezeTableName: true,
        tableName: 'prec_acum',
    })
    return PrecAcum
}
