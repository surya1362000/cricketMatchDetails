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
  const { playerId } = request.params;
  const playerQuery = `SELECT *
    FROM
    player_details
    WHERE
    player_id = ${playerId};`;

  const API2 = await db.get(playerQuery);
  response.send({
    playerId: API2["player_id"],
    playerName: API2["player_name"],
  });
});

// API 3

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;
  const updateQuery = `UPDATE
    player_details
    SET
    player_name = '${playerName}'
    WHERE
    player_id = ${playerId};`;
  const API4 = await db.run(updateQuery);
  response.send("Player Details Updated");
});

// API 4

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `SELECT *
    FROM
    match_details
    WHERE
    match_id = ${matchId};`;

  const API4 = await db.get(getMatchQuery);
  response.send({
    matchId: API4["match_id"],
    match: API4["match"],
    year: API4["year"],
  });
});

// API 5

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const playerMatchesQuery = `SELECT 
    *
    FROM
    player_match_score
    NATURAL JOIN match_details
    WHERE
    player_id = ${playerId}`;

  const changeResult = (ele) => {
    return {
      matchId: ele["match_id"],
      match: ele["match"],
      year: ele["year"],
    };
  };
  const API5 = await db.all(playerMatchesQuery);
  response.send(API5.map((el) => changeResult(el)));
});

// API 6

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const specificMatchPlayerQuery = `
	    SELECT
	      player_details.player_id AS playerId,
	      player_details.player_name AS playerName
        FROM player_match_score 
        NATURAL JOIN player_details
        WHERE 
        match_id=${matchId};`;

  const API6 = await db.all(specificMatchPlayerQuery);
  response.send(API6);
});

//API 7

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const scoreQuery = `
    SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes FROM 
    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId};
    `;
  const API7 = await db.get(scoreQuery);
  response.send(API7);
});

module.exports = app;
