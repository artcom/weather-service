const fetch = require("node-fetch")

const getData = () => fetch(
  "https://api.openweathermap.org/data/2.5/onecall?lat=50.737&lon=7.098&exclude=hourly,minutely,alerts&appid=063da9fd5923fe721ecfc32788ae8fcf"
).then(response => response.json()).then(data => console.log(data))

module.exports = getData
