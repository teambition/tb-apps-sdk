import { AppSDK } from '../sdk/AppSDK'
import { APIBase, factory, IFactory } from './base'

export interface ReportAppAPI {
  start(...params: any[]): Promise<void>
  essage(type: 'show' | 'error' | 'log' | 'success' | 'warning', ...params: any[]): Promise<void>
  finish(...params: any[]): Promise<void>
}

class HostAPI extends APIBase {

  start(...params: any[]) {
    return this.call('start', ...params)
  }

  essage(...params: any[]) {
    return this.call('essage', ...params)
  }

  finish(...params: any[]) {
    return this.call('finish', ...params)
  }

}

export const hostAPI: IFactory<ReportAppAPI> = (sdk: AppSDK) => {
  return factory<HostAPI>(sdk, HostAPI)
}
