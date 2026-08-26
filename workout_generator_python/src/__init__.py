import sentry_sdk

sentry_sdk.init(
    dsn="https://d86e72394ab3886fccdeb4ec8631e6c7@o4511979386044416.ingest.us.sentry.io/4511979386306560",
    traces_sample_rate=0.1,
)

