import { makeSuite, TestEnv } from '../helpers/make-suite';
import { MAX_UINT_AMOUNT, ZERO_ADDRESS } from '../../helpers/constants';

const { expect } = require('chai');

makeSuite('PegasysIncentivesController initialize', (testEnv: TestEnv) => {
  // TODO: useless or not?
  it('Tries to call initialize second time, should be reverted', async () => {
    const { aaveIncentivesController } = testEnv;
    await expect(aaveIncentivesController.initialize()).to.be.reverted;
  });
  it('allowance on aave token should be granted to psm contract for pei', async () => {
    const { aaveIncentivesController, stakedPegasys, aaveToken } = testEnv;
    await expect(
      (await aaveToken.allowance(aaveIncentivesController.address, stakedPegasys.address)).toString()
    ).to.be.equal(MAX_UINT_AMOUNT);
  });
});
