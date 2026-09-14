const bcrypt = require('bcryptjs');
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class User extends Model {
  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  }
}

User.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  username: { type: DataTypes.STRING(50), allowNull: false, unique: true, validate: { notEmpty: true, len: [1, 50] } },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true, validate: { notEmpty: true, isEmail: true, len: [1, 100] } },
  password: { type: DataTypes.STRING(255), allowNull: false, validate: { notEmpty: true } },
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  defaultScope: { attributes: { exclude: ['password'] } },
  scopes: { withPassword: { attributes: { include: ['password'] } } },
  hooks: {
    async beforeSave(user) {
      if (user.changed('password') && user.password) {
        // Cek jika password belum di-hash dengan bcrypt ($2a$ atau $2b$) untuk mencegah double-hashing
        const isBcryptHash = typeof user.password === 'string' && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'));
        if (!isBcryptHash) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      }
    },
  },
});

module.exports = User;
