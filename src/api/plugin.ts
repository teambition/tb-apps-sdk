import { AppSDK } from '../sdk/AppSDK'
import { APIBase, factory, IFactory } from './base'

export interface PluginAPI {
  essage(type: 'error' | 'info' | 'open' | 'success' | 'warning', ...params: any[]): Promise<void>
  refresh(): Promise<void>
  close(): Promise<void>
}

class HostAPI extends APIBase {
  essage(...params: any[]) {
    return this.call('essage', ...params)
  }

  refresh() {
    return this.call('refresh')
  }

  close() {
    return this.call('close')
  }
}

export const hostAPI: IFactory<PluginAPI> = (sdk: AppSDK) => {
  return factory<HostAPI>(sdk, HostAPI)
}
