function copyHeaders(source, target) {
  for (const [key, value] of source.headers.entries()) {
    try {
      target.setHeader(key, value)
    } catch (e) {
      console.log(e.message)
    }
  }
}

module.exports = copyHeaders
