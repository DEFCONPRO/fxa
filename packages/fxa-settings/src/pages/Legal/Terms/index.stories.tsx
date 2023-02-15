/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import LegalTerms from '.';
import { Meta } from '@storybook/react';

export default {
  title: 'pages/Legal/Terms',
  component: LegalTerms,
} as Meta;

export const Basic = () => <LegalTerms />;
