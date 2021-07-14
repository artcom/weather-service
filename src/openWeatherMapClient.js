const fetch = require("node-fetch")

const BASE_URL = "https://api.openweathermap.org/data/2.5"
const API_CALL = "onecall"
const LAT = "50.737"
const LON = "7.098"
const EXCLUDE_DATA = "hourly,minutely,alerts"
const APP_ID = ""

const getData = async () => {
  const data = await fetch(`${BASE_URL}/${API_CALL}?lat=${LAT}&lon=${LON}&exclude=${EXCLUDE_DATA}&appid=${APP_ID}`)
    .then(response => response.json())
  return data
}

module.exports = getData
