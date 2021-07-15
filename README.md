# Weather Service

A backend service that retrieves weather data for a given location from the [openweathermap API](https://openweathermap.org/api) at a regular interval and publishes it to an MQTT broker.

### License

The openweathermap API is licensed under the terms of the [Creative Commons Attribution-ShareAlike 4.0 International licence (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/).

The openweathermap data and database are open and licensed by the [Open Data Commons Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/).

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


<!-- staging WEATHER_TOPIC="services/weather2/bonn" APP_ID="063da9fd5923fe721ecfc32788ae8fcf" LAT="50.737" LON="7.098" npm run start -->