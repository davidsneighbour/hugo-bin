#!/usr/bin/env bash

# see https://www.netlify.com/blog/2016/10/18/how-our-build-bots-build-sites/ for details

REQUIRED_TOOLS=(
  docker
  git
)

for TOOL in "${REQUIRED_TOOLS[@]}"; do
  if ! command -v "${TOOL}" >/dev/null; then
    echo "${TOOL} is required... "
    exit 1
  fi
done

SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 || exit ; pwd -P )"

docker pull netlify/build:xenial ;
git clone https://github.com/netlify/build-image ;
cd build-image || exit ;
./test-tools/start-image.sh "${SCRIPTPATH}";

# then run `build <your build command>` on the image
