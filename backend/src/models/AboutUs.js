const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class AboutUs extends Model {}

AboutUs.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  company_name: { type: DataTypes.STRING(255), allowNull: false, defaultValue: 'PT Gibran' },
  description: { type: DataTypes.TEXT, allowNull: true },
  vision: { type: DataTypes.TEXT, allowNull: true },
  mission: { type: DataTypes.TEXT, allowNull: true },
  address: { type: DataTypes.TEXT, allowNull: true },
  phone: { type: DataTypes.STRING(50), allowNull: true },
  email: { type: DataTypes.STRING(100), allowNull: true, validate: { isEmail: true } },
}, {
  sequelize,
  modelName: 'AboutUs',
  tableName: 'about_us',
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at',
  defaultScope: { attributes: { exclude: ['createdAt'] } },
});

module.exports = AboutUs;
