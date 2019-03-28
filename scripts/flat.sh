#!/usr/bin/env bash

truffle-flattener contracts/MBMTimelock.sol > dist/MBMTimelock.dist.sol
truffle-flattener contracts/MBMLockBuilder.sol > dist/MBMLockBuilder.dist.sol
