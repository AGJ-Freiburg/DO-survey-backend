const dbConfig = require("./hidden/db/db.config.js");
var mysql = require("mysql2");

var connection = mysql.createConnection({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  port: dbConfig.PORT,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  multipleStatements: true,
});

/*

simple DMBS acces for poll server

*/
class Db {
  constructor() {
    // connection.on('error', function(e){console.log("DB Verbindung was nicht erfolgreiche"), e})
    connection.connect();
    var utc = new Date().toJSON().slice(0, 19).replace(/-/g, "/");
    console.log(utc + " - db set up");
  }

  // START OF DATA BASE QUERIES
  // LOGIN AND VERIFIVATION BEHAVIOR
  // SECURED
  // authentificate if the request has a correct token in the database
  insert_question(answer, code, qid, created, agent, ip, text, ref, callback) {
    console.log("DB: ------------   start insertion ----------------------");

    // console.log(answer, code, qid, created, agent, ip, text, ref);
    if (answer === undefined) {
      throw new Error("answer parameter not allowed to be undefined");
    }

    if (code === undefined) {
      throw new Error("code parameter not allowed to be undefined");
    }

    if (qid === undefined) {
      throw new Error("qid parameter not allowed to be undefined");
    }

    if (created === undefined) {
      throw new Error("created parameter not allowed to be undefined");
    }

    if (agent === undefined) {
      throw new Error("created parameter not allowed to be undefined");
    }

    if (ip === undefined) {
      throw new Error("ip parameter not allowed to be undefined");
    }

    if (text === undefined) {
      throw new Error("text parameter not allowed to be undefined");
    }

    if (ref === undefined) {
      throw new Error("ref parameter not allowed to be undefined");
    }

    if (ref.length > 499) {
      throw new Error("ref parameter to long");
    }

    if (ip.length > 100) {
      throw new Error("ip parameter to long");
    }

    if (text.length > 2500) {
      throw new Error("text parameter to long");
    }

    if (code.length > 99) {
      throw new Error("code parameter to long");
    }

    if (answer.length > 99) {
      throw new Error("answer parameter to long");
    }

    let sql = "SELECT 1 FROM megapart.eval where qid=" + connection.escape(qid) + " and code=" + connection.escape(code) + ";";
    connection.query(sql, (err, res) => {
      if (err) {
        console.log("SQL ERROR" + err);
      } else {
        console.log("SQL resulst" + res);
        // console.log("inserstion succesfull, enter callback");

        console.log(res.length);
        if (res.length == 1) {
          console.log("-----------> row already there, start udpate");

          sql = "UPDATE eval SET answer = " + connection.escape(answer) + ", date = NOW(), agent=" + connection.escape(agent) + ", ip =" + connection.escape(ip) + ",text = " + connection.escape(text) + ", pollstarted =" + connection.escape(created) + ", ref =" + connection.escape(ref) + "where qid=" + connection.escape(qid) + " and code=" + connection.escape(code) + ";";
        } else {
          console.log("start insertion");

          var sql =
            "INSERT INTO  eval (answer, code, qid, date, agent, ip, text, pollstarted, ref) \
               VALUES (" +
            connection.escape(answer) +
            ",\
              " +
            connection.escape(code) +
            ",\
              " +
            connection.escape(qid) +
            ",\
              NOW(),\
              " +
            connection.escape(agent) +
            ",\
              " +
            connection.escape(ip) +
            ",\
              " +
            connection.escape(text) +
            ",\
              " +
            connection.escape(created) +
            ",\
              " +
            connection.escape(ref) +
            ");";
        }
        console.log("sql", sql);
        connection.query(sql, function (err, res) {
          if (err) {
            console.log("SQL ERROR", err + " using " + sql);
          } else {
            console.log("inserstion succesfull, enter callback");
          }
          callback(err, res);
        });
      }
    });
  }
}

module.exports = Db;
