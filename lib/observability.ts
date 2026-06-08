import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { NodeSDK } from '@opentelemetry/sdk-node'

declare global {
  var rasedUserManagementOtelSdk: NodeSDK | undefined
}

const enabled = process.env.OTEL_SDK_DISABLED !== 'true'
const serviceName = process.env.OTEL_SERVICE_NAME || 'rased-user-management'
const traceExporterUrl =
  process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
  'http://localhost:4318/v1/traces'

export function startUserManagementObservability() {
  if (!enabled || global.rasedUserManagementOtelSdk) {
    return
  }

  if (process.env.OTEL_DIAGNOSTIC_LOG_LEVEL === 'debug') {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG)
  }

  const sdk = new NodeSDK({
    serviceName,
    traceExporter: new OTLPTraceExporter({
      url: traceExporterUrl,
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-dns': {
          enabled: false,
        },
      }),
    ],
  })

  sdk.start()
  global.rasedUserManagementOtelSdk = sdk

  console.info(`[OpenTelemetry] ${serviceName} tracing enabled -> ${traceExporterUrl}`)
}
