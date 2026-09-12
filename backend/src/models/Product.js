const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Product extends Model {}

Product.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  category_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  name: { type: DataTypes.STRING(255), allowNull: false, validate: { notEmpty: true, len: [1, 255] } },
  slug: { type: DataTypes.STRING(255), allowNull: false, unique: true, validate: { notEmpty: true, len: [1, 255] } },
  description: { type: DataTypes.TEXT, allowNull: true },
  price: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0.00, get() { return Number(this.getDataValue('price')); }, validate: { min: 0 } },
  image: { type: DataTypes.STRING(255), allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, get() { return Boolean(this.getDataValue('is_active')); } },
}, {
  sequelize,
  modelName: 'Product',
  tableName: 'products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Product;
