const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require("sinon-chai")

const { AppSDK } = require('../lib')
const { SourceNotFound, Uninitlized, CrossOrigin, ProcedureTimeout } = require('../lib/exception')
const { MessageType } = require('../lib/interface')
const tools = require('./tools')

const { expect } = chai

chai.use(sinonChai)

describe('AppSDK', () => {
  
  afterEach(() => {
    global.window = {}
  })

  describe('AppSDK.fork', () => {

    it('should be able to create instance successfully [1]', () => {
      const inst = AppSDK.fork(tools.testAPI)
      expect(inst).to.be.ok
    })

    it('should be able to create instance successfully [2]', () => {
      const inst = AppSDK.fork(tools.testAPI, () => void 0)
      expect(inst).to.be.ok
    })

    it('should be able to create instance successfully [3]', () => {
      const inst = AppSDK.fork(tools.testAPI, () => void 0, 1000)
      expect(inst).to.be.ok
    })

  })

  describe('#init', () => {

    it('should be able to add `message` listener', () => {
      const spy = sinon.spy()
      global.window = tools.fakeWindow({ addEventListener: spy })
      
      const inst = AppSDK.fork(tools.testAPI)
      inst.init()
      expect(spy).have.been.called
    })

    it('should throw error if connect timeout', (done) => {
      global.window = tools.fakeWindow({ 
        setTimeout: (callback) => {
          callback()
          return 1
        }
      })

      const inst = AppSDK.fork(tools.testAPI)
      inst.init()

      process.once('unhandledRejection', (error) => {
        expect(error.message).to.equal(SourceNotFound)
        done()
      })
      
    })

  })

  describe('#onPush', () => {

    let emitter
    let onPushSpy
    let inst

    beforeEach(() => {
      onPushSpy = sinon.spy()
      global.window = tools.fakeWindow({ addEventListener: (method, callback) => emitter = callback })
      global.document = tools.fakeDocument()
      inst = AppSDK.fork(tools.testAPI, onPushSpy)
      inst.init()
    })

    afterEach(() => {
      inst = emitter = onPushSpy = undefined
    })

    it('should ignore if data of message is empty', () => {
      emitter(tools.fakeMessage()) 
      expect(onPushSpy).have.not.been.called
    })

    it('should be able to reply `SYN`', () => {
      const ackSpy = sinon.spy()
      emitter(
        tools.fakeMessage({ 
          type: MessageType.SYN,
          targetId: 1,
          origin: '*'
        }, { postMessage: ackSpy })
      )

      expect(ackSpy).have.been.called
      expect(ackSpy).have.been.calledWith(sinon.match.has('requestType', MessageType.ACK))
      expect(ackSpy).have.been.calledWith(sinon.match.has('targetId', 1))
      expect(ackSpy).have.been.calledWith(sinon.match.has('requestId', 1001))
    })
  
    it('should be able to reply `MSG`', () => {
      try {
        emitter(
          tools.fakeMessage({ 
            type: MessageType.MSG,
            responseId: 2001
          })
        )
      } catch (e) {
        expect(e).is.not.instanceof(Error)
      }
    })

    it('should be able to reply `PSH`', () => {
      emitter(tools.fakeMessage({ type: MessageType.PSH, payload: 1 }))
      expect(onPushSpy).have.been.calledWith(1)
    })

  })

  describe('#send', () => {

    let emitter
    let inst

    beforeEach(() => {
      global.window = tools.fakeWindow({ addEventListener: (method, callback) => emitter = callback })
      global.document = tools.fakeDocument()
      inst = AppSDK.fork(tools.testAPI)
    })

    afterEach(() => {
      inst = emitter = undefined
    })

    it('should throw if send request before init', (done) => {
      inst.test1()

      process.once('unhandledRejection', (error) => {
        expect(error.message).to.equal(Uninitlized)
        done()
      })
    })

    it('should be able to block request before handshake', (done) => {
      inst.init()
      const timestamp = Date.now()

      inst.test1().then(() => {
        expect((Date.now() - timestamp)).is.greaterThan(9)
        done()
      })

      emitter(tools.fakeMessage({ 
        type: MessageType.SYN,
        targetId: 1,
        origin: '*'
      }))

      setTimeout(() => {
        emitter(tools.fakeMessage({ 
          type: MessageType.MSG,
          responseId: 1002
        }))
      }, 10)
    })

    it('should be able to evaluate with returnValue', (done) => {
      inst.init()

      inst.test1().then((value) => {
        expect(value).to.equal(10)
        done()
      })

      emitter(tools.fakeMessage({ 
        type: MessageType.SYN,
        targetId: 1,
        origin: '*'
      }))

      setTimeout(() => {
        emitter(tools.fakeMessage({ 
          type: MessageType.MSG,
          responseId: 1002,
          payload: 10
        }))
      }, 1)
    })

    it('should be able to evaluate with error', (done) => {
      inst.init()

      inst.test1().catch((e) => {
        expect(e.message).to.equal('1')
        done()
      })

      emitter(tools.fakeMessage({ 
        type: MessageType.SYN,
        targetId: 1,
        origin: '*'
      }))

      setTimeout(() => {
        emitter(tools.fakeMessage({ 
          type: MessageType.MSG,
          responseId: 1002,
          isError: true,
          payload: '1'
        }))
      }, 1)
    })

    it('should be able to evaluate with dom', (done) => {
      let newEmitter
      global.window = tools.fakeWindow({ addEventListener: (method, callback) => newEmitter = callback })
      const inst2 = AppSDK.fork(tools.testAPI)
      inst2.init()

      newEmitter(tools.fakeMessage({ 
        type: MessageType.SYN,
        targetId: 1,
        origin: '*'
      }))

      inst2.test1().then(v => {
        expect(v).to.deep.equal({ type: 'fakeNode', selector: '.fakeNode' })
        done()
      })

      setTimeout(() => {
        newEmitter(tools.fakeMessage({ 
          type: MessageType.MSG,
          responseId: 1002,
          hasNode: true,
          payload: '.fakeNode'
        }))
      }, 1)
    })

    it('should throw if try get dom but cross origin', (done) => {
      let newEmitter
      global.window = tools.fakeWindow({ addEventListener: (method, callback) => newEmitter = callback })
      const inst2 = AppSDK.fork(tools.testAPI)
      inst2.init()

      newEmitter(tools.fakeMessage({ 
        type: MessageType.SYN,
        targetId: 1,
        origin: 'abc.com'
      }))

      inst2.test1().catch(e => {
        expect(e.message).to.equal(CrossOrigin)
        done()
      })

      setTimeout(() => {
        newEmitter(tools.fakeMessage({ 
          type: MessageType.MSG,
          responseId: 1002,
          hasNode: true,
          payload: '.fakeNode'
        }))
      }, 1)
    })

    it('should be able to evaluate with shadowDOM', (done) => {
      let newEmitter
      global.window = tools.fakeWindow({ addEventListener: (method, callback) => newEmitter = callback })
      const inst2 = AppSDK.fork(tools.testAPI)
      inst2.init()

      newEmitter(
        tools.fakeMessage(
          { 
            type: MessageType.SYN,
            targetId: 1,
            origin: '*'
          }, 
          {}, 
          { querySelector: (v) => 
              ({ shadowRoot: { type: 'fakeShadowDOM', selector: v } }) 
          }
        )
      )

      inst2.test1().then(v => {
        expect(v).to.deep.equal({ type: 'fakeShadowDOM', selector: '.fakeNode' })
        done()
      })

      setTimeout(() => {
        newEmitter(tools.fakeMessage({ 
          type: MessageType.MSG,
          responseId: 1002,
          hasNode: true,
          payload: '.fakeNode'
        }))
      }, 1)
    })

    it('should throw if try call a isolated api when cross the origin', (done) => {
      let newEmitter
      global.window = tools.fakeWindow({ addEventListener: (method, callback) => newEmitter = callback })
      global.document = tools.fakeDocument()
      const inst2 = AppSDK.fork(tools.testAPI)
      inst2.init()

      newEmitter(tools.fakeMessage({ 
        type: MessageType.SYN,
        targetId: 1,
        origin: 'abc.com'
      }))

      inst2.isolatedMethod()

      process.once('unhandledRejection', (error) => {
        expect(error.message).to.equal(CrossOrigin)
        done()
      })

    })
  
    it('should throw if connect failed', (done) => {
      let newEmitter
      global.window = tools.fakeWindow({ addEventListener: (method, callback) => newEmitter = callback, setTimeout: (cb) => setTimeout(cb, 1) })
      global.document = tools.fakeDocument()
      const inst2 = AppSDK.fork(tools.testAPI)
      inst2.init()

      inst2.test1().catch(e => {
        expect(e.message).to.equal(SourceNotFound)
      })

      setTimeout(() => {
        inst2.test1().catch(e => {
          expect(e.message).to.equal(SourceNotFound)
          done()
        })
      }, 5)

    })

    it('should throw if request timeout', (done) => {
      let newEmitter
      global.window = tools.fakeWindow({ 
        addEventListener: (method, callback) => newEmitter = callback, 
        setTimeout: (cb, delay) => setTimeout(cb, delay),
        clearTimeout: (id) => clearTimeout(id)
      })
      global.document = tools.fakeDocument()
      const inst2 = AppSDK.fork(tools.testAPI, () => void 0, 5)
      inst2.init()

      newEmitter(tools.fakeMessage({ 
        type: MessageType.SYN,
        targetId: 1,
        origin: 'abc.com'
      }))

      let timestamp
      setTimeout(() => {
        inst2.test1()
        timestamp = Date.now()
      }, 5)

      process.once('unhandledRejection', (error) => {
        expect(error.message).to.equal(ProcedureTimeout)
        expect(Date.now() - timestamp).is.greaterThan(4)
        done()
      })

    })

  })

  describe('#destroy', () => {

    it('should be able to remove `message` listener', () => {
      const spy = sinon.spy()
      global.window = tools.fakeWindow({ removeEventListener: spy })
      
      const inst = AppSDK.fork(tools.testAPI)
      inst.init()
      inst.destroy()
      expect(spy).have.been.called
    })

  })


})
