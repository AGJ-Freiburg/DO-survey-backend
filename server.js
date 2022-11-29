const https = require("https");
fs = require("fs");
const path = require("path");
const express = require("express");

const app = express();
// middleware
app.use(express.json());

// ddos protection 
var Ddos = require("ddos");
var ddos = new Ddos({ burst: 10, limit: 15 });
app.use(ddos.express);
const bodyParser = require("body-parser");

// getting the local authentication type
const DB = require("./db.js");
const db = new DB();

app.use(bodyParser.json());

// routing the http requsts
const reqApi = require("./api.js")(db);

app.use("/", reqApi);

// set up ssl
const sslServer = https.createServer(
  {
    key: fs.readFileSync(path.join("hidden", "certificates", "key.pem")),
    cert: fs.readFileSync(path.join("hidden", "certificates", "certificate.pem")),
  },
  app
);

// Start the server
console.log("START THE SERVER ON 1337");
sslServer.listen(1337);
