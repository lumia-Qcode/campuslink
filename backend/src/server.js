require('dotenv').config();
const createApp  = require('./app');
const connectDB  = require('./infrastructure/database/connection');

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`\n🚀 CampusLink backend running on http://localhost:${PORT}`);
    console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
  });
})();
