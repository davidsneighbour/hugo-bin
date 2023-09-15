#!/usr/bin/env bash

# cleanup hugo loggin
npm run clean:hugo

# build project
hugo \
    --gc \
    --environment development \
    --i18n-warnings \
    --templateMetrics \
    --templateMetricsHints \
    --path-warnings \
    --cleanDestinationDir \
    --buildDrafts --buildExpired --buildFuture \
    --enableGitInfo \
    --log=true --logFile hugo.log \
    --verbose \
    --verboseLog \
    --debug \
    --print-mem
