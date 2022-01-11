const Factory = artifacts.require('UniswapV2Factory.sol');
const UniswapV2Pair = artifacts.require('UniswapV2Pair.sol');
const WintermuteToken = artifacts.require('WintermuteToken1.sol');
const WintermuteContract = artifacts.require('WintermuteContract.sol');
const Router = artifacts.require('UniswapV2Router02.sol');
const WETH = artifacts.require('WETH.sol');
const DOTENV = require('dotenv').config({ path: `${__dirname}/../.env` });
const unit = require('ethjs-unit');

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

        console.log("Commencing deployment to :", _network);
        await deployer.deploy(Factory, addresses[0]);
        const factory = await Factory.deployed();
        console.log("Factory deployed with fee address", addresses[0])
        console.log("Account 1: ", account1)
        console.log("Account 2: ", account2)
        await deployer.deploy(WintermuteToken);
        await deployer.deploy(WETH);

        const wintermuteToken = await WintermuteToken.deployed();
        const weth = await WETH.deployed();

        await wintermuteToken.faucet(account1, 100)
        await wintermuteToken.faucet(account2, 100)

        await deployer.deploy(WintermuteContract, factory.address, {from: account1});
        const wintermute = await WintermuteContract.deployed();

        // 1. Deposit and withdraw ETH into Wintermute
        console.log("------------------------------------")
        const balance0 = await wintermute.balance()
        console.log("Balance of ETH in WintermuteContract after deposit: "+balance0)
        console.log("Depositing 5 ETH")
        await wintermute.depositETH({ from: account1, value: 5});
        const balance1 = await wintermute.balance()
        console.log("Balance of ETH in WintermuteContract after deposit : "+balance1)
        console.log("Withdrawing ETH")
        await wintermute.withdrawETH({ from: account1 });
        const balance2 = await wintermute.balance()
        console.log("Balance of ETH in WintermuteContract after withdrawal : "+balance2)

        // 2. Deposit and withdraw ERC20 into Wintermute
        console.log("------------------------------------")
        const balance3 = await wintermute.balanceOfERC20(wintermuteToken.address)
        console.log("Balance of WintermuteToken in WintermuteContract before deposit: "+balance3)
        const balanceX = await wintermuteToken.balanceOf(account1)
        console.log("ERC20 token balance of account 2: "+balanceX)
        console.log("Depositing 20 WintermuteToken")
        await wintermuteToken.approve(wintermute.address, 20)
        await wintermute.depositERC20(wintermuteToken.address, 20, {from : account1});
        const balance4 = await wintermuteToken.balanceOf(wintermute.address)
        console.log("Balance of WintermuteToken in WintermuteContract after deposit : "+balance4)
        console.log("Withdrawing WintermuteToken")
        await wintermuteToken.approve(account1, 20)
        await wintermute.withdrawERC20(wintermuteToken.address, 20, {from : account1});
        const balance5 = await wintermute.balanceOfERC20(wintermuteToken.address)
        console.log("Balance of WintermuteToken in WintermuteContract after withdrawal : "+balance5)

        // 3. Wrapping and unwrapping ETH
        console.log("------------------------------------")
        const balance6 = await checkBalance("Account 2", account2)
        const balance7 = await weth.balanceOfAddress(account2)
        console.log("Account 2 ETH balance before wrapping: "+balance6)
        console.log("Account 2 WETH balance before wrapping: "+balance7)
        console.log("Wrapping 10 ETH for account 2")
        await wintermute.wrapETH(weth.address, { from: account2, value: 10 })
        const balance8 = await checkBalance("Account 2", account2)
        const balance9 = await weth.balanceOfAddress(account2)
        console.log("Account 2 ETH balance after wrapping: "+balance8)
        console.log("Account 2 WETH balance after wrapping: "+balance9)
        console.log("Unwrapping 10 ETH for account 2")
        await weth.approve(account2, 10)
        await wintermute.unwrapETH(weth.address, 10, { from: account2 })
        const balance10 = await checkBalance("Account 2", account2)
        const balance11 = await weth.balanceOfAddress(account2)
        console.log("Account 2 ETH balance after unwrapping: "+balance10)
        console.log("Account 2 WETH balance after unwrapping: "+balance11)
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