/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = {
  OAUTH_SCOPE_OLD_SYNC: 'https://identity.mozilla.com/apps/oldsync',
  OAUTH_SCOPE_SESSION_TOKEN: 'https://identity.mozilla.com/tokens/session',
  OAUTH_SCOPE_NEWSLETTERS: 'https://identity.mozilla.com/accounts/newsletters',
  SHORT_ACCESS_TOKEN_TTL_IN_MS: 1000 * 60 * 60 * 6,
  // Maximum age an account is considered "new", useful when sending
  // notification emails
  MAX_NEW_ACCOUNT_AGE: 1000 * 60 * 60 * 24,
};
