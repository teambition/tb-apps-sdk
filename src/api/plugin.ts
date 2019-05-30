import { AppSDK } from '../sdk/AppSDK'
import { APIBase, factory, IFactory } from './base'

const bridge: TeambitionMobileSDK | void = window.TeambitionMobileSDK

export interface PluginAPI {
  /**
   * 显示 Toast 消息
   */
  essage(type: PluginAPIEssageType, config: PluginAPIEssageConfig): Promise<void>

  /**
   * 重新拉取插件数据
   */
  refresh(): Promise<void>

  /**
   * 关闭 iframe 弹窗
   */
  close(): Promise<void>
}

class HostAPI extends APIBase implements PluginAPI {
  essage(type: PluginAPIEssageType, config: PluginAPIEssageConfig) {
    bridge && bridge.call('showToast', { type, ...config })
    return this.call('essage', type, config)
  }

  refresh() {
    bridge && bridge.call('forwardAction', { action: 'refreshPlugin' })
    return this.call('refresh')
  }

  close() {
    bridge && bridge.call('exit')
    return this.call('close')
  }
}

export type PluginAPIEssageType = 'success' | 'error' | 'info' | 'warning'

export interface PluginAPIEssageConfig {
  message: string
  description?: string
}

export const hostAPI: IFactory<PluginAPI> = (sdk: AppSDK) => {
  return factory<HostAPI>(sdk, HostAPI)
}

declare global {
  interface TeambitionMobileSDK {
    call(
      method: 'showToast',
      params: {
        type: 'success' | 'error' | 'info' | 'warning'
        message: string
        description?: string
      },
    ): void
    call(method: 'exit'): void
    call(method: 'forwardAction', params: { action: 'refreshPlugin' }): void
  }

  interface Window {
    TeambitionMobileSDK?: TeambitionMobileSDK
  }
}
