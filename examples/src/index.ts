import { BankAccountApiSdk } from 'bank-account-api-sdk';

(async () => {
  const bankAccountApiSdk = new BankAccountApiSdk({});

  const data = await bankAccountApiSdk.bankAccountApiSdk.accountDetailes();

  console.log(data);
})();
