import { formatEther, parseEther } from 'ethers/lib/utils';
import { task } from 'hardhat/config';
import { advanceBlockTo, DRE, increaseTime, latestBlock } from '../../helpers/misc-utils';
import { getDefenderRelaySigner } from '../../helpers/defender-utils';
import { Signer } from '@ethersproject/abstract-signer';
import { logError } from '../../helpers/tenderly-utils';
import { IPegasysGovernanceV2, IERC20__factory, IGovernancePowerDelegationToken__factory } from '../../typechain-types';

const {
  AAVE_TOKEN = '0x9C716BA14d87c53041bB7fF95C977d5a382E71F7',
  AAVE_GOVERNANCE_V2 = '0x3515F2b1Cc5E13a0A8AE89BF5B313D442B36aA66', // mainnet
  AAVE_SHORT_EXECUTOR = '0x3162c8729602EF828C3608459bF178FaA93B0d0e', // mainnet
} = process.env;
const VOTING_DURATION = 19200;

const AAVE_WHALE = '0x25f2226b597e8f9514b3f68f00f494cf4f286491';

task('incentives-submit-proposal:tenderly', 'Submit the incentives proposal to Pegasys Governance')
  .addParam('proposalExecutionPayload')
  .addParam('aTokens')
  .addParam('variableDebtTokens')
  .addFlag('defender')
  .setAction(
    async ({ defender, proposalExecutionPayload, aTokens, variableDebtTokens }, localBRE) => {
      await localBRE.run('set-DRE');
      let proposer: Signer;
      [proposer] = await DRE.ethers.getSigners();

      const { signer } = await getDefenderRelaySigner();
      proposer = signer;

      const whale = DRE.ethers.provider.getSigner(AAVE_WHALE);
      const aave = IERC20__factory.connect(AAVE_TOKEN, whale);

      // Transfer enough AAVE to proposer
      await (await aave.transfer(await proposer.getAddress(), parseEther('2000000'))).wait();

      if (!AAVE_TOKEN || !AAVE_GOVERNANCE_V2 || !AAVE_SHORT_EXECUTOR) {
        throw new Error(
          'You have not set correctly the .env file, make sure to read the README.md'
        );
      }

      if (aTokens.split(',').length !== 6) {
        throw new Error('aTokens input param should have 6 elements');
      }

      if (variableDebtTokens.split(',').length !== 6) {
        throw new Error('variable debt token param should have 6 elements');
      }

      const proposerAddress = await proposer.getAddress();

      // Initialize contracts and tokens
      const gov = (await DRE.ethers.getContractAt(
        'IPegasysGovernanceV2',
        AAVE_GOVERNANCE_V2,
        proposer
      )) as IPegasysGovernanceV2;

      // Balance and proposal power check
      const balance = await aave.balanceOf(proposerAddress);
      const priorBlock = ((await latestBlock()) - 1).toString();
      const aaveGovToken = IGovernancePowerDelegationToken__factory.connect(AAVE_TOKEN, proposer);
      const propositionPower = await aaveGovToken.getPowerAtBlock(proposerAddress, priorBlock, '1');

      console.log('- AAVE Balance proposer', formatEther(balance));
      console.log(
        `- Proposition power of ${proposerAddress} at block: ${priorBlock}`,
        formatEther(propositionPower)
      );

      // Submit proposal
      const proposalId = await gov.getProposalsCount();
      const proposalParams = {
        proposalExecutionPayload,
        aTokens,
        variableDebtTokens,
        aaveGovernance: AAVE_GOVERNANCE_V2,
        shortExecutor: AAVE_SHORT_EXECUTOR,
        defender: true,
      };
      console.log('- Submitting proposal with following params:');
      console.log(JSON.stringify(proposalParams, null, 2));

      await DRE.run('propose-incentives', proposalParams);
      console.log('- Proposal Submited:', proposalId.toString());

      // Mine block due flash loan voting protection
      await advanceBlockTo((await latestBlock()) + 1);

      // Submit vote and advance block to Queue phase
      try {
        console.log('Submitting vote...');
        await (await gov.submitVote(proposalId, true)).wait();
        console.log('Voted');
      } catch (error) {
        logError();
        throw error;
      }

      await advanceBlockTo((await latestBlock()) + VOTING_DURATION + 1);

      try {
        // Queue and advance block to Execution phase
        console.log('Queueing');
        await (await gov.queue(proposalId, { gasLimit: 3000000 })).wait();
        console.log('Queued');
      } catch (error) {
        logError();
        throw error;
      }
      await increaseTime(86400 + 10);

      // Execute payload

      try {
        console.log('Executing');
        await (await gov.execute(proposalId, { gasLimit: 6000000 })).wait();
      } catch (error) {
        logError();
        throw error;
      }
      console.log('Proposal executed');
    }
  );
