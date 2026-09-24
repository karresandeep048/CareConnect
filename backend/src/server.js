require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { seedDatabaseIfEmpty } = require('./seed/seed');

let PORT = parseInt(process.env.PORT, 10) || 5001;

const startServer = async () => {
  await connectDB();
  // Seed demo data automatically when the DB is empty (essential for the embedded in-memory DB)
  await seedDatabaseIfEmpty();

  const listen = (portToUse) => {
    const server = app.listen(portToUse, () => {
      console.log(`=======================================================`);
      console.log(`🚀 CareConnect API Server running on port ${portToUse}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`=======================================================`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`[Server Warning] Port ${portToUse} is currently in use. Trying port ${portToUse + 1}...`);
        listen(portToUse + 1);
      } else {
        console.error('[Server Error]:', err);
      }
    });
  };

  listen(PORT);
};

startServer();
