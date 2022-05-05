'use strict'
const {
    Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class Correo extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Correo.belongsTo(models.Pais, { foreignKey: 'idPais', as: "Pais" })
        }
    };
    Correo.init({
        url: DataTypes.STRING,
        idPais: {
            field: 'idPais',
            type: DataTypes.INTEGER,
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
        modelName: 'Correo',
        timestamps: false,
        freezeTableName: true,
        tableName: 'correo',
    })
    return Correo
}
