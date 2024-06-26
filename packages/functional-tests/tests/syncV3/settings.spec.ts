/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FirefoxCommand, createCustomEventDetail } from '../../lib/channels';
import {
  expect,
  test,
  PASSWORD,
  NEW_PASSWORD,
  SYNC_EMAIL_PREFIX,
} from '../../lib/fixtures/standard';

test.describe.configure({ mode: 'parallel' });

test.describe('severity-2 #smoke', () => {
  test.use({
    emailOptions: [{ prefix: SYNC_EMAIL_PREFIX, password: NEW_PASSWORD }],
  });
  test.describe('Firefox Desktop Sync v3 settings', () => {
    test.beforeEach(
      async ({
        emails,
        target,
        syncBrowserPages: { login, connectAnotherDevice, page },
      }) => {
        const [email] = emails;
        test.slow();
        await target.authClient.signUp(email, PASSWORD, {
          lang: 'en',
          preVerified: 'true',
        });
        const customEventDetail = createCustomEventDetail(
          FirefoxCommand.LinkAccount,
          {
            ok: true,
          }
        );
        await page.goto(
          `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
        );
        await login.respondToWebChannelMessage(customEventDetail);
        await login.fillOutEmailFirstSignIn(email, PASSWORD);
        await expect(login.signInCodeHeader).toBeVisible();

        await login.checkWebChannelMessage(FirefoxCommand.LinkAccount);
        await login.fillOutSignInCode(email);
        await login.checkWebChannelMessage(FirefoxCommand.Login);
        await expect(connectAnotherDevice.fxaConnected).toBeEnabled();
      }
    );

    test('sign in, change the password', async ({
      target,
      syncBrowserPages: { changePassword, settings, page },
    }) => {
      //Goto settings sync url
      await page.goto(
        `${target.contentServerUrl}/settings?context=fx_desktop_v3&service=sync`
      );

      //Change password
      await settings.password.changeButton.click();
      await changePassword.fillOutChangePassword(PASSWORD, NEW_PASSWORD);

      //Verify success message
      await expect(settings.alertBar).toHaveText('Password updated');
    });

    test('sign in, change the password by browsing directly to settings', async ({
      syncBrowserPages: { login, changePassword, settings },
    }) => {
      //Goto settings non-sync url
      await settings.goto();

      //Change password
      await settings.password.changeButton.click();
      await login.noSuchWebChannelMessage(FirefoxCommand.ChangePassword);
      await changePassword.fillOutChangePassword(PASSWORD, NEW_PASSWORD);

      //Verify success message
      await expect(settings.alertBar).toHaveText('Password updated');
    });
  });

  test.describe('Firefox Desktop Sync v3 settings - delete account', () => {
    test('sign in, delete the account', async ({
      emails,
      target,
      syncBrowserPages: { login, settings, deleteAccount, page },
    }) => {
      const [email] = emails;
      test.slow();
      await target.authClient.signUp(email, PASSWORD, {
        lang: 'en',
        preVerified: 'true',
      });
      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await login.fillOutEmailFirstSignIn(email, PASSWORD);
      await login.fillOutSignInCode(email);

      //Go to setting page
      await page.goto(
        `${target.contentServerUrl}/settings?context=fx_desktop_v3&service=sync`
      );
      //Click Delete account
      await settings.deleteAccountButton.click();
      await deleteAccount.deleteAccount(PASSWORD);

      await expect(
        page.getByText('Account deleted successfully')
      ).toBeVisible();
    });
  });
});
