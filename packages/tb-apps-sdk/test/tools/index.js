const { hostAPI } = require('./test-api')

const fakeWindow = (config) => ({
  addEventListener: () => void 0,
  removeEventListener: () => void 0,
  setTimeout: () => 1,
  clearTimeout: () => 1,
  ...config
})

const fakeDocument = (config) => ({
  location: {
    origin: '*'
  },
  querySelector: (v) => fakeNode(v),
  ...config
})

const fakeSource = (config, documentConfig) => ({
  postMessage: () => void 0,
  document: fakeDocument(documentConfig),
  ...config
})

const fakeMessage = (config, sourceConfig = {}, documentConfig = {}) => ({
  source: fakeSource(sourceConfig, documentConfig),
  data: {
    ...config
  }
})

const fakeNode = (v) => ({ type: 'fakeNode', selector: v })

exports.fakeMessage = fakeMessage
exports.fakeSource = fakeSource
exports.fakeWindow = fakeWindow
exports.fakeDocument = fakeDocument
exports.fakeNode = fakeNode
exports.testAPI = hostAPI