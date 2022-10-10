/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ExportResult } from '@opentelemetry/core';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPExporterConfigBase } from '@opentelemetry/otlp-exporter-base';
import {
  BasicTracerProvider,
  ReadableSpan,
} from '@opentelemetry/sdk-trace-base';
import { TracingOpts } from '../config';
import { TracingPiiFilter } from '../pii-filters';
import { addExporter } from './exporters';
import { checkDuration } from './util';

/** OTLP exporter customized for FxA */
export class FxaOtlpWebExporter extends OTLPTraceExporter {
  constructor(
    protected readonly filter?: TracingPiiFilter,
    config?: OTLPExporterConfigBase
  ) {
    super(config);
  }

  override export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ) {
    spans.forEach((x) => {
      checkDuration(x);
      this.filter?.filter(x);
    });
    return super.export(spans, resultCallback);
  }
}

export function addOtlpTraceExporter(
  opts: TracingOpts,
  provider: BasicTracerProvider,
  filter?: TracingPiiFilter
) {
  if (!opts.jaeger?.enabled) {
    return;
  }
  const config = {
    url: opts.jaeger?.otlpUrl,
    concurrencyLimit: opts.jaeger?.concurrencyLimit,
  };
  const exporter = new FxaOtlpWebExporter(filter, config);
  addExporter(opts, provider, exporter);
  return exporter;
}
