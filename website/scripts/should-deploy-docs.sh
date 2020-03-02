#!/bin/bash

set -e

local NODE_OUPUT=$(node ./scripts/should-deploy-docs.js)

echo "$NODE_OUPUT"

# match anything except newline, source: https://stackoverflow.com/a/12619967
local get_value_regex='SHOULD_DEPLOY_DOCS=([^\
]*)'

if [[ $NODE_OUPUT =~ $get_value_regex ]]; then
  export SHOULD_DEPLOY_DOCS="${BASH_REMATCH[1]}"

  if [[ $SHOULD_DEPLOY_DOCS != 'true' ]]; then
    echo 'Exiting early, docs deploy is skipped...'
    travis_terminate 0
  else
    echo 'Proceeding to deploy docs...'
  fi
fi
