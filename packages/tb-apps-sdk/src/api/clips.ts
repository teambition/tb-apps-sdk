import { AppSDK } from '../sdk/AppSDK'
import { APIBase, factory, IFactory } from './base'

export interface ClipsAPI {
  essage(type: 'error' | 'info' | 'open' | 'success' | 'warning', ...params: any[]): Promise<void>
  copyText(text: string): Promise<void>
}

class HostAPI extends APIBase {

  essage(...params: any[]) {
    return this.call('essage', ...params)
  }

  copyText(text: string) {
    return this.call('copyText', text)
  }

}

export const hostAPI: IFactory<ClipsAPI> = (sdk: AppSDK) => {
  return factory<ClipsAPI>(sdk, HostAPI)
}
