module.exports = {
  getOrThrow(name) {
    if (name in process.env) {
      return process.env[name]
    }

    throw new Error(`missing environment variable ${name}`)
  }
}
