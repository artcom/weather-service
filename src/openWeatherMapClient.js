const fetch = require("node-fetch")

const BASE_URL = "https://api.openweathermap.org/data/2.5"
const API_CALL = "onecall"
const LAT = "50.737"
const LON = "7.098"
const EXCLUDE_DATA = "hourly,minutely,alerts"
const APP_ID = "063da9fd5923fe721ecfc32788ae8fcf"

const getData = () => fetch(`${BASE_URL}/${API_CALL}?lat=${LAT}&lon=${LON}&exclude=${EXCLUDE_DATA}&appid=${APP_ID}`)
  .then(response => response.json())
  .then(data => console.log(data))

module.exports = getData
