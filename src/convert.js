module.exports = {
  fahrenheitToCelsius(f) {
    return (f - 32) / 1.8
  },

  mphToKmh(mph) {
    return mph * 1.609344
  },

  degreesToCardinal(degrees) {
    const segment = Math.round(degrees / 45)
    return ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"][segment]
  }
}
