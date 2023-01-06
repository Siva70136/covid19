const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "covid19India.db");
let db = null;

const initializeDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(4000);
    console.log("server started at http://localhost:4000");
  } catch (e) {
    console.log(`error message ${e.message}`);
  }
};

initializeDb();
const convertResponseObj = (data) => {
  return {
    stateId: data.state_id,
    stateName: data.state_name,
    population: data.population,
  };
};

const convertResponseObjState = (data) => {
  return {
    stateName: data.state_name,
  };
};

const convertResponseObj1 = (data) => {
  return {
    districtID: data.district_id,
    districtName: data.district_name,
    stateId: data.state_id,
    cases: data.cases,
    cured: data.cured,
    active: data.active,
    deaths: data.deaths,
  };
};

app.get("/states/", async (request, response) => {
  const getQuery = `SELECT * FROM state;`;

  const getObj = await db.all(getQuery);

  response.send(getObj.map((eachObj) => convertResponseObj(eachObj)));
});

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getQuery = `SELECT * FROM state WHERE state_id="${stateId}";`;

  const getObj = await db.get(getQuery);

  response.send(convertResponseObj(getObj));
});

app.post("/districts/", async (request, response) => {
  const district = request.body;

  const { districtName, stateId, cases, cured, active, deaths } = district;

  const postQuery = `INSERT INTO district (district_name, state_id, cases, cured, active, deaths) VALUES ('${districtName}','${stateId}','${cases}','${cured}','${active}','${deaths}');`;

  const getObj = await db.run(postQuery);

  response.send("District Successfully Added");
});

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getQuery = `SELECT * FROM district WHERE district_id="${districtId}";`;

  const getObj = await db.get(getQuery);

  response.send(convertResponseObj1(getObj));
});

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getQuery = `DELETE FROM district WHERE district_id="${districtId}";`;

  const getObj = await db.run(getQuery);

  response.send("District Removed");
});

app.put("/districts/:districtId/", async (request, response) => {
  const district = request.body;
  const { districtId } = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = district;

  const postQuery = `UPDATE district SET district_name='${districtName}', state_id='${stateId}', cases='${cases}', cured='${cured}', active='${active}', deaths='${deaths}' WHERE district_id="${districtId}" ;`;

  const getObj = await db.run(postQuery);

  response.send("District Details Updated");
});

app.get("/states/:stateId/stat/", async (request, response) => {
  const { stateId } = request.params;
  const getQuery = `SELECT SUM(cases) as totalCases,SUM(cured) as totalCured,SUM(active) as totalActive,SUM(Deaths) as totalDeaths FROM district WHERE state_id="${stateId}" GROUP By state_id;`;

  const getObj = await db.get(getQuery);

  response.send(getObj);
});

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getQuery = `SELECT state_id FROM district WHERE district_id="${districtId}";`;

  const getObj = await db.get(getQuery);
  const id = getObj.state_id;
  const retriveQuery = `select * from state where state_id='${getObj.state_id}';`;
  const data = await db.get(retriveQuery);

  response.send(convertResponseObjState(data));
});
module.exports = app;
