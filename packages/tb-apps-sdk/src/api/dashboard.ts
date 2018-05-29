import { AppSDK } from '../sdk/AppSDK'
import { APIBase, factory, IFactory } from './base'

export interface DashboardAPI {
  registerHostNode(): Promise<HTMLElement>
  essage(type: 'show' | 'error' | 'log' | 'success' | 'warning', ...params: any[]): Promise<void>
  openDetail(type: 'task' | 'date' | 'file' | 'post' | 'bookkeeping', ...params: any[]): Promise<void>
  openDashboardModal(...params: any[]): Promise<void>
  closeFloat(): Promise<void>
  transferStyleNode(...params: any[]): Promise<void>
}

class HostAPI extends APIBase {

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

  openDashboardModal(...params: any[]) {
    return this.call('openDashboardModal', ...params)
  }

  closeFloat(...params: any[]) {
    return this.call('closeFloat', ...params)
  }

}

export const hostAPI: IFactory<DashboardAPI> = (sdk: AppSDK) => {
  return factory<HostAPI>(sdk, HostAPI)
}
