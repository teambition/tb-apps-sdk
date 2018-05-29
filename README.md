# tb-apps-sdk

Teambition Host Environment API Bridge

## How to build

```js
npm run build
```

## How to publish
```js
npm run publish_sdk
```

## For Plugin

```ts
// in plugin
import { callService } from 'tb-apps-sdk'

callService({ isCI: true, method: 'essage', params: [/* ... */] })
```

## For Other Environment

### 3rd-part

```ts
// in 3rd env (e.g. Dashboard)
import { sdk } from 'sdk'
import { AppSDK } from 'tb-apps-sdk'
import { hostAPI } from 'tb-apps-sdk/api/internal'

const webApp = AppSDK.fork(hostAPI)
webApp.init()

sdk.fetch.getTask().subscribe(task => {
  webApp.openDetail('task', task._id)
})
```

### Platform

```ts
// in host env (e.g. web)
import { RemoteSchema } from 'tb-apps-sdk'
import { InternalAPI } from 'tb-apps-sdk/api/internal'

class PlatformAPI implements RemoteSchema<InternalAPI> {

  openDetail() {
    // ...
  }

}
```

### How to mock

```ts
import { AppSDK } from 'tb-apps-sdk'
import { InternalAPI } from 'tb-apps-sdk/api/internal'
import { factory } from 'tb-apps-sdk/api/base'

class MockAPI implements InternalAPI {

  openDetail(...params: any[]) {
    console.log('Method openDetail was called.', params)
  }

}

const mockAPI = (sdk: AppSDK) => {
  return factory(sdk, MockAPI)
}

const mockEnv = AppSDK.fork(mockAPI)
mockEnv.openDetail()
```

## Interface
##### `Function: callService = (data: IframeMessageType) => void`

##### `Interface: IframeMessageType`

| 属性 | 说明 | 类型 | 默认值 |
| - | - | - | - |
| method | 指定调用的方法 | string | - |
| params | 指定调用的方法的参数 | any | - |
| isCI | 是否是 CI 环境 | boolean | / |
| origin | UNKNOWN | string | - |
| toOrigin | 反向通讯的地址 | string | / |
| onSuccess | 执行成功后的回调 | () => void | / |
| onError | 执行失败后的回调 | ({ error }) => void | / |

##### `Class: AppSDK`

- ```Static Method: AppSDK.fork(service, onPush, timeout)```

| 属性 | 说明 | 类型 | 默认值 |
| - | - | - | - |
| service | 指定装载的宿主 API 配置容器 | (sdk: AppSDK) => any | - |
| onPush | 指定宿主环境主动推送时的回调 | (data: any) => void | - |
| timeout | 指定远端调用最大超时时间 | number | 10000 |


## License
MIT

