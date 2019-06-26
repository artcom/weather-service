const OAuth = require("oauth")
const querystring = require("querystring")

const YQL_BASE_URL = "https://weather-ydn-yql.media.yahoo.com/forecastrss"

const header = {
  "X-Yahoo-App-Id": "weather-service"
}

module.exports = class YahooWeatherClient {
  constructor(clientId, clientSecret) {
    this.oauth = new OAuth.OAuth(
      null,
      null,
      clientId,
      clientSecret,
      "1.0",
      null,
      "HMAC-SHA1",
      null,
      header
    )
  }

  queryWeather(woeid) {
    const url = `${YQL_BASE_URL}?${querystring.stringify({ woeid, u: "c", format: "json" })}`

    return new Promise((resolve, reject) => {
      this.oauth.get(url, "", "", (error, json) => {
        const result = parseResponse(error, json)

        if (result.error) {
          reject(result.error)
        } else {
          resolve(result.data)
        }
      })
    })
  }
}

function parseResponse(error, json) {
  if (error) {
    return { error }
  }

  try {
    const response = JSON.parse(json)

    if (response.error) {
      return { error: new Error(response.error) }
    }

    return { data: response }
  } catch (error) {
    return { error }
  }
}
