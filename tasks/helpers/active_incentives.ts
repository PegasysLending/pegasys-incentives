import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { eContractid } from "../../helpers/types";
import { PullRewardsIncentivesController } from "../../typechain-types";


task(`active-incentives`, `Make incentives active`)
  .setAction(async( {}, BRE: HardhatRuntimeEnvironment) => {
    await BRE.run('set-DRE');
    
    // Impl address
    const incentivesAddress = '0x41aA26266f9120FAFf40517e45d395141b2B2C0b';
    const distributionSeconds = 86400 // 1 day
    // aTokenAddress and variableDebtTokenAddress is deployed by Lending-Contracts project, stored in deployed-contracts.json.
    // the total emissions[0] for aTokenAddress per seconds
    //           emissions[1] for variableDebtTokenAddress per seconds
    const tokenPairs = [
      {
        // WSYS: '0x65b28cBda2E2Ff082131549C1198DC9a50328186',
        aTokenAddress: '0x56Ef5b22fE07901E5807A85823bCF60c897Ff987',
        variableDebtTokenAddress: '0x5E3BBB63431E365073FB1317c71B3402727Eac85',
        emissions:[1,1],
      },
      {
        // WBTC: '0x386aFa4cED76F3Ddd5D086599030fC21B7Ad9c10',
        aTokenAddress: '0x27FA7f72013013CDDf0eC4C5b6f7c03FdD351FC0',
        variableDebtTokenAddress: '0xccB999cc0b15aD2E730B0b3aB1bfbba7CF6526bF',
        emissions: [1,1],
      },
      {
        // WETH: '0xFE0e902E5F363029870BDc871D27b0C9C46c8b80',
        aTokenAddress: '0xeF28d8e9F1b6764a3F81D4e45f51F22e3122E7c2',
        variableDebtTokenAddress: '0x91e2ED9dc1ad36EF1C4E2506bA900EF6c9D1816A',
        emissions: [1,1],
      },
      {
        // USDT: '0xd270B0EdA02c6fEF5E213Bc99D4255B9eDd22617',
        aTokenAddress: '0xE64d5433f260641Dd75255a80e9e6bC6aADCBD7D',
        variableDebtTokenAddress: '0x0B22245F9Ee420fE228A7B7D611c600a2E1FD62A',
        emissions:[1,1],
      }
    ]

    

    const assets: string[] = [];
    const emissions: number[] = [];
    let tokenCounters = 0;
    for(let i = 0; i < tokenPairs.length; i++) {
      assets[tokenCounters++] = tokenPairs[i].aTokenAddress
      assets[tokenCounters++] = tokenPairs[i].variableDebtTokenAddress
      emissions[i*2] = tokenPairs[i].emissions[0]
      emissions[i*2+1] = tokenPairs[i].emissions[1]
    }
    
    const incentivesController = (await BRE.ethers.getContractAt(eContractid.PullRewardsIncentivesController, incentivesAddress)) as PullRewardsIncentivesController;
    await incentivesController.configureAssets(assets,emissions);

    const distributionEnd = parseInt((new Date().getTime() / 1000).toFixed(0)) + distributionSeconds; 
    console.log('Distribution end in '+distributionEnd.toFixed()+'(90days)');
    await incentivesController.setDistributionEnd(distributionEnd)

  })