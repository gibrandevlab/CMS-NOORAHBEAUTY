require('dotenv').config();

const app = require('./src/app');
const sequelize = require('./src/config/db');
require('./src/models');

const port = process.env.PORT || 3000;

if (require.main === module) {
  sequelize.authenticate()
    .then(() => {
      app.listen(port, () => {
        console.log(`CMS Company backend listening on port ${port}`);
      });
    })
    .catch((error) => {
      console.error('Database connection failed:', error.message);
      process.exitCode = 1;
    });
}

module.exports = app;