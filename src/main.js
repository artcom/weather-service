const bunyan = require("bunyan")
const topping = require("mqtt-topping").default

const condition = require("./condition")
const convert = require("./convert")
const env = require("./env")
const YqlClient = require("./yqlClient")

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

const yql = new YqlClient(CLIENT_ID, CLIENT_SECRET)

updateWeatherData()
setInterval(updateWeatherData, CHECK_INVERVAL_IN_MINUTES * 60 * 1000)

function updateWeatherData() {
  loadWeatherData(LOCATION_WOEID)
    .then(transformWeatherData)
    .then(publishWeatherData)
    .catch(logError)
}

function loadWeatherData(woeid) {
  return yql.exec(`select * from weather.forecast where woeid=${woeid}`)
}

function transformWeatherData(data) {
  log.info({ data }, "received weather data")

  return {
    current: {
      condition: condition.fromCode(data.item.condition.code),
      temperature: convert.fahrenheitToCelsius(data.item.condition.temp),
      humidity: parseFloat(data.atmosphere.humidity),
      wind: {
        speed: convert.mphToKmh(data.wind.speed),
        direction: convert.degreesToCardinal(data.wind.direction)
      }
    },
    forecast: data.item.forecast.map((item) => ({
      condition: condition.fromCode(item.code),
      low: convert.fahrenheitToCelsius(item.low),
      high: convert.fahrenheitToCelsius(item.high)
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
