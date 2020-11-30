import { AppSDK } from '../sdk/AppSDK'
import { APIBase, factory, IFactory } from './base'

export interface AppTabAPI {
  essage(type: 'error' | 'info' | 'open' | 'success' | 'warning', ...params: any[]): Promise<void>
  openDetail(type: 'task' | 'date' | 'file' | 'post' | 'bookkeeping', ...params: any[]): Promise<void>
  toggleLift(opened: boolean, ...params: any[]): Promise<void>
  preference(): Promise<{ locale: string }>
}

class HostAPI extends APIBase {

  essage(...params: any[]) {
    return this.call('essage', ...params)
  }

  openDetail(...params: any[]) {
    return this.call('openDetail', ...params)
  }

  toggleLift(...params: any[]) {
    return this.call('toggleLift', ...params)
  }

  preference(...params: any[]) {
    return this.call<{ locale: string }>('preference', ...params)
  }

}

export const hostAPI: IFactory<AppTabAPI> = (sdk: AppSDK) => {
  return factory<HostAPI>(sdk, HostAPI)
}
