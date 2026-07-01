import { authService } from './auth';
import { accountService } from './accounts';
import { transactionService } from './transactions';
import { dashboardService } from './dashboard';
import { budgetApi } from './budgets';
import { plaidApi } from './plaid';

export const api = {
  ...authService,
  ...accountService,
  ...transactionService,
  ...dashboardService,
  ...budgetApi,
  ...plaidApi
};

export { authService } from './auth';
export { accountService } from './accounts';
export { transactionService } from './transactions';
export { dashboardService } from './dashboard';
export { budgetApi } from './budgets';
export { plaidApi } from './plaid';
