const Factory = artifacts.require('UniswapV2Factory.sol');
const UniswapV2Pair = artifacts.require('UniswapV2Pair.sol');
const WintermuteToken1 = artifacts.require('WintermuteToken1.sol');
const WintermuteToken2 = artifacts.require('WintermuteToken2.sol');
const WintermuteContract = artifacts.require('WintermuteContract.sol');
const Router = artifacts.require('UniswapV2Router02.sol');
const WETH = artifacts.require('WETH.sol');
const dotenv = require('dotenv').config({ path: `${__dirname}/../.env` });

module.exports = async function (deployer, _network, addresses) {

    try {
        let account1;
        let account2;
         if(_network == 'goerli') {
            account1 = process.env.META_MASK_ACCOUNT_1
            account2 = process.env.META_MASK_ACCOUNT_2
        } else {
            const accounts = await web3.eth.getAccounts();
            account1 = accounts[0]
            account2 = accounts[1]
        }
        await deployer.deploy(Factory, addresses[0]);
        const factory = await Factory.deployed();
        console.log("Factory deployed with fee address", addresses[0])
        console.log("Account 1: ", account1)
        console.log("Account 2: ", account2)

        await deployer.deploy(WintermuteToken1);
        await deployer.deploy(WintermuteToken2);
        const wintermuteToken1 = await WintermuteToken1.deployed();
        const wintermuteToken2 = await WintermuteToken2.deployed();
        await wintermuteToken1.faucet(account1, 1000000000000)
        await wintermuteToken2.faucet(account1, 1000000000000)

        await deployer.deploy(WETH);
        const weth = await WETH.deployed();

        const pairAddress = await factory.createPair(wintermuteToken1.address, wintermuteToken2.address);
        console.log("Uniswap Pair created")

        await deployer.deploy(Router, factory.address, weth.address);
        const router = await Router.deployed()
        console.log("Uniswap Router deployed")

        const approval1 = await wintermuteToken1.approve(router.address, 10000000)
        const approval2 = await wintermuteToken2.approve(router.address, 10000000)
        await wintermuteToken1.faucet(router.address, 1000000000000)
        await wintermuteToken2.faucet(router.address, 1000000000000)
        console.log("Uniswap Transactions approved!")

        console.log("Adding liquidity")
        await router.addLiquidity(
            wintermuteToken1.address,
            wintermuteToken2.address,
            10000000,
            10000000,
            10000000,
            10000000,
            account1,
            Math.floor(Date.now() / 1000) + 60 * 10
        );

        console.log("Deploying WintermuteContract and Performing Approvals")

        await deployer.deploy(WintermuteContract, factory.address);
        const wintermuteContract = await WintermuteContract.deployed()

        await wintermuteToken1.faucet(wintermuteContract.address, 100)
        await wintermuteToken2.faucet(wintermuteContract.address, 100)

        const approval5 = await wintermuteToken1.approve(router.address, 100)
        const approval6 = await wintermuteToken2.approve(router.address, 100)

        console.log("Performing wintermuteContract Swaps")
        const swap1 = await wintermuteContract.swapExactTokensForTokens(wintermuteToken1.address, wintermuteToken2.address, router.address, 100, 0)
        console.log("Forward swap completed")
        const swap2 = await wintermuteContract.swapExactTokensForTokens(wintermuteToken2.address, wintermuteToken1.address, router.address, 100, 0)
        console.log("Backward swap completed")
        const swap3 = await router.swapExactTokensForTokens(100,0,[wintermuteToken1.address, wintermuteToken2.address], account1,Math.floor(Date.now() / 1000) + 60 * 10)
        const swap4 = await router.swapExactTokensForTokens(100,0,[wintermuteToken2.address, wintermuteToken1.address], account1,Math.floor(Date.now() / 1000) + 60 * 10)
        console.log("Uniswap with ERC20 tokens completed")
    } catch (e) {
        console.log(e);
    }
};

async function checkBalance(print, address) {
    try {
        const checksumAddress = web3.utils.toChecksumAddress(address)
        await web3.eth.getBalance(checksumAddress).then((balanceInWei) => {
            balance = web3.utils.fromWei(balanceInWei);
            console.log(name+ " balance in ETH:", balance);
        });
    } catch (error) {
        console.log(error);
    }
}