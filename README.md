# Weather Service

A backend service that retrieves weather data for a given location from the [openweathermap API](https://openweathermap.org/api) at a regular interval and publishes it to an MQTT broker.

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

Contains forecasts for 7 days where the first entry is for today, the second for tomorrow and so forth.

```javascript
[
  {
    condition: "wind" | "thunderstorm" | "rain" | "snow" | "cloudy" | "mixed" | "sunny",
    low: number,  # in degrees celsius
    high: number  # in degrees celsius
  }
]
```

## Configuration

The service needs the following environment variables to be set:

* `TCP_BROKER_URI` to access the broker and the `WEATHER_TOPIC` to publish to
* `APP_ID` to authenticate with openweathermap
* `LAT` and `LON` to define the location!

## Local Setup

```bash
npm install

// set all environment variables needed

npm start
```


