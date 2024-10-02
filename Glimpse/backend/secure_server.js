const http = require("http");
const https = require("https");
const fs = require("fs");
const app = require("./app");

// HTTPS options
const options = {
  key: fs.readFileSync("path/to/your/private-key.pem"),
  cert: fs.readFileSync("path/to/your/certificate.pem"),
};

// Create HTTPS server
https.createServer(options, app).listen(443); // port 443 is default for https

// Create HTTP server and redirect all requests to HTTPS
http
  .createServer((req, res) => {
    res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
    res.end();
  })
  .listen(80); // port 80 is default for http
