# BankAccountApiSdk TypeScript SDK 1.1.0

Welcome to the BankAccountApiSdk SDK documentation. This guide will help you get started with integrating and using the BankAccountApiSdk SDK in your project.

## Versions

- SDK version: `1.1.0`

## Table of Contents

- [Setup & Configuration](#setup--configuration)
  - [Supported Language Versions](#supported-language-versions)
  - [Installation](#installation)
- [Setting a Custom Timeout](#setting-a-custom-timeout)
- [Sample Usage](#sample-usage)
- [Services](#services)
- [Models](#models)

# Setup & Configuration

## Supported Language Versions

This SDK is compatible with the following versions: `TypeScript >= 4.8.4`

## Installation

To get started with the SDK, we recommend installing using `npm` or `yarn`:

```bash
npm install bank-account-api-sdk
```

or

```bash
yarn add bank-account-api-sdk
```

## Setting a Custom Timeout

You can set a custom timeout for the SDK's HTTP requests as follows:

```ts
const bankAccountApiSdk = new BankAccountApiSdk({ timeout: 10000 });
```

# Sample Usage

Below is a comprehensive example demonstrating how to authenticate and call a simple endpoint:

```ts
import { BankAccountApiSdk } from 'bank-account-api-sdk';

(async () => {
  const bankAccountApiSdk = new BankAccountApiSdk({});

  const data = await bankAccountApiSdk.bankAccountApiSdk.accountDetailes();

  console.log(data);
})();
```

## Services

The SDK provides various services to interact with the API.

<details>
<summary>Below is a list of all available services with links to their detailed documentation:</summary>

| Name                                                                           |
| :----------------------------------------------------------------------------- |
| [BankAccountApiSdkService](documentation/services/BankAccountApiSdkService.md) |

</details>

## Models

The SDK includes several models that represent the data structures used in API requests and responses. These models help in organizing and managing the data efficiently.

<details>
<summary>Below is a list of all available models with links to their detailed documentation:</summary>

| Name                                                                                 | Description |
| :----------------------------------------------------------------------------------- | :---------- |
| [AccountCreationRequest](documentation/models/AccountCreationRequest.md)             |             |
| [UpdateAccountDetailesRequest](documentation/models/UpdateAccountDetailesRequest.md) |             |

</details>
