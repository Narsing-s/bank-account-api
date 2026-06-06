import { z } from 'zod';
import { BaseService } from '../base-service';
import { ContentType, HttpResponse, SdkConfig } from '../../http/types';
import { RequestBuilder } from '../../http/transport/request-builder';
import { SerializationStyle } from '../../http/serialization/base-serializer';
import { ThrowableError } from '../../http/errors/throwable-error';
import { Environment } from '../../http/environment';
import {
  AccountCreationRequest,
  accountCreationRequestRequest,
} from './models/account-creation-request';
import { AccountCreationParams } from './request-params';
import {
  UpdateAccountDetailesRequest,
  updateAccountDetailesRequestRequest,
} from './models/update-account-detailes-request';

/**
 * Service class for BankAccountApiSdkService operations.
 * Provides methods to interact with BankAccountApiSdkService-related API endpoints.
 * All methods return promises and handle request/response serialization automatically.
 */
export class BankAccountApiSdkService extends BaseService {
  protected accountCreationConfig: Partial<SdkConfig> = {
    environment: Environment.BANK_ACCOUNT_EAPI_JIK9_PB,
  };

  protected accountDetailesConfig: Partial<SdkConfig> = {
    environment: Environment.BANK_ACCOUNT_EAPI_JIK9_PB,
  };

  protected updateAccountDetailesConfig: Partial<SdkConfig> = {
    environment: Environment.BANK_ACCOUNT_EAPI_JIK9_PB,
  };

  protected deleteAccountConfig: Partial<SdkConfig> = {
    environment: Environment.BANK_ACCOUNT_EAPI_JIK9_PB,
  };

  /**
   * Sets method-level configuration for accountCreation.
   * @param config - Partial configuration to override service-level defaults
   * @returns This service instance for method chaining
   */
  setAccountCreationConfig(config: Partial<SdkConfig>): this {
    this.accountCreationConfig = config;
    return this;
  }

  /**
   * Sets method-level configuration for accountDetailes.
   * @param config - Partial configuration to override service-level defaults
   * @returns This service instance for method chaining
   */
  setAccountDetailesConfig(config: Partial<SdkConfig>): this {
    this.accountDetailesConfig = config;
    return this;
  }

  /**
   * Sets method-level configuration for updateAccountDetailes.
   * @param config - Partial configuration to override service-level defaults
   * @returns This service instance for method chaining
   */
  setUpdateAccountDetailesConfig(config: Partial<SdkConfig>): this {
    this.updateAccountDetailesConfig = config;
    return this;
  }

  /**
   * Sets method-level configuration for deleteAccount.
   * @param config - Partial configuration to override service-level defaults
   * @returns This service instance for method chaining
   */
  setDeleteAccountConfig(config: Partial<SdkConfig>): this {
    this.deleteAccountConfig = config;
    return this;
  }

  /**
   *
   * @param {string} [params.adharNumber] -
   * @param {string} [params.bankName] -
   * @param {Partial<SdkConfig>} [requestConfig] - The request configuration for retry and validation.
   * @returns {Promise<HttpResponse<any>>} - OK
   */
  async accountCreation(
    body: AccountCreationRequest,
    params?: AccountCreationParams,
    requestConfig?: Partial<SdkConfig>,
  ): Promise<any> {
    const resolvedConfig = this.getResolvedConfig(this.accountCreationConfig, requestConfig);
    z.object({
      adharNumber: z.string().optional().nullable(),
      bankName: z.string().optional().nullable(),
    }).parse(params ?? {});
    const request = new RequestBuilder()
      .setConfig(resolvedConfig)
      .setBaseUrl(resolvedConfig)
      .setMethod('POST')
      .setPath('/api/accounts')
      .setRequestSchema(accountCreationRequestRequest)
      .setRequestContentType(ContentType.Json)
      .addResponse({
        schema: z.any(),
        contentType: ContentType.Json,
        status: 200,
      })
      .addQueryParam({
        key: 'adharNumber',
        value: params?.adharNumber,
      })
      .addQueryParam({
        key: 'bankName',
        value: params?.bankName,
      })
      .addHeaderParam({ key: 'Content-Type', value: 'application/json' })
      .addBody(body)
      .build();
    return this.client.callDirect<any>(request);
  }

  /**
   *
   * @param {Partial<SdkConfig>} [requestConfig] - The request configuration for retry and validation.
   * @returns {Promise<HttpResponse<any>>} - OK
   */
  async accountDetailes(requestConfig?: Partial<SdkConfig>): Promise<any> {
    const resolvedConfig = this.getResolvedConfig(this.accountDetailesConfig, requestConfig);
    const request = new RequestBuilder()
      .setConfig(resolvedConfig)
      .setBaseUrl(resolvedConfig)
      .setMethod('GET')
      .setPath('/api/accounts/856974574178')
      .setRequestSchema(z.any())
      .setRequestContentType(ContentType.Json)
      .addResponse({
        schema: z.any(),
        contentType: ContentType.Json,
        status: 200,
      })
      .build();
    return this.client.callDirect<any>(request);
  }

  /**
   *
   * @param {Partial<SdkConfig>} [requestConfig] - The request configuration for retry and validation.
   * @returns {Promise<HttpResponse<any>>} - OK
   */
  async updateAccountDetailes(
    body: UpdateAccountDetailesRequest,
    requestConfig?: Partial<SdkConfig>,
  ): Promise<any> {
    const resolvedConfig = this.getResolvedConfig(this.updateAccountDetailesConfig, requestConfig);
    const request = new RequestBuilder()
      .setConfig(resolvedConfig)
      .setBaseUrl(resolvedConfig)
      .setMethod('PATCH')
      .setPath('/api/accounts/856974574178')
      .setRequestSchema(updateAccountDetailesRequestRequest)
      .setRequestContentType(ContentType.Json)
      .addResponse({
        schema: z.any(),
        contentType: ContentType.Json,
        status: 200,
      })
      .addHeaderParam({ key: 'Content-Type', value: 'application/json' })
      .addBody(body)
      .build();
    return this.client.callDirect<any>(request);
  }

  /**
   *
   * @param {Partial<SdkConfig>} [requestConfig] - The request configuration for retry and validation.
   * @returns {Promise<HttpResponse<any>>} - OK
   */
  async deleteAccount(requestConfig?: Partial<SdkConfig>): Promise<any> {
    const resolvedConfig = this.getResolvedConfig(this.deleteAccountConfig, requestConfig);
    const request = new RequestBuilder()
      .setConfig(resolvedConfig)
      .setBaseUrl(resolvedConfig)
      .setMethod('DELETE')
      .setPath('/api/accounts/856974574178')
      .setRequestSchema(z.any())
      .setRequestContentType(ContentType.Json)
      .addResponse({
        schema: z.any(),
        contentType: ContentType.Json,
        status: 200,
      })
      .build();
    return this.client.callDirect<any>(request);
  }
}
