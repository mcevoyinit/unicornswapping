pragma solidity =0.5.16;

import './ERC20.sol';

contract WintermuteToken1 is ERC20 {
  constructor() ERC20(100) public {}

  function faucet(address to, uint amount) external {
    _mint(to, amount);
  }
}