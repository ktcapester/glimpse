const app = require("./app");
const http = require("http");
const net = require("net");
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
  server.on("error", (error) => onError(error, server, port));
  server.on("listening", () => onListening(server, port));
  server.listen(port);
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

/**
 * Handle server errors during startup.
 * @function onError
 * @param {Object} error - The error object.
 * @param {Object} server - The HTTP server instance.
 * @param {number|string} port - The port the server is attempting to use.
 * @throws Will throw the error if it is not related to listening.
 */
const onError = (error, server, port) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
    default:
      throw error;
  }
};

/**
 * Log a message when the server starts listening.
 * @function onListening
 * @param {Object} server - The HTTP server instance.
 * @param {number|string} port - The port the server is listening on.
 */
const onListening = (server, port) => {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + port;
  console.log("Listening on " + bind);
};

startServer();
