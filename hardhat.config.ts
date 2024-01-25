import { HardhatUserConfig } from "hardhat/config";
import { accounts } from "./test-wallets";
import path from 'path';
import fs from 'fs';
import "@nomicfoundation/hardhat-toolbox";

require('dotenv').config();

const SKIP_LOAD = process.env.SKIP_LOAD === 'true';
const HARDFORK = 'istanbul';
const MNEMONIC = process.env.MNEMONIC || '';
const MNEMONIC_PATH = "m/44'/60'/0'/0";
const MAINNET_FORK = process.env.MAINNET_FORK === 'true';
const PRIVATE_KEY = process.env.PRIVATE_KEY as string;

if (!SKIP_LOAD) {
  ['misc', /*'payloads',*/ 'migrations', 'helpers', 'deployment'].forEach((folder) => {
    const tasksPath = path.join(__dirname, 'tasks', folder);
    fs.readdirSync(tasksPath)
      .filter((pth) => pth.includes('.ts'))
      .forEach((task) => {
        require(`${tasksPath}/${task}`);
      });
  });
}
require(`${path.join(__dirname, 'tasks/misc')}/set-DRE.ts`);

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      {
        version: "0.8.17",
      },
      {
        version: '0.7.5',
        settings: {
          optimizer: { enabled: true, runs: 200 },
          evmVersion: 'istanbul',
        },
      },
      {
        version: '0.6.10',
        settings: {
          optimizer: { enabled: true, runs: 200 },
          evmVersion: 'istanbul',
        },
      },
      {
        version: '0.6.12',
        settings: {
          optimizer: { enabled: true, runs: 200 },
          evmVersion: 'istanbul',
        },
      },
    ]
  },
  networks: {
    hardhat: {
      hardfork: 'istanbul',
      accounts: accounts.map(({ secretKey, balance }: { secretKey: string; balance: string }) => ({
        privateKey: secretKey,
        balance,
      })),
    },
    main: {
      url: 'https://rpc-tanenbaum.rollux.com',
      hardfork: HARDFORK,
      chainId: 57000,
      accounts: MNEMONIC ? {
        mnemonic: MNEMONIC,
        path: MNEMONIC_PATH,
        initialIndex: 0,
        count: 20,
      } : [PRIVATE_KEY],
    },
  }
};

export default config;
