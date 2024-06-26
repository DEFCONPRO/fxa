/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';

import { EligibilityContentByOfferingQuery } from '../../../__generated__/graphql';
import {
  EligibilityContentOfferingResult,
  EligibilityContentSubgroupOfferingResult,
  EligibilityContentSubgroupResult,
} from '.';

export const EligibilityContentByOfferingQueryFactory = (
  override?: Partial<EligibilityContentByOfferingQuery>
): EligibilityContentByOfferingQuery => {
  const items = [EligibilityContentOfferingResultFactory()];
  return {
    offeringCollection: {
      items,
    },
    ...override,
  };
};

export const EligibilityContentOfferingResultFactory = (
  override?: Partial<EligibilityContentOfferingResult>
): EligibilityContentOfferingResult => ({
  apiIdentifier: faker.string.sample(),
  stripeProductId: faker.string.sample(),
  defaultPurchase: {
    stripePlanChoices: [faker.string.sample()],
  },
  linkedFrom: {
    subGroupCollection: {
      items: [EligibilityContentSubgroupResultFactory()],
    },
  },
  ...override,
});

export const EligibilityContentSubgroupResultFactory = (
  override?: Partial<EligibilityContentSubgroupResult>
): EligibilityContentSubgroupResult => ({
  groupName: faker.string.sample(),
  offeringCollection: {
    items: [EligibilityContentSubgroupOfferingResultFactory()],
  },
  ...override,
});

export const EligibilityContentSubgroupOfferingResultFactory = (
  override?: Partial<EligibilityContentSubgroupOfferingResult>
): EligibilityContentSubgroupOfferingResult => ({
  apiIdentifier: faker.string.sample(),
  stripeProductId: faker.string.sample(),
  defaultPurchase: {
    stripePlanChoices: [faker.string.sample()],
  },
  ...override,
});
