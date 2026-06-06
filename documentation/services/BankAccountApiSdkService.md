# BankAccountApiSdkService

A list of all methods in the `BankAccountApiSdkService` service. Click on the method name to view detailed information about that method.

| Methods                                         | Description |
| :---------------------------------------------- | :---------- |
| [accountCreation](#accountcreation)             |             |
| [accountDetailes](#accountdetailes)             |             |
| [updateAccountDetailes](#updateaccountdetailes) |             |
| [deleteAccount](#deleteaccount)                 |             |

## accountCreation

- HTTP Method: `POST`
- Endpoint: `/api/accounts`

**Parameters**

| Name        | Type                                                          | Required | Description       |
| :---------- | :------------------------------------------------------------ | :------- | :---------------- |
| body        | [AccountCreationRequest](../models/AccountCreationRequest.md) | ✅       | The request body. |
| adharNumber | string                                                        | ❌       |                   |
| bankName    | string                                                        | ❌       |                   |

**Return Type**

`any`

**Example Usage Code Snippet**

```typescript
import { AccountCreationRequest, BankAccountApiSdk } from 'bank-account-api-sdk';

(async () => {
  const bankAccountApiSdk = new BankAccountApiSdk({});

  const accountCreationRequest: AccountCreationRequest = {
    fullName: 'Anjali boddeda',
    dateOfBirth: '2000-08-06',
    mobileNumber: '9074561230',
    email: 'narsingbeesetti22@gmail.com',
    address: 'Chowduvada, 123/5',
  };

  const data = await bankAccountApiSdk.bankAccountApiSdk.accountCreation(accountCreationRequest, {
    adharNumber: '890874376430',
    bankName: 'SBI',
  });

  console.log(data);
})();
```

## accountDetailes

- HTTP Method: `GET`
- Endpoint: `/api/accounts/856974574178`

**Return Type**

`any`

**Example Usage Code Snippet**

```typescript
import { BankAccountApiSdk } from 'bank-account-api-sdk';

(async () => {
  const bankAccountApiSdk = new BankAccountApiSdk({});

  const data = await bankAccountApiSdk.bankAccountApiSdk.accountDetailes();

  console.log(data);
})();
```

## updateAccountDetailes

- HTTP Method: `PATCH`
- Endpoint: `/api/accounts/856974574178`

**Parameters**

| Name | Type                                                                      | Required | Description       |
| :--- | :------------------------------------------------------------------------ | :------- | :---------------- |
| body | [UpdateAccountDetailesRequest](../models/UpdateAccountDetailesRequest.md) | ✅       | The request body. |

**Return Type**

`any`

**Example Usage Code Snippet**

```typescript
import { BankAccountApiSdk, UpdateAccountDetailesRequest } from 'bank-account-api-sdk';

(async () => {
  const bankAccountApiSdk = new BankAccountApiSdk({});

  const updateAccountDetailesRequest: UpdateAccountDetailesRequest = {
    fullName: 'Narsi Beesetti',
    address: 'CVD',
    mobileNumber: '9856742613',
  };

  const data = await bankAccountApiSdk.bankAccountApiSdk.updateAccountDetailes(
    updateAccountDetailesRequest,
  );

  console.log(data);
})();
```

## deleteAccount

- HTTP Method: `DELETE`
- Endpoint: `/api/accounts/856974574178`

**Return Type**

`any`

**Example Usage Code Snippet**

```typescript
import { BankAccountApiSdk } from 'bank-account-api-sdk';

(async () => {
  const bankAccountApiSdk = new BankAccountApiSdk({});

  const data = await bankAccountApiSdk.bankAccountApiSdk.deleteAccount();

  console.log(data);
})();
```
