const fetch = require("node-fetch")

const BASE_URL = "https://api.openweathermap.org/data/2.5"
const API_CALL = "onecall"
const LAT = "50.737"
const LON = "7.098"
const EXCLUDE_DATA = "hourly,minutely,alerts"
const UNITS = "metric"
const APP_ID = "063da9fd5923fe721ecfc32788ae8fcf"

// For temperature in Fahrenheit and wind speed in miles/hour, use units=imperial
// For temperature in Celsius and wind speed in meter/sec, use units=metric
// https://openweathermap.org/api/one-call-api#data

const getData = async (appId, lat, lon, log) => {
  const data = await fetch(`${BASE_URL}/${API_CALL}?lat=${lat}&lon=${lon}&units=${UNITS}&exclude=${EXCLUDE_DATA}&appid=${appId}`)
    .then(response => response.json())
    .catch(error => log.info(error))
  return data
}

module.exports = getData
