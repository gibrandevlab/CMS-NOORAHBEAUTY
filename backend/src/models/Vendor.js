const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Vendor extends Model {}

Vendor.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(255), allowNull: false, validate: { notEmpty: true, len: [1, 255] } },
  logo: { type: DataTypes.STRING(255), allowNull: true },
  address: { type: DataTypes.TEXT, allowNull: true },
  contact: { type: DataTypes.STRING(100), allowNull: true },
}, {
  sequelize,
  modelName: 'Vendor',
  tableName: 'vendors',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Vendor;
