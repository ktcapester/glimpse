const mongoose = require("mongoose");

async function connectToDatabase() {
  const username = process.env.MONGO_USERNAME;
  const password = process.env.MONGO_PASSWORD;
  const host = process.env.MONGO_HOST;
  const port = process.env.MONGO_PORT;

  const uri = `mongodb://${username}:${password}@${host}:${port}/?replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false`;

  try {
    await mongoose.connect(uri, {
      tls: true,
      tlsCAFile: "./config/certs/global-bundle.pem",
    });
    console.log("Connected to Amazon DocumentDB!");
  } catch (err) {
    console.error("Error connecting to Amazon DocumentDB", err);
  }
}

module.exports = connectToDatabase;
