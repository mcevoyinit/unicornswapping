const { merge } = require('sol-merger');
fs = require('fs');

async function main() {
    // Merging solidity files for ease of verification on etherscan
    const mergedCode0 = await merge("contracts/WETH.sol");
    const mergedCode1 = await merge("contracts/WintermuteToken1.sol");
    const mergedCode2 = await merge("contracts/WintermuteToken2.sol");
    const mergedCode3 = await merge("contracts/WintermuteContract.sol");
    const mergedCode4 = await merge("contracts/UniswapV2Factory.sol");
    const mergedCode5 = await merge("contracts/UniswapV2Router02.sol");
    fs.writeFileSync('deployment/flattened/WETH.sol', mergedCode0, function (err) {})
    fs.writeFileSync('deployment/flattened/WintermuteToken1.sol', mergedCode1, function (err) {})
    fs.writeFileSync('deployment/flattened/WintermuteToken2.sol', mergedCode2, function (err) {})
    fs.writeFileSync('deployment/flattened/WintermuteContract.sol', mergedCode3, function (err) {})
    fs.writeFileSync('deployment/flattened/UniswapV2Factory.sol', mergedCode4, function (err) {})
    fs.writeFileSync('deployment/flattened/UniswapV2Router.sol', mergedCode5, function (err) {})
    console.log("Merge complete")
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });