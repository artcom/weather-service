
const bunyan = require("bunyan")
const topping = require("mqtt-topping").default
const getData = require("./openWeatherMapClient")

const condition = require("./condition")
const env = require("./env")
const YahooWeatherClient = require("./yahooWeatherClient")

const CHECK_INVERVAL_IN_MINUTES = 30

const TCP_BROKER_URI = env.getOrThrow("TCP_BROKER_URI")

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

main()

async function main() {
  const weatherData = await getData()
  console.log(weatherData)
  const object = transformWeatherData(weatherData)
}

// const weatherClient = new YahooWeatherClient(CLIENT_ID, CLIENT_SECRET)

// updateWeatherData()
// setInterval(updateWeatherData, CHECK_INVERVAL_IN_MINUTES * 60 * 1000)

// function updateWeatherData() {
//   weatherClient.queryWeather(LOCATION_WOEID)
//     .then(transformWeatherData)
//     .then(publishWeatherData)
//     .catch(logError)
// }

function transformWeatherData(data) {
  const currentData = data.current
  const forecastData = data.daily
  return {
    current: {
      condition: condition.fromCode(currentData.weather[0].id),
      temperature: parseFloat(currentData.temp),
      humidity: parseFloat(currentData.humidity),
      sun: {
        rise: transformUnixTime(currentData.sunrise),
        set: transformUnixTime(currentData.sunset)
      },
      wind: {
        speed: parseFloat(currentData.wind_speed),
        direction: degreesToCardinal(currentData.wind_deg)
      }
    },
    forecast: data.forecasts.map(item => ({
      day: item.day,
      code: item.code,
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

function transformTime(time) {
  let hours = Number(time.match(/^(\d+)/)[1])
  const minutes = Number(time.match(/:(\d+)/)[1])
  const AMPM = time.match(/\s(.*)$/)[1]
  if (AMPM === "pm" && hours < 12) {hours = hours + 12}
  if (AMPM === "am" && hours === 12) {hours = hours - 12}
  let sHours = hours.toString()
  let sMinutes = minutes.toString()
  if (hours < 10) {sHours = `0${sHours}`}
  if (minutes < 10) {sMinutes = `0${sMinutes}`}
  return `${sHours}:${sMinutes}`
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

