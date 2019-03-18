export const enum EventType {
  HashChange = 'URL_SYNC/PARENT_HASH_CHANGE',
  PopState = 'URL_SYNC/PARENT_POP_STATE',
  UpdateURL = 'URL_SYNC/IFRAME_URL_UPDATE',
}

interface EventData {
  type: EventType
  newURL: string
}

export interface IframeInitConfig {
  parentOrigin: string
  redirectURL?: string
  listenHash?: boolean
  hashChangeHandler?: (e: {
    type: EventType.HashChange
    newURL: string
  }) => void
  popStateHandler?: (e: {
    type: EventType.PopState
    newURL: string
  }) => void
}

export class URLSync {
  private static instance?: URLSync

  private readonly parentOrigin: string
  private readonly redirectURL?: string
  private readonly listenHash?: boolean
  private readonly hashChangeHandler?: IframeInitConfig['hashChangeHandler']
  private readonly popStateHandler?: IframeInitConfig['popStateHandler']

  private lastRoute = ''

  static IframeInit(config: IframeInitConfig) {
    if (URLSync.instance) {
      return URLSync.instance
    }
    const urlSync = new URLSync(config)
    urlSync.init()
    return urlSync
  }

  constructor(config: IframeInitConfig) {
    if (URLSync.instance) {
      return URLSync.instance
    }

    const { parentOrigin, redirectURL, listenHash, hashChangeHandler, popStateHandler } = config
    this.parentOrigin = parentOrigin
    this.redirectURL = redirectURL
    this.listenHash = listenHash
    this.hashChangeHandler = hashChangeHandler
    this.popStateHandler = popStateHandler

    URLSync.instance = this
  }

  get inIframe() {
    try {
      return window.self !== window.top
    } catch (_e) {
      return false
    }
  }

  private onHashChange = (e: HashChangeEvent) => {
    if (e.newURL === this.lastRoute) {
      return
    }

    window.parent.postMessage({
      type: EventType.UpdateURL,
      newURL: e.newURL,
    }, this.parentOrigin || '*')

    this.lastRoute = e.oldURL
  }

  private onMessage = (e: MessageEvent) => {
    if (this.parentOrigin && e.origin !== this.parentOrigin) {
      return
    }

    if (e.data) {
      switch ((e.data as EventData).type) {
        case EventType.HashChange:
          this.hashChangeHandler && this.hashChangeHandler(e.data)
          break
        case EventType.PopState:
          this.popStateHandler && this.popStateHandler(e.data)
          break
        default:
          break
      }
    }
  }

  init() {
    if (!this.inIframe) {
      this.redirectURL && window.location.replace(this.redirectURL)
      return
    }

    this.updateParentURL()

    this.listenHash && window.addEventListener('hashchange', this.onHashChange)
    window.addEventListener('message', this.onMessage)
  }

  destroy() {
    if (!this.inIframe) {
      return
    }

    this.listenHash && window.removeEventListener('hashchange', this.onHashChange)
    window.removeEventListener('message', this.onMessage)
  }

  updateParentURL() {
    if (!this.inIframe) {
      return
    }

    window.parent.postMessage({
      type: EventType.UpdateURL,
      newURL: window.location.href,
    }, this.parentOrigin || '*')
  }
}
