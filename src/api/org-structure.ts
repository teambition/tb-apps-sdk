import { AppSDK } from '../sdk/AppSDK'
import { APIBase, factory, IFactory } from './base'

export interface OrgStructureAPI {
  start(...params: any[]): Promise<void>
  essage(type: 'error' | 'info' | 'open' | 'success' | 'warning', ...params: any[]): Promise<void>
  finish(...params: any[]): Promise<void>
  openChatWindow(...params: any[]): Promise<void>
  navigate(...params: any[]): Promise<void>
  openDetail(type: 'task' | 'event' | 'work' | 'post' | 'entry' | 'collection', ...params: any[]): Promise<void>
  openTeamStructure(...params: any[]): Promise<void>
  openTeamDetail(...params: any[]): Promise<void>
  openAddGroup(...params: any[]): Promise<void>
  openAddMember(...params: any[]): Promise<void>
  openHandoverTasks(...params: any[]): Promise<void>
  openMemberProfileForm(...params: any[]): Promise<void>
  downloadBatchAddMembersExcelTemplate(): Promise<void>
  uploadBatchAddMembersExcelTemplate(): Promise<void>
  downloadBatchUpdateMembersExcelTemplate(...params: any[]): Promise<void>
  uploadBatchUpdateMembersExcelTemplate(): Promise<void>
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

  openTeamDetail(...params: any[]) {
    return this.call('openTeamDetail', ...params)
  }

  openTeamStructure(...params: any[]) {
    return this.call('openTeamStructure', ...params)
  }

  openAddGroup(...params: any[]) {
    return this.call('openAddGroup', ...params)
  }

  openAddMember(...params: any[]) {
    return this.call('openAddMember', ...params)
  }

  openMemberProfileForm(...params: any[]) {
    return this.call('openMemberProfileForm', ...params)
  }

  downloadBatchAddMembersExcelTemplate() {
    return this.call('downloadBatchAddMembersExcelTemplate')
  }

  uploadBatchAddMembersExcelTemplate() {
    return this.call('uploadBatchAddMembersExcelTemplate')
  }

  downloadBatchUpdateMembersExcelTemplate(...params: any[]) {
    return this.call('downloadBatchUpdateMembersExcelTemplate', ...params)
  }

  uploadBatchUpdateMembersExcelTemplate() {
    return this.call('uploadBatchUpdateMembersExcelTemplate')
  }

  openHandoverTasks(...params: any[]) {
    return this.call('openHandoverTasks', ...params)
  }

  openDetail(...params: any[]) {
    return this.call('openDetail', ...params)
  }

  openChatWindow(...params: any[]) {
    return this.call('openChatWindow', ...params)
  }

  navigate(...params: any[]) {
    return this.call('navigate', ...params)
  }

}

export const hostAPI: IFactory<OrgStructureAPI> = (sdk: AppSDK) => {
  return factory<HostAPI>(sdk, HostAPI)
}
