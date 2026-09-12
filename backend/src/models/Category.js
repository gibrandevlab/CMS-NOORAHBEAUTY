const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Category extends Model {}

Category.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false, validate: { notEmpty: true, len: [1, 100] } },
  slug: { type: DataTypes.STRING(255), allowNull: false, unique: true, validate: { notEmpty: true, len: [1, 255] } },
  type: { type: DataTypes.ENUM('NEWS', 'PRODUCT'), allowNull: false, defaultValue: 'NEWS' },
}, {
  sequelize,
  modelName: 'Category',
  tableName: 'categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Category;
