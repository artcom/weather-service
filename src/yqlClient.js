const OAuth = require("oauth")
const querystring = require("querystring")

const YQL_BASE_URL = "https://query.yahooapis.com/v1/yql"

module.exports = class YqlClient {
  constructor(clientId, clientSecret) {
    this.oauth = new OAuth.OAuth(
      "",
      "",
      clientId,
      clientSecret,
      "1.0",
      null,
      "HMAC-SHA1"
    )
  }

  exec(query) {
    const url = `${YQL_BASE_URL}?${querystring.stringify({ q: query, format: "json" })}`

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

    return { data: response.query.results.channel }
  } catch (error) {
    return { error }
  }
}
