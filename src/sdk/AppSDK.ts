import { ProcedureConnector, Procedures, MessageType, RemoteCall } from '../interface'
import { ProcedureTimeout, CrossOrigin, SourceNotFound } from '../exception'

export class AppSDK {

  static fork<T>(
    service: (sdk: AppSDK) => T,
    onPush?: (data: any) => void,
    timeout = 10 * 1000
  ) {
    const sdk = new AppSDK(onPush, timeout)
    return service(sdk) as T
  }

  private procedures: Procedures = Object.create(null)
  private requestId = 1000
  private targetId: string
  private initialize: boolean = false
  private targetOrigin: string
  private source: Window | null
  private sameOrigin: boolean = false

  private constructor(
    private onPush?: (data: any) => void,
    private timeout: number = 10 * 1000
  ) { }

  init() {
    window.addEventListener('message', this.onMessage)
  }

  destroy() {
    window.removeEventListener('message', this.onMessage)
  }

  send<T>(req: RemoteCall, isIsolated: boolean = false): Promise<T> {
    if (this.source) {
      const data = this.serialize(req)
      if (!this.sameOrigin && isIsolated) {
        return Promise.reject(new Error(CrossOrigin))
      }
      const connector: ProcedureConnector = Object.create(null)

      const procedure = new Promise<T>((resolve, reject) => {
        const timeoutId = window.setTimeout(() => {
          delete this.procedures[data.requestId]
          reject(new Error(ProcedureTimeout))
        }, this.timeout)
        const cancelToken = () => window.clearTimeout(timeoutId)

        connector.reject = (remoteError) => {
          cancelToken()
          reject(remoteError)
        }
        connector.resolve = (remoteResult) => {
          cancelToken()
          resolve(remoteResult)
        }
      })

      this.procedures[data.requestId] = connector
      this.source.postMessage(JSON.parse(JSON.stringify(data)), this.targetOrigin)
      return procedure
    }

    return Promise.reject(new Error(SourceNotFound))
  }

  private onMessage = (resp: MessageEvent) => {
    if (resp && resp.data && !resp.data.type) {
      return
    }

    switch (resp.data.type) {

      case MessageType.SYN:
        if (!this.initialize) {
          this.targetId = resp.data.targetId
          this.targetOrigin = resp.data.origin
          this.initialize = true
          this.source = resp.source
          this.sameOrigin = resp.data.origin === document.location.origin
        }
        this.ack()
        return

      case MessageType.PSH:
        if (typeof this.onPush === 'function') {
          this.onPush(resp.data)
        }
        return

      case MessageType.MSG:
        if (resp.data.responseId) {
          const connector = this.procedures[resp.data.responseId]
          if (!connector) {
            return
          }

          delete this.procedures[resp.data.responseId]
          const handler = resp.data.isError ? connector.reject : connector.resolve
          if (resp.data.hasNode && !resp.data.isError) {
            const hostNodeSelector = resp.data.payload
            if (this.sameOrigin) {
              const node = this.source.document.querySelector(hostNodeSelector)
              handler(node)
            } else {
              connector.reject(new Error(CrossOrigin))
            }
          } else {
            handler(
              resp.data.isError
                ? new Error(resp.data.payload)
                : resp.data.payload
            )
          }
        }
        return
    }

  }

  private serialize(payload?: any) {
    return {
      targetId: this.targetId,
      requestId: ++this.requestId,
      payload
    }
  }

  private ack() {
    this.source.postMessage(
      { ...this.serialize(), requestType: MessageType.ACK },
      this.targetOrigin
    )
  }

}
