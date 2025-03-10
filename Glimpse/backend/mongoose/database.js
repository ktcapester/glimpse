// database.js
const mongoose = require("mongoose");
const fs = require("fs");

async function connectToDatabase() {
  const username = process.env.MONGO_USERNAME;
  const password = process.env.MONGO_PASSWORD;
  const host = process.env.MONGO_HOST;
  const port = process.env.MONGO_PORT;

  // Read the CA certificate from file
  const ca = [fs.readFileSync("./config/certs/global-bundle.pem")];

  const uri = `mongodb://${username}:${password}@${host}:${port}/?tls=true&tlsCAFile=global-bundle.pem&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false`;

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      sslValidate: true,
      sslCA: ca,
    });
    console.log("Connected to Amazon DocumentDB!");
  } catch (err) {
    console.error("Error connecting to Amazon DocumentDB", err);
    process.exit(1);
  }
}

module.exports = connectToDatabase;
