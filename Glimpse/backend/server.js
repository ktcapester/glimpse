const app = require("./app");
const http = require("http");
const net = require("net");
const mongoose = require("mongoose");
const connectToDatabase = require("./database");

/**
 * Test the database connection by performing a TCP ping.
 * @async
 * @function testDBConnection
 * @param {string} [host=process.env.MONGO_HOST] - Hostname of the database.
 * @param {number} [port=process.env.MONGO_PORT] - Port of the database.
 * @param {number} [timeout=5000] - Timeout in milliseconds for the connection.
 * @returns {Promise<void>} Resolves if the connection is successful, rejects otherwise.
 * @throws Will throw an error if the connection fails or times out.
 */
async function testDBConnection(
  host = process.env.MONGO_HOST,
  port = process.env.MONGO_PORT,
  timeout = 5000
) {
  if (!host) {
    throw new Error("MONGO_HOST is not defined!");
  }
  port = parseInt(port, 10) || 27017;

  return new Promise((resolve, reject) => {
    const socket = new net.Socket();

    // If connection doesn't happen within `timeout` ms, abort.
    socket.setTimeout(timeout, () => {
      socket.destroy();
      reject(
        new Error(`TCP ping to ${host}:${port} timed out after ${timeout}ms`)
      );
    });

    socket.once("error", (err) => {
      socket.destroy();
      reject(err);
    });

    socket.connect(port, host, () => {
      socket.end();
      resolve();
    });
  });
}

/**
 * Start the server and attempt to connect to the database.
 * Retries the database connection a specified number of times before proceeding.
 * @async
 * @function startServer
 * @param {number} [retries=5] - Number of retries for the database connection.
 * @param {number} [delayMs=5000] - Delay in milliseconds between retries.
 * @returns {Promise<void>} Resolves when the server starts successfully.
 */
async function startServer(retries = 5, delayMs = 5000) {
  try {
    console.log("Pinging database");
    await testDBConnection();
    console.log("Ping successful! Starting mongoose connection.");
  } catch (err) {
    console.log("Ping failed!");
    console.log(err.message);
  }

  while (retries > 0) {
    try {
      await connectToDatabase();
      console.log("Successfully connected to the database.");
      break;
    } catch (err) {
      retries--;
      console.log("DB connection failed, retrying in", delayMs, "ms.");
      console.log("Retries remaining:", retries);
      console.log("Error:", err);
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }

  if (retries === 0) {
    console.log("Failed to connect to DB after multiple retries.");
    console.warn("DB connection failed, starting anyway.");
  }

  const port = normalizePort(process.env.PORT || "8080"); // EB default is port 8080
  app.set("port", port);

  const server = http.createServer(app);

  server.listen(port, () => {
    console.log("Server started on port", port);
  });

  process.on("SIGINT", () => {
    console.log("SIGINT received.");
    shutdown(server);
  });
  process.on("SIGTERM", () => {
    console.log("SIGTERM received.");
    shutdown(server);
  });
}

/**
 * Clean up connections and exit gracefully
 */
async function shutdown(server) {
  console.log("Gracefully shutting down...");
  server.close(() => {
    mongoose.disconnect().then(() => {
      console.log("Server and DB connections closed. Exiting.");
      process.exit(0);
    });
  });
}

/**
 * Normalize a port into a number, string, or false.
 * @function normalizePort
 * @param {string} val - The port value to normalize.
 * @returns {number|string|boolean} The normalized port, or false if invalid.
 */
const normalizePort = (val) => {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }
  return false;
};

startServer();
