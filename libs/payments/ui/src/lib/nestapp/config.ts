/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';

import { MySQLConfig } from '@fxa/shared/db/mysql/core';
import { GeoDBConfig, GeoDBManagerConfig } from '@fxa/shared/geodb';

export class RootConfig {
  @Type(() => MySQLConfig)
  @ValidateNested()
  @IsDefined()
  public readonly mysqlConfig!: Partial<MySQLConfig>;

  @Type(() => GeoDBConfig)
  @ValidateNested()
  @IsDefined()
  public readonly geodbConfig!: Partial<GeoDBConfig>;

  @Type(() => GeoDBManagerConfig)
  @ValidateNested()
  public readonly geodbManagerConfig!: Partial<GeoDBManagerConfig>;
}
