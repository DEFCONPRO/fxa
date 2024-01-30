/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Allow the user to unblock their signin by entering
 * in a verification code that is sent in an email.
 */
import Cocktail from 'cocktail';
import Constants from '../lib/constants';
import FormView from './form';
import GleanMetrics from '../lib/glean';
import Template from 'templates/sign_in_token_code.mustache';
import ResendMixin from './mixins/resend-mixin';
import VerificationReasonMixin from './mixins/verification-reason-mixin';
import SessionVerificationPollMixin from './mixins/session-verification-poll-mixin';

const CODE_INPUT_SELECTOR = '#otp-code';

const proto = FormView.prototype;

const View = FormView.extend({
  className: 'sign-in-token-code',
  template: Template,

  getAccount() {
    return this.getSignedInAccount();
  },

  beforeRender() {
    const account = this.getAccount();

    // user cannot confirm if they have not initiated a sign in.
    if (!account) {
      return this.navigate(this._getAuthPage());
    }
    this.broker.persistVerificationData(account);
    return account.accountProfile().then((profile) => {
      // Check to see if the account has 2FA and redirect to that
      // page to verify
      if (
        profile.authenticationMethods &&
        profile.authenticationMethods.includes('otp')
      ) {
        return this.replaceCurrentPage('/signin_totp_code');
      }
    });
  },

  afterVisible() {
    // waitForSessionVerification handles bounced emails and will redirect
    // the user to the appropriate screen depending on whether the account
    // is deleted. If the account no longer exists, redirects the user to
    // sign up, if the account exists, then notifies them their account
    // has been blocked.
    const account = this.getSignedInAccount();
    return proto.afterVisible
      .call(this)
      .then(() =>
        this.invokeBrokerMethod('beforeSignUpConfirmationPoll', account)
      )
      .then(() => {
        this.waitForSessionVerification(this.getAccount(), () => {
          // don't do anything on verification, that's taken care of in the submit handler.
        });
      });
  },

  logView() {
    GleanMetrics.loginConfirmation.view();
    return proto.logView.call(this);
  },

  setInitialContext(context) {
    const email = this.getAccount().get('email');

    // This needs to point to correct support link
    const supportLink = Constants.BLOCKED_SIGNIN_SUPPORT_URL;

    context.set({
      email,
      escapedSupportLink: encodeURI(supportLink),
      hasSupportLink: !!supportLink,
    });
  },

  submit() {
    GleanMetrics.loginConfirmation.submit();
    const account = this.getAccount();
    const code = this.getElementValue(CODE_INPUT_SELECTOR);
    return this.user
      .verifyAccountSessionCode(account, code)
      .then(() => {
        this.logViewEvent('success');

        // Note: `redirectTo` looks similar to `redirectPathname`, but they
        // work slightly differently: `redirectTo` redirects automatically,
        // while `redirectPathname` redirects after a form submission.
        const redirectTo = this.model.get('redirectTo');
        if (redirectTo) {
          return (this.window.location.href = redirectTo);
        }

        const redirectPathname = this.model.get('redirectPathname');
        if (redirectPathname) {
          return this.navigate(redirectPathname);
        }

        if (this.isForcePasswordChange(account)) {
          return this.invokeBrokerMethod('beforeForcePasswordChange', account);
        }

        return this.invokeBrokerMethod('afterCompleteSignInWithCode', account);
      })
      .catch((err) =>
        this.showValidationError(this.$(CODE_INPUT_SELECTOR), err)
      );
  },

  resend() {
    const account = this.getAccount();
    return account.verifySessionResendCode();
  },

  /**
   * Get the URL of the page for users that
   * must enter their password.
   *
   * @returns {String}
   */
  _getAuthPage() {
    return this.model.get('lastPage') === 'force_auth'
      ? 'force_auth'
      : 'signin';
  },
});

Cocktail.mixin(
  View,
  ResendMixin(),
  SessionVerificationPollMixin,
  VerificationReasonMixin
);

export default View;
