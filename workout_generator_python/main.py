import sentry_sdk

sentry_sdk.init(
    dsn="https://d86e72394ab3886fccdeb4ec8631e6c7@o4511979386044416.ingest.us.sentry.io/4511979386306560",
    traces_sample_rate=0.1,
)

import sys
import os

# Ensure src is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.generator import main

if __name__ == "__main__":
    main()
