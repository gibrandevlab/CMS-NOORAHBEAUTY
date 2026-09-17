const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class News extends Model {}

News.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  category_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  title: { type: DataTypes.STRING(255), allowNull: false, validate: { notEmpty: true, len: [1, 255] } },
  slug: { type: DataTypes.STRING(255), allowNull: false, unique: true, validate: { notEmpty: true, len: [1, 255] } },
  content: { type: DataTypes.TEXT('long'), allowNull: false, validate: { notEmpty: true } },
  image: { type: DataTypes.STRING(255), allowNull: true },
  image_file_id: { type: DataTypes.STRING(255), allowNull: true },
  is_published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, get() { return Boolean(this.getDataValue('is_published')); } },
}, {
  sequelize,
  modelName: 'News',
  tableName: 'news',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = News;
