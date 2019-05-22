import { AppSDK } from '../sdk'

export interface IAPIBase {
  // version: number
  init(): void
  destroy(): void
}

export interface ICtor<T> {
  new(sdk: AppSDK): T
}

export function factory<T>(sdk: AppSDK, ctor: ICtor<T>): T & IAPIBase {
  return new ctor(sdk) as T & IAPIBase
}

export function method(name: string) {
  return function(...params: any[]) {
    return this.call(name, ...params)
  }
}

export class APIBase {

  // version: number = 0

  constructor(private sdk: AppSDK) { }

  init() {
    this.sdk.init()
  }

  destroy() {
    this.sdk.destroy()
  }

  call<T = void>(name: string, ...params: any[]): Promise<T> {
    return this.sdk.send<T>(
      { method: name, params: params || [] /*, version: this.version */ },
      this.isolatedAPI().indexOf(name) > -1
    )
  }

  // 返回 "只有在同域时才允许调用的受限制方法" 方法列表
  isolatedAPI() {
    return []
  }

}

export class MockBase {

  init() {
    return void 0
  }

  destroy() {
    return void 0
  }

  call(...params: any[]): any {
    return Promise.resolve(params)
  }

  isolatedAPI() {
    return []
  }

}

export type IFactory<T> = (sdk: AppSDK) => T & IAPIBase
