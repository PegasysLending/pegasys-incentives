[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Build pass](https://github.com/aave/incentives-controller/actions/workflows/node.js.yml/badge.svg)](https://github.com/aave/incentives-controller/actions/workflows/node.js.yml)
[![codecov](https://codecov.io/gh/aave/incentives-controller/branch/master/graph/badge.svg?token=DRFNLw506C)](https://codecov.io/gh/aave/incentives-controller)

# Pegasys incentives

## Introduction

This repo contains the code and implementation of the contracts used to activate the liquidity mining program on the main market of the Pegasys protocol.

## Config
Create a .env file in the project root directory and configure the following variables.
- MNEMONIC (Wallet mnemonic)
- PRIVATE_KEY (*option*)

## Deploy
```shell
npm run compile
```

## Unit Test
```shell
npm run test
```