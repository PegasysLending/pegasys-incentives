import { BigNumber } from 'ethers';
import { IPegasysDistributionManager, PullRewardsIncentivesController, StakedTokenIncentivesController } from '../../../typechain-types';

export type UserStakeInput = {
  underlyingAsset: string;
  stakedByUser: string;
  totalStaked: string;
};

export type UserPositionUpdate = UserStakeInput & {
  user: string;
};
export async function getUserIndex(
  distributionManager:
    | IPegasysDistributionManager
    | StakedTokenIncentivesController
    | PullRewardsIncentivesController,
  user: string,
  asset: string
): Promise<BigNumber> {
  return await distributionManager.getUserAssetData(user, asset);
}
