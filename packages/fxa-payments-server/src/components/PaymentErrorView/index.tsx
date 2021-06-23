import React from 'react';
import { useHistory } from 'react-router-dom';
import { Localized } from '@fluent/react';
import { StripeError } from '@stripe/stripe-js';

import { getErrorMessage, GeneralError } from '../../lib/errors';
import errorIcon from '../../images/error.svg';
import SubscriptionTitle from '../SubscriptionTitle';
import TermsAndPrivacy from '../TermsAndPrivacy';

import './index.scss';
import { Plan } from '../../store/types';

export type PaymentErrorViewProps = {
  onRetry: Function;
  plan: Plan;
  error?: StripeError | GeneralError;
  className?: string;
  subscriptionTitle?: React.ReactElement<SubscriptionTitle>;
};

const retryButtonFn = (onRetry: PaymentErrorViewProps['onRetry']) => (
  <Localized id="payment-error-retry-button">
    <button
      data-testid="retry-link"
      className="button retry-link"
      onClick={() => onRetry()}
    >
      Try again
    </button>
  </Localized>
);

const manageSubButtonFn = (onClick: VoidFunction) => {
  return (
    <Localized id="payment-error-manage-subscription-button">
      <button
        data-testid="manage-subscription-link"
        className="button"
        onClick={onClick}
      >
        Manage my subscription
      </button>
    </Localized>
  );
};

export const PaymentErrorView = ({
  onRetry,
  plan,
  error,
  className = '',
  subscriptionTitle,
}: PaymentErrorViewProps) => {
  const history = useHistory();

  // We want the button label and onClick handler to be different depending
  // on the type of error
  const ActionButton = () => {
    switch (error?.code) {
      case 'no_subscription_change':
        return manageSubButtonFn(() => history.push('/subscriptions'));
      default:
        return retryButtonFn(onRetry);
    }
  };

  const title = subscriptionTitle ?? (
    <SubscriptionTitle screenType="error" className={className} />
  );

  return error ? (
    <>
      {title}
      <section
        className={`container card payment-error ${className}`}
        data-testid="payment-error"
      >
        <div className="wrapper">
          <img id="error-icon" src={errorIcon} alt="error icon" />
          <div>
            <Localized id={getErrorMessage(error)}>
              <p data-testid="error-payment-submission">
                {getErrorMessage(error)}
              </p>
            </Localized>
          </div>
        </div>

        <div className="footer" data-testid="footer">
          <ActionButton />
          <TermsAndPrivacy plan={plan} />
        </div>
      </section>
    </>
  ) : null;
};

export default PaymentErrorView;
