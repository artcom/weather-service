const bunyan = require("bunyan")
const topping = require("mqtt-topping").default

const condition = require("./condition")
const env = require("./env")
const YahooWeatherClient = require("./yahooWeatherClient")

const CHECK_INVERVAL_IN_MINUTES = 30

const TCP_BROKER_URI = env.getOrThrow("TCP_BROKER_URI")
const CLIENT_ID = env.getOrThrow("CLIENT_ID")
const CLIENT_SECRET = env.getOrThrow("CLIENT_SECRET")
const WEATHER_TOPIC = env.getOrThrow("WEATHER_TOPIC")
const LOCATION_WOEID = env.getOrThrow("LOCATION_WOEID")

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

const weatherClient = new YahooWeatherClient(CLIENT_ID, CLIENT_SECRET)

updateWeatherData()
setInterval(updateWeatherData, CHECK_INVERVAL_IN_MINUTES * 60 * 1000)

function updateWeatherData() {
  weatherClient.queryWeather(LOCATION_WOEID)
    .then(transformWeatherData)
    .then(publishWeatherData)
    .catch(logError)
}

function transformWeatherData(data) {
  log.info({ data }, "received weather data")

  return {
    current: {
      condition: condition.fromCode(data.current_observation.condition.code),
      temperature: parseFloat(data.current_observation.condition.temperature),
      humidity: parseFloat(data.current_observation.atmosphere.humidity),
      wind: {
        speed: parseFloat(data.current_observation.wind.speed),
        direction: degreesToCardinal(data.current_observation.wind.direction)
      }
    },
    forecast: data.forecasts.map((item) => ({
      condition: condition.fromCode(item.code),
      low: parseFloat(item.low),
      high: parseFloat(item.high)
    }))
  }
}

function publishWeatherData(data) {
  log.info({ data }, "publishing weather data")

  return Promise.all([
    mqtt.publish(`${WEATHER_TOPIC}/current`, data.current),
    mqtt.publish(`${WEATHER_TOPIC}/forecast`, data.forecast)
  ])
}

function logError(error) {
  log.error({ error })
}

function degreesToCardinal(degrees) {
  const segment = Math.round(degrees / 45)
  return ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"][segment]
}
