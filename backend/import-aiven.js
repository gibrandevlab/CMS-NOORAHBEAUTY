const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const fileName = process.argv[2] || 'db_pt_gibran.sql';
const filePath = path.resolve(__dirname, fileName);

// Construct connection URL from environment variables to prevent leaking credentials
const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = process.env.DB_PORT || 3306;
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'defaultdb';

const dbUrl = process.env.AIVEN_DB_URL || process.env.DB_URL || `mysql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;

const sequelize = new Sequelize(dbUrl, {
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    multipleStatements: true,
    ssl: process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud.com') ? { rejectUnauthorized: false } : false,
  },
});

(async () => {
  try {
    if (!fs.existsSync(filePath)) {
      console.error('❌ File tidak ditemukan:', filePath);
      process.exit(1);
    }
    console.log('🚀 Mengunggah dan mengeksekusi', fileName, 'ke database target...');
    const rawSql = fs.readFileSync(filePath, 'utf8');

    // Multi-statement SQL block executed via sequelize.query()
    const fullSql = `
      SET FOREIGN_KEY_CHECKS = 0;
      SET SESSION sql_require_primary_key = 0;
      
      DROP TABLE IF EXISTS \`news\`;
      DROP TABLE IF EXISTS \`products\`;
      DROP TABLE IF EXISTS \`about_us\`;
      DROP TABLE IF EXISTS \`categories\`;
      DROP TABLE IF EXISTS \`users\`;
      DROP TABLE IF EXISTS \`vendors\`;

      ${rawSql}

      SET FOREIGN_KEY_CHECKS = 1;
      SET SESSION sql_require_primary_key = 1;
    `;

    await sequelize.query(fullSql);
    console.log('✅ Import SQL Berhasil!');
  } catch (error) {
    console.error('❌ Terjadi kesalahan saat import:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
})();