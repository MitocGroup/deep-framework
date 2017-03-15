#!/usr/bin/env bash

TEST_SCRIPT="$(dirname $0)/../../../node-bin/test.sh"

[ -f "$TEST_SCRIPT" ] && bash "$TEST_SCRIPT" "$(pwd)" || echo "Skipping tests..."