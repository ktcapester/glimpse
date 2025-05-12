const mongoose = require("mongoose");

/**
 * Connects to the Amazon DocumentDB database using Mongoose.
 * @async
 * @function connectToDatabase
 * @throws Will throw an error if the connection fails.
 * @returns {Promise<void>} Resolves when the connection is successful.
 */
async function connectToDatabase() {
  const username = process.env.MONGO_USERNAME;
  const password = process.env.MONGO_PASSWORD;
  const host = process.env.MONGO_HOST;
  const port = process.env.MONGO_PORT;

  if (!username || !password || !host || !port) {
    throw new Error("Missing required MongoDB environment variables");
  }

  const uri = `mongodb://${username}:${password}@${host}:${port}/?replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false`;

  try {
    await mongoose.connect(uri, {
      tls: true,
      tlsCAFile: "./config/certs/global-bundle.pem",
      serverSelectionTimeoutMS: 5000, // Shortened from default 30s
      socketTimeoutMS: 30000, // Wait max 30s on stalled sockets
    });
    console.log("Connected to Amazon DocumentDB!");
  } catch (err) {
    console.log("Error connecting to Amazon DocumentDB", err);
    throw err;
  }
}

module.exports = connectToDatabase;
