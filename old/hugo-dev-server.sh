#!/usr/bin/env bash

REQUIRED_TOOLS=(
  hugo
  npm
)

for TOOL in "${REQUIRED_TOOLS[@]}"; do
  if ! command -v "${TOOL}" >/dev/null; then
    echo "${TOOL} is required... "
    exit 1
  fi
done

# cleanup hugo loggin
npm run clean:hugo

# starting hugo server
hugo server \
  --environment development \
  --disableFastRender \
  --printI18nWarnings \
  --navigateToChanged \
  --templateMetrics \
  --templateMetricsHints \
  --printPathWarnings \
  --cleanDestinationDir \
  --renderToDisk \
  --buildDrafts --buildExpired --buildFuture \
  --watch \
  --forceSyncStatic \
  --logLevel debug \
  --bind 192.168.1.201 \
  --port 1313 \
  --baseURL http://192.168.1.201:1313
