import { Environment } from './http/environment';
import { SdkConfig } from './http/types';
import { BankAccountApiSdkService } from './services/bank-account-api-sdk';

export * from './services/bank-account-api-sdk';

export * from './http';
export { Environment } from './http/environment';

export class BankAccountApiSdk {
  public readonly bankAccountApiSdk: BankAccountApiSdkService;

  constructor(public config: SdkConfig) {
    this.bankAccountApiSdk = new BankAccountApiSdkService(this.config);
  }

  set baseUrl(baseUrl: string) {
    this.bankAccountApiSdk.baseUrl = baseUrl;
  }

  set environment(environment: Environment) {
    this.bankAccountApiSdk.baseUrl = environment;
  }

  set timeoutMs(timeoutMs: number) {
    this.bankAccountApiSdk.timeoutMs = timeoutMs;
  }
}

// c029837e0e474b76bc487506e8799df5e3335891efe4fb02bda7a1441840310c
