/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('joi');
const validators = require('../../../oauth/validators');
const verifyAssertion = require('../../../oauth/assertion');
const authorizedClients = require('../../../oauth/authorized_clients');
const DESCRIPTION =
  require('../../../../docs/swagger/shared/descriptions').default;
const OAUTH_SERVER_DOCS =
  require('../../../../docs/swagger/oauth-server-api').default;

module.exports = () => ({
  method: 'POST',
  path: '/authorized-clients',
  config: {
    ...OAUTH_SERVER_DOCS.AUTHORIZED_CLIENTS_POST,
    cors: { origin: 'ignore' },
    validate: {
      payload: Joi.object({
        assertion: validators.assertion
          .required()
          .description(DESCRIPTION.assertion),
      }),
    },
    response: {
      schema: Joi.array().items(
        Joi.object({
          client_id: validators.clientId.description(DESCRIPTION.clientId),
          refresh_token_id: validators.token
            .optional()
            .description(DESCRIPTION.refreshTokenId),
          client_name: Joi.string()
            .required()
            .description(DESCRIPTION.clientName),
          created_time: Joi.number()
            .min(0)
            .required()
            .description(DESCRIPTION.createdTime),
          last_access_time: Joi.number()
            .min(0)
            .required()
            .allow(null)
            .description(DESCRIPTION.lastAccessTime),
          scope: Joi.array()
            .items(Joi.string())
            .required()
            .description(DESCRIPTION.scope),
        })
      ),
    },
    handler: async function (req) {
      const claims = await verifyAssertion(req.payload.assertion);
      return await authorizedClients.list(claims.uid);
    },
  },
});
