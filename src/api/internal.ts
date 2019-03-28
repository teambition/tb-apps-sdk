import { AppSDK } from '../sdk/AppSDK'
import { APIBase, factory, IFactory } from './base'

export interface InternalAPI {
  registerHostNode(): Promise<HTMLElement>
  essage(type: 'error' | 'info' | 'open' | 'success' | 'warning', ...params: any[]): Promise<void>
  openDetail(type: 'task' | 'date' | 'file' | 'post' | 'bookkeeping', ...params: any[]): Promise<void>
}

class HostAPI extends APIBase {

  isolatedAPI() {
    return ['registerHostNode', 'transferStyleNode']
  }

  registerHostNode(...params: any[]) {
    return this.call('registerHostNode', ...params)
  }

  transferStyleNode(...params: any[]) {
    return this.call('transferStyleNode', ...params)
  }

  essage(...params: any[]) {
    return this.call('essage', ...params)
  }

  openDetail(...params: any[]) {
    return this.call('openDetail', ...params)
  }

}

export const hostAPI: IFactory<InternalAPI> = (sdk: AppSDK) => {
  return factory<InternalAPI>(sdk, HostAPI)
}
