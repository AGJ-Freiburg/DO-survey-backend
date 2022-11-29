module.exports = function (db) {
  //routing shit
  const express = require("express");
  const router = express.Router();

  // file storaging imddle ware
  var path = require("path");

  // token gernation
  var keygen = require("keygenerator");
  let codes = [];
  let codesCounter = {};

  // cors allowed origins
  let allowedOrigins = ["https://umfrage.daten-oase.org:8008", "https://umfrage.daten-oase.org", "http://umfrage.localhost:8008", "http://umfrage.localhost"];

  // iniital request, user get a specific token
  router.get("/startpoll", async (req, res) => {
    console.log("new get");
    let origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin); // restrict it to the required domain
      res.setHeader("Access-Control-Allow-Methods", "GET");
      res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
      res.setHeader("Access-Control-Allow-Credentials", true);
    }

    // kick connecten without referer
    if (req.headers["referer"] === undefined) {
      return res.status(404).send("forbidden");
    }

    let token = keygen._({ length: 99 });
    codes.push(token);
    codesCounter[token] = 0;

    res.status(200).send({ token: token });
  });

  // PREFLIGHT for user store answers process
  router.options("/saveanswer", async (req, res) => {
    let origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin); // restrict it to the required domain
      res.setHeader("Access-Control-Allow-Methods", "OPTIONS, PUT");
      res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
      res.setHeader("Access-Control-Allow-Credentials", true);
      res.status(200).send("cors ok");
    }
  });

  // after every answer the dbms stores the user input
  router.put("/saveanswer", async (req, res) => {
    var utc = new Date().toJSON().slice(0, 19).replace(/-/g, "/");
    let origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      // set cors
      res.setHeader("Access-Control-Allow-Origin", origin); // restrict it to the required domain
      res.setHeader("Access-Control-Allow-Methods", "OPTIONS, PUT");
      res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
      res.setHeader("Access-Control-Allow-Credentials", true);
    }

    // kick connecten without referer
    if (req.headers["referer"] === undefined) {
      console.log("error no referer");
      return res.status(404).send("forbidden");
    }

    // deny reqeust if not body (answer) was submitted
    if (req.body === undefined) {
      console.log("error no body");
      res.status(501).send("no body submitted");
      return;
    }

    let agent = req.get("user-Agent");
    let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    // anonymisize ip
    anonymIp = "";
    if (ip !== undefined && ip.length > 5) {
      for (let i = 0; i < ip.length; i++) {
        if (i <= ip.length - 4) {
          anonymIp += ip.charAt(i);
        } else {
          anonymIp += "X";
        }
      }
    }
    ip = anonymIp;
    let ref = req.headers["referer"];
    let data = req.body;
    let created = data.created;
    let code = data.code.token;

    if (!codes.includes(code)) {
      // token was not in storage... mismatch so deny conncetion
      res.status(502).send("code not known");
      return;
    } else {
      codesCounter[code] += 1;
      console.log("code counter: " + codesCounter);
      if (codesCounter[code] > 200) {
        console.log("to many request");
        res.status(502).send("code not known");
        return;
      }
    }

    // server log output
    console.log("------------- SAVE QUESTION -------------");
    console.log(data);

    let fine = true;
    let answer = "";
    let additionalText = "";

    // add text field information
    if (data.text !== undefined) {
      if (typeof data.text === "string") {
        if (data.text.length > 0) {
          additionalText = data.text;
        }
      }
    }

    // radio buttons + checkboxes storage
    answer = "radio/cb: " + Math.max(data.radiogroup, data.cb);
    db.insert_question(answer, code, data.id, created, agent, ip, additionalText, ref, (err, row) => {
      if (err) {
        var utc = new Date().toJSON().slice(0, 19).replace(/-/g, "/");
        console.log(utc + " - there was an error: ", err);
        res.status(500).send("DB ERROR");
        fine = false;
        return;
      } else {
        var utc = new Date().toJSON().slice(0, 19).replace(/-/g, "/");
        console.log(utc + " - INSERTION good");
        res.status(200).send("insertion succesfull ok");
      }
    });
  });
  return router;
};
