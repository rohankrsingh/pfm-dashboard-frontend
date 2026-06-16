import { authService } from './auth';
import { accountService } from './accounts';
import { transactionService } from './transactions';
import { dashboardService } from './dashboard';

export const api = {
  ...authService,
  ...accountService,
  ...transactionService,
  ...dashboardService
};

export { authService } from './auth';
export { accountService } from './accounts';
export { transactionService } from './transactions';
export { dashboardService } from './dashboard';
