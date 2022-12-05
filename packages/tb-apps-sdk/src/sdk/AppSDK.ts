import { Connector, ConnStatus, Procedures, MessageType, RemoteCall } from '../interface'
import { ProcedureTimeout, CrossOrigin, SourceNotFound, Uninitlized } from '../exception'

export class AppSDK {

  static fork<T, K = any>(
    service: (sdk: AppSDK) => T,
    onPush?: (data: K) => void,
    requestTimeout?: number,
    connectTimeout?: number
  ) {
    const sdk = new AppSDK(onPush, requestTimeout, connectTimeout)
    return service(sdk) as T
  }

  private procedures: Procedures = Object.create(null)
  private requestId = 1000
  private targetId: string
  private initialize: boolean = false
  private targetOrigin: string
  private source: Window | null
  private sameOrigin: boolean = false
  private connection: Promise<void> | undefined
  private connector: Connector & { status: number | null } = Object.create(null)

  private constructor(
    private onPush?: (data: any) => void,
    private requestTimeout: number = 10 * 1000, // 10s
    private connectTimeout: number = 60 * 1000 // 60s
  ) { }

  init() {
    window.addEventListener('message', this.onMessage)
    this.connection = new Promise((resolve, reject) => {
      this.connector.status = window.setTimeout(() => {
        this.connector.status = ConnStatus.Failed
        reject(new Error(SourceNotFound))
      }, this.connectTimeout)

      this.connector.resolve = () => {
        /* istanbul ignore else  */
        if (this.connector.status !== ConnStatus.Success &&
          this.connector.status != undefined
        ) {
          window.clearTimeout(this.connector.status)
          this.connector.status = ConnStatus.Success
        }
        resolve()
      }
    })
  }

  destroy() {
    window.removeEventListener('message', this.onMessage)
  }

  send<T>(req: RemoteCall, isIsolated: boolean): Promise<T> {
    if (!this.connection) {
      return Promise.reject(new Error(Uninitlized))
    }
    if (this.connector.status === ConnStatus.Failed) {
      return Promise.reject(new Error(SourceNotFound))
    }

    if (!this.sameOrigin && isIsolated) {
      return this.connection.then(() => Promise.reject(new Error(CrossOrigin)))
    }
    const connector: Connector = Object.create(null)

    const procedure = this.connection.then(() =>
      new Promise<T>((resolve, reject) => {
        const data = this.serialize(req)
        const timeoutId = window.setTimeout(() => {
          delete this.procedures[data.requestId]
          reject(new Error(ProcedureTimeout))
        }, this.requestTimeout)
        const cancelToken = () => window.clearTimeout(timeoutId)

        connector.reject = (remoteError) => {
          cancelToken()
          reject(remoteError)
        }
        connector.resolve = (remoteResult) => {
          cancelToken()
          resolve(remoteResult)
        }
        this.procedures[data.requestId] = connector
        this.source.postMessage(JSON.parse(JSON.stringify(data)), this.targetOrigin)
      })
    )
    return procedure
  }

  private onMessage = (resp: MessageEvent) => {
    if (resp && resp.data && !resp.data.type) {
      return
    }

    switch (resp.data.type) {

      case MessageType.SYN:
        /* istanbul ignore else  */
        if (!this.initialize) {
          this.targetId = resp.data.targetId
          this.targetOrigin = resp.data.origin
          this.initialize = true
          this.source = this.getSource(resp.source as Window)
          this.sameOrigin = resp.data.origin === document.location.origin
          this.connector.resolve()
        }
        this.ack()
        return

      case MessageType.PSH:
        /* istanbul ignore else  */
        if (typeof this.onPush === 'function' && typeof resp.data.payload != 'undefined') {
          this.onPush(resp.data.payload)
        }
        return

      case MessageType.MSG:
        /* istanbul ignore else  */
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
              // 兼容 shadow dom
              if (node.shadowRoot) {
                handler(node.shadowRoot)
              } else {
                handler(node)
              }
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

  private getSource(source) {
    // 钉钉环境会改变 window，导致 source.postMessage 无法发送成功，此时使用 window.parent
    // 钉钉环境改变 window, 无法使用 source.navigator.userAgent 验证
    if (window && window.navigator && /DingTalk/.test(window.navigator.userAgent)) {
      return window.parent
    }
    return source
  }
}
