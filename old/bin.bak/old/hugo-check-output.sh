#!/usr/bin/env bash

hugo --path-warnings
grep --color --only-matching --recursive --ignore-case --extended-regexp "<\!-- raw HTML omitted -->|ZgotmplZ|hahahugo" public
