const express = require("express");
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const app = express();
app.use(express.json());
let db = null;
const matchDetails = path.join(__dirname, "cricketMatchDetails.db");

const initialization = async () => {
  try {
    db = await open({ filename: matchDetails, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("server started successfully...");
    });
  } catch (e) {
    console.log(e.message);
  }
};

initialization();

// API 1

app.get("/players/", async (request, response) => {
  const playersQuery = `SELECT *
    FROM
    player_details
    ORDER BY
    player_id;`;

  const API1 = await db.all(playersQuery);

  const result = (obj) => {
    return {
      playerId: obj["player_id"],
      playerName: obj["player_name"],
    };
  };

  const result1 = [];

  for (let ele of API1) {
    result1.push(result(ele));
  }
  response.send(result1);
});

// API 2

app.get("/players/:playerId/", async (request, response) => {
  const playerId = request.params;
  const playerQuery = `SELECT *
    FROM
    player_details
    WHERE
    player_id = ${playerId};`;

  const API2 = await db.get(playerQuery);
  response.send(API2);
});
