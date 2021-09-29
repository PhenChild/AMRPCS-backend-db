'use strict'
const {
    Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class Pais extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    Pais.init({
        nombre: DataTypes.STRING,
        siglas: DataTypes.STRING(2),
        enable: {
            type: DataTypes.BOOLEAN,
            defaultValue: 'true'
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
        modelName: 'Pais',
        timestamps: false,
        freezeTableName: true,
        tableName: 'pais',
    })
    return Pais
}
