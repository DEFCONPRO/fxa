import {
  apiFetchProfile,
  apiFetchPlans,
  apiFetchSubscriptions,
  apiFetchToken,
  apiFetchCustomer,
  apiFetchPlanEligibility,
  apiUpdateSubscriptionPlan,
  apiCancelSubscription,
  apiReactivateSubscription,
  apiSubsequentInvoicePreview,
} from '../../lib/apiClient';

import { Plan } from '../types';
import { PaymentProvider } from 'fxa-payments-server/src/lib/PaymentProvider';

export default {
  fetchProfile: () =>
    ({ type: 'fetchProfile', payload: apiFetchProfile() } as const),
  fetchToken: () => ({ type: 'fetchToken', payload: apiFetchToken() } as const),
  fetchPlans: () => ({ type: 'fetchPlans', payload: apiFetchPlans() } as const),
  fetchSubsequentInvoices: () =>
    ({
      type: 'fetchSubsequentInvoices',
      payload: apiSubsequentInvoicePreview(),
    } as const),
  fetchSubscriptions: () => {
    return {
      type: 'fetchSubscriptions',
      payload: apiFetchSubscriptions(),
    } as const;
  },
  fetchCustomer: () =>
    ({ type: 'fetchCustomer', payload: apiFetchCustomer() } as const),
  fetchSubscriptionChangeEligibilityResult: (plan: Plan) =>
    ({
      type: 'fetchSubscriptionChangeEligibilityResult',
      payload: apiFetchPlanEligibility(plan.plan_id),
    } as const),
  updateSubscriptionPlan: (
    subscriptionId: string,
    currentPlan: Plan,
    newPlan: Plan,
    paymentProvider: PaymentProvider | undefined
  ) =>
    ({
      type: 'updateSubscriptionPlan',
      meta: { subscriptionId, newPlan },
      payload: apiUpdateSubscriptionPlan({
        subscriptionId,
        planId: newPlan.plan_id,
        productId: newPlan.product_id,
        paymentProvider,
        previousPlanId: currentPlan.plan_id,
        previousProductId: currentPlan.product_id,
      }),
    } as const),
  cancelSubscription: (
    subscriptionId: string,
    plan: Plan,
    paymentProvider: PaymentProvider | undefined,
    promotionCode: string | undefined
  ) =>
    ({
      type: 'cancelSubscription',
      meta: { plan },
      payload: async () => {
        const result = await apiCancelSubscription({
          subscriptionId,
          planId: plan.plan_id,
          productId: plan.product_id,
          paymentProvider,
          promotionCode,
        });
        // Cancellation response does not include subscriptionId, but we want it.
        return { ...result, subscriptionId };
      },
    } as const),
  reactivateSubscription: (subscriptionId: string, plan: Plan) =>
    ({
      type: 'reactivateSubscription',
      meta: { plan },
      payload: async () => {
        // Ignore the API result, because it's just `{}` on success.
        await apiReactivateSubscription({
          subscriptionId,
          planId: plan.plan_id,
        });
        return {
          subscriptionId,
          plan,
        };
      },
    } as const),
} as const;
