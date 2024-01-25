import {
  deployContract,
  getContractFactory,
  getContract,
  getFirstSigner,
  registerContractInJsonDb,
} from './contracts-helpers';
import { eContractid, tEthereumAddress } from './types';
import {
  MintableErc20,
  SelfdestructTransfer,
  IERC20Detailed,
  ATokenMock,
  StakedTokenIncentivesController__factory,
  PullRewardsIncentivesController__factory,
  InitializableAdminUpgradeabilityProxy__factory,
  StakedTokenIncentivesController
}
from '../typechain-types'
// import { verifyContract } from './etherscan-verification';
import { DefenderRelaySigner } from 'defender-relay-client/lib/ethers';
import { Signer } from 'ethers';

export const deployAaveIncentivesController = async (
  [aavePsm, emissionManager]: [tEthereumAddress, tEthereumAddress],
  verify?: boolean,
  signer?: Signer | DefenderRelaySigner
) => {
  const args: [string, string] = [aavePsm, emissionManager];
  const instance = await new StakedTokenIncentivesController__factory(
    signer || (await getFirstSigner())
  ).deploy(...args);
  await instance.deployTransaction.wait();
  // if (verify) {
  //   await verifyContract(instance.address, args);
  // }
  return instance;
};

export const deployPullRewardsIncentivesController = async (
  [rewardToken, emissionManager]: [tEthereumAddress, tEthereumAddress],
  verify?: boolean,
  signer?: Signer | DefenderRelaySigner
) => {
  const args: [string, string] = [rewardToken, emissionManager];
  const instance = await new PullRewardsIncentivesController__factory(
    signer || (await getFirstSigner())
  ).deploy(...args);
  await instance.deployTransaction.wait();
  // if (verify) {
  //   await verifyContract(instance.address, args);
  // }
  return instance;
};

export const deployInitializableAdminUpgradeabilityProxy = async (verify?: boolean) => {
  const args: string[] = [];
  const instance = await new InitializableAdminUpgradeabilityProxy__factory(
    await getFirstSigner()
  ).deploy();
  await instance.deployTransaction.wait();
  // if (verify) {
  //   await verifyContract(instance.address, args);
  // }
  return instance;
};

export const deployMintableErc20 = async ([name, symbol]: [string, string]) =>
  await deployContract<MintableErc20>(eContractid.MintableErc20, [name, symbol]);

export const deployATokenMock = async (aicAddress: tEthereumAddress, slug: string) => {
  const instance = await deployContract<ATokenMock>(eContractid.ATokenMock, [aicAddress]);
  await registerContractInJsonDb(`${eContractid.ATokenMock}-${slug}`, instance);
};

export const getMintableErc20 = getContractFactory<MintableErc20>(eContractid.MintableErc20);

export const getAaveIncentivesController = getContractFactory<StakedTokenIncentivesController>(
  eContractid.StakedTokenIncentivesController
);

export const getIncentivesController = async (address: tEthereumAddress) =>
  StakedTokenIncentivesController__factory.connect(address, await getFirstSigner());

export const getPullRewardsIncentivesController = async (address: tEthereumAddress) =>
  PullRewardsIncentivesController__factory.connect(address, await getFirstSigner());

export const getIErc20Detailed = getContractFactory<IERC20Detailed>(eContractid.IERC20Detailed);

export const getATokenMock = getContractFactory<ATokenMock>(eContractid.ATokenMock);

export const getERC20Contract = (address: tEthereumAddress) =>
  getContract<MintableErc20>(eContractid.MintableErc20, address);

export const deploySelfDestruct = async () => {
  const id = eContractid.MockSelfDestruct;
  const instance = await deployContract<SelfdestructTransfer>(id, []);
  await instance.deployTransaction.wait();
  return instance;
};
