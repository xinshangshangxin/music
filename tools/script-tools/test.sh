#!/usr/bin/env bash

if [ -n "${1}" ];
then
  echo 'mocha --recursive --timeout 10000 --require chai --harmony --bail -g ${1}} test';
  mocha --recursive --timeout 10000 --require chai --harmony --bail -g ${1} test;
else
  echo 'mocha --recursive --timeout 10000 --require chai --harmony --bail test';
  mocha --recursive --timeout 10000 --require chai --harmony --bail test;
fi