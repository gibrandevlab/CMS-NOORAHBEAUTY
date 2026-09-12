const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
	process.env.DB_NAME || 'db_pt_gibran',
	process.env.DB_USER || 'root',
	process.env.DB_PASSWORD || '',
	{
		host: process.env.DB_HOST || '127.0.0.1',
		port: Number(process.env.DB_PORT || 3306),
		dialect: 'mysql',
		logging: false,
		define: {
			timestamps: true,
			underscored: false,
		},
	},
);

module.exports = sequelize;