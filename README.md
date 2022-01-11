## Wintermute DeFi case study
![Wintermute](wintermute.png)

### Quickstart
Start a ganache local görli fork and install nodejs dependencies.   
```
npm install
source .env
npx ganache-cli \
--fork https://goerli.infura.io/v3/$INFURA_KEY \
--networkId 999
```
### Task 1
#### Smart Contract

The `Wintermute.sol` is the main contract that holds logic for:

- Depositing ETH and ERC20 tokens
- Withdrawing ETH and ERC20 tokens
- Wrapping of ETH to WETH
- Unwrapping of WETH to ETH

You can run the integration test for this via

```shell script
truffle migrate -f 2 --to 2 --network goerlifork 
```

### Task 2
#### Deployment

I deployed the contracts to `görli` test net since I had some görli ETH already.
Here is the contract deployment on etherscan: https://goerli.etherscan.io/address/0x5a240f1e902C90220fAb38476348280E5466c6f0 with the deployment log below. I ran out of time to complete the code verification :( 
You can deploy directly to goerli yourself via the  following command, just add your metamask info to the .env file. 

```shell script
truffle migrate -f 2 --to 2 --network goerli  
```
or deploy and run the tests by changing the above number 2 to 3 or 4.

### Bonus
#### a) Uniswap
I've coded with Uniswap **V2** before so I integrated that with the wintermute contract.

The `migration` scripts illustrate how these components are stitched together and deployed. Essentially they:

`3_wintermute_task1.js` and 
1. Mints, deposits and withdraws ETH into Wintermute contract
2. Mints, deposits and withdraws ERC20 into Wintermute contract
3. Wraps and unwraps ETH

`4_wintermute_task2.js`                                       
1. Deploy above contracts
2. Create pairs with factory.                    
2. Faucet tokens and grant approvals for token movement.          
4. Add liquidity for the token pair via Router.  
5. Perform a swap via swap contract.

After you have configured truffle config with your Goerli Infura or Alchemy URL, you can deploy the smart contracts to Goerli testnet and seed some data via the migration scripts.

```shell script
truffle migrate -f 3 --to 3 --network goerli
``` 
or 
```shell script
truffle migrate -f 4 --to 4 --network goerli
``` 
You can use the `2_deploy_contracts.js` script if you want to deploy contracts individually without transaction/contract calls. Follow the number pattern:
```shell script
truffle migrate -f 2 --to 2 --network goerli
```

The `merger.js` script will flatten and merge the contracts into single solidity files within the `deployment` directory, meaning all dependencies of a core contract are in the same file. 
This seems the best way to verify the code on etherscan although the flattening appears to affect the INIT_CODE_HASH required inside `UniswapV2Library` so I've attempted a multi file upload via `multi-sol` 
The `InitHash.sol` contract calculates this hash and has a corresponding migration script `1_calculate_init_hash.js`.

```shell script
multisol contracts/WintermuteToken1.sol 
multisol contracts/WintermuteToken2.sol
multisol contracts/WETH.sol 
multisol contracts/UniswapV2Factory.sol 
multisol contracts/WintermuteContract.sol 
```

#### b) Other trading platforms

- Writing modular code abstractions e.g proxy contract to act a index or bridge between trading platforms and operating contract.
- More but I am stuck for time under the recommended allowance. I would enjoy speaking about this with you guys!

#### c) Other blockchains

If the blockchain is EVM compatible the process it easier and we can keep the solidity code as is.

- **Solana**: The Neon EVM creates a compatibility layer for Ethereum on the Solana blockchain, allowing you to run Ethereum contracts on Solana.
- **Polygon**: We can deploy contracts via truffle configured hdwallet provider connected to a polygon node. I would be very curious to hear your experience and views when it comes to classic deployment tools like truffle and hardhat.
  
### Notes / Possible work

- Consider security more closely à la https://consensys.github.io/smart-contract-best-practices/
- Implement formal access control layer https://docs.openzeppelin.com/contracts/4.x/access-control
- Consider solidity libraries/frameworks https://docs.openzeppelin.com/contracts/4.x/api/security
- gas estimation and calculation infrastructure or tooling. 
- scripts to parse pairs from existing swaps/lists, parallelization on client-side contract interactions.
- swap gui for above the uses calculation tools. 
- need programmatic assertions and to look more into ABI driven programming
- e2e programmatic integration tests for the client through the server.
- add uniswap exchange to deployment
- rebase into uniswap fork. I just extended them for now wish to migrate to fork.
- local and programmatic etherscan contract verification over UI method used now. 
- composed contract unit tests - bootstrap uniswap factory, router etc in one unit test.
- expand use-case beyond simple swap. I would love to learn more about the wintermute trading infrastructure you mentioned. 
- Overall deployment is fairly straight forward but there are more optimizations possible. It can be pure entertainment scripting, flattening, merging, and generally herding contracts and their dependencies such that they can be stood up and verified correctly on Etherscan. I jumped through the typical hoops you probably see with solidity compiler versioning. I have one buggette related to the deployment of flattened solidity files. In uniswap you need to calculate an init_code_hash (the keccak hash of the byte code of the UniswapV2Pair contract) which uniswap uses for pair calculations. The thing is this hash changes after you combine all the dependencies into a single file. I've tried recalculating the hash but had no luck yet so I went with option 2 (multi-file deployment) until I think of another strategy. 
- There is a stability, repeatability, and reliability piece here too of course that I am keen to discuss, around how this type of system would be productionised or made consumable by other tools. 

### Görli deployment log
```shell script
Starting migrations...
======================
> Network name:    'goerli'
> Network id:      5
> Block gas limit: 29971671 (0x1c954d7)


4_wintermute_task2.js
=====================

   Replacing 'UniswapV2Factory'
   ----------------------------
   > transaction hash:    0xcec6ae00474c4f83c25afae02c3db7fc5358f8bd37a886e6eb5a33e05eb4d3cb
   > Blocks: 1            Seconds: 12
   > contract address:    0xfA7965da5268e9758E7F733a01C693D4Ec4c601f
   > block number:        6183427
   > block timestamp:     1641928152
   > account:             0x4f7011ad861125Bb7757665fbB63F1218b055Add
   > balance:             4.851704521931309531
   > gas used:            4129994 (0x3f04ca)
   > gas price:           20 gwei
   > value sent:          0 ETH
   > total cost:          0.08259988 ETH

Factory deployed with fee address 0x4f7011ad861125Bb7757665fbB63F1218b055Add
Account 1:  0x4f7011ad861125Bb7757665fbB63F1218b055Add
Account 2:  0xFca86973ef1eE5C024bd341bb55eA28c4bF70026

   Replacing 'WintermuteToken1'
   ----------------------------
   > transaction hash:    0xe9b13f6a51212b135d36462bd16c68b6cc7621209626e8cbc617a8dbd1f00256
   > Blocks: 2            Seconds: 25
   > contract address:    0x7A8d171a9BB2b3133EBFc2348fb8E6E1459F2728
   > block number:        6183429
   > block timestamp:     1641928182
   > account:             0x4f7011ad861125Bb7757665fbB63F1218b055Add
   > balance:             4.830340421931309531
   > gas used:            1068205 (0x104cad)
   > gas price:           20 gwei
   > value sent:          0 ETH
   > total cost:          0.0213641 ETH


   Replacing 'WintermuteToken2'
   ----------------------------
   > transaction hash:    0xc33fc9c946f7c4517dd9fd5d0d00128189b22b7961a050fcc6ad6c8db122278b
   > Blocks: 1            Seconds: 9
   > contract address:    0x17f06D0E85f7E067f6da025bDA242836F9f1DAaE
   > block number:        6183430
   > block timestamp:     1641928197
   > account:             0x4f7011ad861125Bb7757665fbB63F1218b055Add
   > balance:             4.808976321931309531
   > gas used:            1068205 (0x104cad)
   > gas price:           20 gwei
   > value sent:          0 ETH
   > total cost:          0.0213641 ETH


   Replacing 'WETH'
   ----------------
   > transaction hash:    0x7fc009a0590261bb51611f33a5f78dbc9d470a78f2af51052019081e4f3de6f2
   > Blocks: 1            Seconds: 13
   > contract address:    0x890B1cAE1C140101f0CA29b25426667de3f55Ec9
   > block number:        6183434
   > block timestamp:     1641928257
   > account:             0x4f7011ad861125Bb7757665fbB63F1218b055Add
   > balance:             4.788848741931309531
   > gas used:            938013 (0xe501d)
   > gas price:           20 gwei
   > value sent:          0 ETH
   > total cost:          0.01876026 ETH

Uniswap Pair created

   Replacing 'UniswapV2Router02'
   -----------------------------
   > transaction hash:    0xe091d0ffcf7669fb08e6a3b279d5415114e43b1e471c22f5fd4025db31dd8beb
   > Blocks: 1            Seconds: 14
   > contract address:    0x966dB32c1E6121F1ceC09A74a93C9f20a810ecb2
   > block number:        6183436
   > block timestamp:     1641928287
   > account:             0x4f7011ad861125Bb7757665fbB63F1218b055Add
   > balance:             4.637202841931309531
   > gas used:            4369972 (0x42ae34)
   > gas price:           20 gwei
   > value sent:          0 ETH
   > total cost:          0.08739944 ETH

Uniswap Router deployed
Uniswap Transactions approved!
Adding liquidity
Deploying WintermuteContract and Performing Approvals

   Replacing 'WintermuteContract'
   ------------------------------
   > transaction hash:    0x3ca4247058355019ed54614a0afcfed9117b067a67f3dffa7c38424794900071
   > Blocks: 1            Seconds: 9
   > contract address:    0x5a240f1e902C90220fAb38476348280E5466c6f0
   > block number:        6183445
   > block timestamp:     1641928422
   > account:             0x4f7011ad861125Bb7757665fbB63F1218b055Add
   > balance:             4.610751081931309531
   > gas used:            902453 (0xdc535)
   > gas price:           20 gwei
   > value sent:          0 ETH
   > total cost:          0.01804906 ETH

Performing wintermuteContract Swaps
Forward swap completed
Backward swap completed
Uniswap with ERC20 tokens completed
   > Saving artifacts
   -------------------------------------
   > Total cost:          0.24953684 ETH


Summary
=======
> Total deployments:   6
> Final cost:          0.24953684 ETH
``` 

Thank you for you time. 

