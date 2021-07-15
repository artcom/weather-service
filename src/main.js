
const bunyan = require("bunyan")
const topping = require("mqtt-topping").default
const getData = require("./openWeatherMapClient")

const condition = require("./condition")
const env = require("./env")

const CHECK_INVERVAL_IN_MINUTES = 30

const TCP_BROKER_URI = env.getOrThrow("TCP_BROKER_URI")
const WEATHER_TOPIC = env.getOrThrow("WEATHER_TOPIC")
const APP_ID = env.getOrThrow("APP_ID")
const LAT = env.getOrThrow("LAT")
const LON = env.getOrThrow("LON")


const log = bunyan.createLogger({
  name: "weather-service",
  serializers: {
    error: bunyan.stdSerializers.err
  }
})

const clientId = `WeatherService-${Math.random().toString(16).substr(2, 8)}`
const mqtt = topping.connect(TCP_BROKER_URI, null, { clientId })

mqtt.on("connect", () => log.info({ TCP_BROKER_URI }, "connected to broker"))
mqtt.on("close", () => log.warn({ TCP_BROKER_URI }, "disconnected from broker"))
mqtt.on("error", () => log.error({ TCP_BROKER_URI }, "error connecting to broker"))

updateWeatherData()
setInterval(updateWeatherData, CHECK_INVERVAL_IN_MINUTES * 60 * 1000)


async function updateWeatherData() {
  const weatherData = await getData(APP_ID, LAT, LON, log)
  log.info({ weatherData }, "received weather data")

  const transformedWeatherData = transformWeatherData(weatherData)
  publishWeatherData(transformedWeatherData)
}

function transformWeatherData(data) {
  const currentData = data.current
  const forecastData = data.daily
  return {
    current: {
      condition: condition.fromCode(currentData.weather[0].id),
      temperature: Math.round(currentData.temp),
      humidity: Math.round(currentData.humidity),
      sun: {
        rise: transformUnixTime(currentData.sunrise),
        set: transformUnixTime(currentData.sunset)
      },
      wind: {
        speed: Math.round(mpsToKmh(currentData.wind_speed)),
        direction: degreesToCardinal(currentData.wind_deg)
      }
    },
    forecast: forecastData.map(day => ({
      day: getDayFromUnixTime(day.dt),
      condition: condition.fromCode(day.weather[0].id),
      low: Math.round(day.temp.min),
      high: Math.round(day.temp.max)
    }))
  }
}

function publishWeatherData(data) {
  log.info({ data }, "publishing weather data")
  mqtt.publish(`${WEATHER_TOPIC}/current`, data.current)
  mqtt.publish(`${WEATHER_TOPIC}/forecast`, data.forecast)
}

function degreesToCardinal(degrees) {
  const segment = Math.round(degrees / 45)
  return ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"][segment]
}

function transformUnixTime(timeStemp) {
  const date = new Date(timeStemp * 1000)
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  const formattedTime = `${hours}:${minutes}`
  return formattedTime
}

function getDayFromUnixTime(timeStemp) {
  const date = new Date(timeStemp * 1000)
  const day = date.toLocaleDateString("en-EN", { weekday: "short" })
  return day
}

function mpsToKmh(mps) {
  return mps * 3.6
}

