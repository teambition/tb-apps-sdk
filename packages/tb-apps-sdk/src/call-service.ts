const ORIGIN_CI = 'http://project.ci'
const ORIGIN_PROD = 'https://www.teambition.com'

export type IframeMessageType = {
  method: string
  params: any

  isCI?: boolean
  origin: string
  toOrigin?: string

  onSuccess?(): void
  onError?({ error: any }): void
}

export const notify = (args) => callService({ ...args, method: 'essage' })

export const callService = ({
  isCI,
  toOrigin = isCI ? ORIGIN_CI : ORIGIN_PROD,
  ...data
}: IframeMessageType) =>
  window.parent.postMessage(JSON.parse(JSON.stringify(data)), toOrigin)

export const subscribeTask = (origin: string = '*') => {
  window.parent.postMessage({ type: 'subscribe-task' }, origin)
}

export class Subscriber {
  private static Task = 'subscribe-task'
  private refs = Object.create(null)

  constructor(
    private origin: string = '*'
  ) { }

  task(callback?: (data: any) => void): () => void {
    if (this.refs.tasks) {
      throw new Error('Task is subscribed already, Please dispose previous handler.')
    }

    this.refs.tasks = true

    const handler = (evt: MessageEvent) => {
      if (!evt.data || evt.data.type !== 'transfer') {
        return
      }

      if (typeof callback === 'function') {
        callback(evt.data.payload)
      }
    }

    window.addEventListener('message', handler)
    window.parent.postMessage({ type: Subscriber.Task }, this.origin)

    return () => {
      this.refs.tasks = false
      window.removeEventListener('message', handler)
    }
  }
}

export const subscriber = new Subscriber()
