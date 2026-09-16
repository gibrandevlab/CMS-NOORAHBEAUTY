require('dotenv').config();
const { Sequelize } = require('sequelize');

const sslEnabled = process.env.DB_SSL === 'true';

const sequelize = new Sequelize(
	process.env.DB_NAME || 'db_pt_gibran',
	process.env.DB_USER || 'root',
	process.env.DB_PASSWORD || 'rootpassword',
	{
		host: process.env.DB_HOST || '127.0.0.1',
		port: Number(process.env.DB_PORT || 3306),
		dialect: 'mysql',
		logging: false,
		dialectOptions: {
			multipleStatements: false,
			...(sslEnabled
				? {
					ssl: {
						rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
					},
				}
				: {}),
		},
		define: {
			timestamps: true,
			underscored: false,
		},
	},
);

module.exports = sequelize;
