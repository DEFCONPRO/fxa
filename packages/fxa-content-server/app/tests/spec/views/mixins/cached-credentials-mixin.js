/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Account from 'models/account';
import AuthErrors from 'lib/auth-errors';
import BaseView from 'views/base';
import CachedCredentialsMixin from 'views/mixins/cached-credentials-mixin';
import Cocktail from 'cocktail';
import { Model } from 'backbone';
import Relier from 'models/reliers/base';
import OAuthRelier from 'models/reliers/oauth';
import User from 'models/user';
import sinon from 'sinon';
import VerificationMethods from 'lib/verification-methods';
import GleanMetrics from '../../../../scripts/lib/glean';

describe('views/mixins/cached-credentials-mixin', () => {
  let account;
  let formPrefill;
  let model;
  let relier;
  let user;
  let view;

  class View extends BaseView {
    signIn() {}

    getAccount() {
      return account;
    }
  }

  beforeEach(() => {
    account = new Account({
      email: 'testuser@testuser.com',
      sessionToken: 'session-token',
    });

    sinon.stub(account, 'accountProfile').callsFake(() => Promise.resolve({}));

    Cocktail.mixin(View, CachedCredentialsMixin);

    formPrefill = new Model();
    model = new Model();
    relier = new Relier({ service: 'sync' });
    user = new User();

    view = new View({
      formPrefill,
      model,
      relier,
      user,
    });
  });

  it('has the correct interface', () => {
    assert.lengthOf(Object.keys(CachedCredentialsMixin), 7);
    assert.isArray(CachedCredentialsMixin.dependsOn);
    assert.isFunction(CachedCredentialsMixin.initialize);
    assert.isFunction(CachedCredentialsMixin.getPrefillEmail);
    assert.isFunction(CachedCredentialsMixin.allowSuggestedAccount);
    assert.isFunction(CachedCredentialsMixin.isPasswordNeededForAccount);
    assert.isFunction(CachedCredentialsMixin.useLoggedInAccount);
    assert.isFunction(CachedCredentialsMixin.suggestedAccount);
  });

  describe('isPasswordNeededForAccount', () => {
    it('asks for a password if the account has no sessionToken', () => {
      account.unset('sessionToken');
      sinon.stub(relier, 'wantsKeys').callsFake(() => false);
      sinon.stub(view, 'getPrefillEmail').callsFake(() => '');

      assert.isTrue(view.isPasswordNeededForAccount(account));
    });

    it('asks for password if no email', () => {
      account.unset('email');
      sinon.stub(relier, 'wantsKeys').callsFake(() => false);
      sinon.stub(view, 'getPrefillEmail').callsFake(() => '');

      assert.isTrue(view.isPasswordNeededForAccount(account));
    });

    it('asks for password if the relier wants keys (Sync)', () => {
      sinon.stub(relier, 'wantsKeys').callsFake(() => true);
      sinon
        .stub(view, 'getPrefillEmail')
        .callsFake(() => 'testuser@testuser.com');

      assert.isTrue(view.isPasswordNeededForAccount(account));
    });

    it('asks for the password if the prefill email is different', () => {
      sinon.stub(relier, 'wantsKeys').callsFake(() => false);
      sinon
        .stub(view, 'getPrefillEmail')
        .callsFake(() => 'different@testuser.com');

      assert.isTrue(view.isPasswordNeededForAccount(account));
    });

    it('does not ask for a password if none of the above are met', () => {
      sinon.stub(relier, 'wantsKeys').callsFake(() => false);
      sinon
        .stub(view, 'getPrefillEmail')
        .callsFake(() => 'testuser@testuser.com');

      assert.isFalse(view.isPasswordNeededForAccount(account));
    });

    it('asks for password if the OAuth relier wants login', () => {
      relier = new OAuthRelier();
      user = new User();

      view = new View({
        formPrefill,
        model,
        relier,
        user,
      });

      sinon.stub(relier, 'isOAuth').callsFake(() => true);
      sinon.stub(relier, 'wantsLogin').callsFake(() => true);
      sinon
        .stub(view, 'getPrefillEmail')
        .callsFake(() => 'testuser@testuser.com');

      assert.isTrue(view.isPasswordNeededForAccount(account));
    });
  });

  describe('suggestedAccount', () => {
    it('returns user.chooserAccount if allowed', () => {
      sinon.stub(user, 'getChooserAccount').callsFake(() => account);
      sinon.stub(view, 'allowSuggestedAccount').callsFake(() => true);

      assert.strictEqual(view.suggestedAccount(), account);
      assert.isTrue(user.getChooserAccount.calledOnce);
    });

    it('returns the default account if user.chooserAccount is not allowed', () => {
      sinon.stub(user, 'getChooserAccount').callsFake(() => account);
      sinon.stub(view, 'allowSuggestedAccount').callsFake(() => false);

      const suggestedAccount = view.suggestedAccount();
      assert.notStrictEqual(suggestedAccount, account);
      assert.isTrue(user.getChooserAccount.calledOnce);
    });
  });

  describe('allowSuggestedAccount', () => {
    it('returns false for the default account', () => {
      assert.isFalse(view.allowSuggestedAccount(user.initAccount()));
    });

    it('returns true if no prefill email', () => {
      sinon.stub(view, 'getPrefillEmail').callsFake(() => '');

      assert.isTrue(
        view.allowSuggestedAccount(
          user.initAccount({
            email: 'testuser@testuser.com',
          })
        )
      );
    });

    it('returns false if prefill email is different', () => {
      sinon
        .stub(view, 'getPrefillEmail')
        .callsFake(() => 'prefill@testuser.com');

      assert.isFalse(
        view.allowSuggestedAccount(
          user.initAccount({
            email: 'testuser@testuser.com',
          })
        )
      );
    });

    it('returns true if prefill email is the same', () => {
      sinon
        .stub(view, 'getPrefillEmail')
        .callsFake(() => 'testuser@testuser.com');

      assert.isTrue(
        view.allowSuggestedAccount(
          user.initAccount({
            email: 'testuser@testuser.com',
          })
        )
      );
    });
  });

  describe('useLoggedInAccount', () => {
    let account;
    beforeEach(() => {
      account = user.initAccount({
        email: 'a@a.com',
        sessionToken: 'abc123',
      });
      sinon
        .stub(account, 'accountProfile')
        .callsFake(() => Promise.resolve({}));
      sinon.stub(GleanMetrics.cachedLogin, 'success');
    });

    afterEach(() => {
      GleanMetrics.cachedLogin.success.restore();
    });

    it('delegates to signIn, logs cached.signin.success event', () => {
      sinon.stub(view, 'signIn').callsFake(() => Promise.resolve());
      sinon.stub(view, 'logEvent');

      return view.useLoggedInAccount(account).then(() => {
        assert.equal(view.signIn.callCount, 1);
        const args = view.signIn.args[0];
        assert.lengthOf(args, 3);
        assert.equal(args[0], account);
        assert.isNull(args[1]);
        assert.isObject(args[2]);
        const { onSuccess } = args[2];
        assert.isFunction(onSuccess);
        assert.lengthOf(onSuccess, 0);

        assert.equal(view.logEvent.callCount, 0);
        onSuccess();
        assert.equal(view.logEvent.callCount, 1);
        assert.deepEqual(view.logEvent.args[0], ['cached.signin.success']);
        sinon.assert.calledOnce(GleanMetrics.cachedLogin.success);
      });
    });

    it('shows an error if session is expired', () => {
      sinon.stub(view, 'getAccount').callsFake(() => account);

      sinon
        .stub(view, 'signIn')
        .callsFake(() => Promise.reject(AuthErrors.toError('INVALID_TOKEN')));

      sinon.stub(view, 'render').callsFake(() => Promise.resolve());
      sinon.spy(view, 'displayError');

      return view.useLoggedInAccount(account).then(() => {
        const err = view.model.get('error');
        assert.isTrue(AuthErrors.is(err, 'SESSION_EXPIRED'));
      });
    });

    describe('with TOTP enabled', () => {
      beforeEach(() => {
        account = user.initAccount({
          email: 'a@a.com',
          sessionToken: 'abc123',
        });
        sinon.stub(account, 'accountProfile').callsFake(() =>
          Promise.resolve({
            authenticationMethods: ['pwd', 'email', 'otp'],
          })
        );
        sinon.stub(view, 'signIn').callsFake(() => Promise.resolve());
      });

      it('should set verificationMethod', () => {
        return view.useLoggedInAccount(account).then(() => {
          assert.equal(
            account.get('verificationMethod'),
            VerificationMethods.TOTP_2FA
          );
          assert.equal(view.signIn.callCount, 1);
        });
      });
    });
  });

  it('re-renders when a cached sessionToken expires after render', () => {
    return new Promise((resolve) => {
      sinon.stub(view, 'rerender').callsFake(() => resolve());
      account.unset('sessionToken');
    });
  });
});
