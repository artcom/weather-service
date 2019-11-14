# Weather Service

A backend service that retrieves weather data for a given location from the [Yahoo! Weather API](https://developer.yahoo.com/weather/) at a regular interval and publishes it to an MQTT broker.

## Provided Data

### `<WEATHER_TOPIC>/current`

```javascript
{
  condition: "wind" | "thunderstorm" | "rain" | "snow" | "cloudy" | "mixed" | "sunny",
  temperature: number,  # in degrees celsius
  humidity: number,     # in percent
  wind: {
    speed: number,      # in km/h
    direction: "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW"
  }
}
```

### `<WEATHER_TOPIC>/forecast`

Contains forecasts for 5 days where the first entry is for today, the second for tomorrow and so forth.

```javascript
[
  {
    condition: "wind" | "thunderstorm" | "rain" | "snow" | "cloudy" | "mixed" | "sunny",
    low: number,  # in degrees celsius
    high: number  # in degrees celsius
  }
]
```

## Authentication

The service needs an OAuth 1.0 client ID and secret to authenticate with the Yahoo! API. These credentials are issued by Yahoo! for registered applications.

## Configuration

The service needs the following environment variables to be set:

* `TCP_BROKER_URI` to access the broker and the `WEATHER_TOPIC` to publish to
* `CLIENT_ID` and `CLIENT_SECRET` to authenticate with Yahoo and the `LOCATION_WOEID` to define the location!

## Local Setup

```bash
npm install

// set all environment variables needed

npm start
```
