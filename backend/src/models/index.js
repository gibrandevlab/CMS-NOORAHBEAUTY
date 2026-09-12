const sequelize = require('../config/db');
const AboutUs = require('./AboutUs');
const Category = require('./Category');
const News = require('./News');
const Product = require('./Product');
const User = require('./User');
const Vendor = require('./Vendor');

Category.hasMany(News, { foreignKey: 'category_id', as: 'news', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
News.belongsTo(Category, { foreignKey: 'category_id', as: 'category', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

module.exports = {
  sequelize,
  AboutUs,
  Category,
  News,
  Product,
  User,
  Vendor,
};
