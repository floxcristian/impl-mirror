import { environment } from '@env/environment';

export class DefaultBranch {
  static getBranchCode(branchCode?: string): string {
    return branchCode ? branchCode : environment.defaultBranch.code;
  }
}
