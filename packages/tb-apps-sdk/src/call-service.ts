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

  constructor(
    private origin: string = '*'
  ) { }

  task() {
    window.parent.postMessage({ type: Subscriber.Task }, this.origin)
  }
}

export const subscriber = new Subscriber()
