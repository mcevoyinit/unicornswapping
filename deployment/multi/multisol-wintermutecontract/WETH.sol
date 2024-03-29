pragma solidity <=0.6.6;

import "./IERC20.sol";
import "./IWETH.sol";

contract WETH is IERC20 {
    string public name     = "Wrapped Ether";
    string public symbol   = "WETH";
    uint8  public decimals = 18;

    event  Approval(address indexed src, address indexed guy, uint wad);
    event  Transfer(address indexed src, address indexed dst, uint wad);
    event  Deposit(address indexed dst, uint wad);
    event  Withdrawal(address indexed src, uint wad);

    mapping (address => uint)                       public  balanceOf;
    mapping (address => mapping (address => uint))  public  allowance;

    function faucet(address to, uint amount) external {
         balanceOf[to] += amount;
    }

    function deposit(address addy) public payable {
        balanceOf[addy] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(address payable addy, uint wad) public {
        require(balanceOf[addy] >= wad);
        balanceOf[addy] -= wad;
        addy.transfer(wad);
        emit Withdrawal(addy, wad);
    }

    function totalSupply() public view returns (uint) {
        return address(this).balance;
    }

    function _approve(address owner, address spender, uint value) private {
        allowance[owner][spender] = value;
        emit Approval(owner, spender, value);
    }

    function approve(address spender, uint value) external returns (bool) {
        _approve(msg.sender, spender, value);
        return true;
    }

    function transfer(address dst, uint wad) public returns (bool) {
        return transferFrom(msg.sender, dst, wad);
    }

    function transferFrom(address src, address dst, uint wad)
        public
        returns (bool)
    {
        require(balanceOf[src] >= wad);

        if (src != msg.sender && allowance[src][msg.sender] != uint(-1)) {
            require(allowance[src][msg.sender] >= wad);
            allowance[src][msg.sender] -= wad;
        }

        balanceOf[src] -= wad;
        balanceOf[dst] += wad;

        emit Transfer(src, dst, wad);

        return true;
    }

    function balanceOfAddress(address addy) public view returns (uint) {
        uint bal = balanceOf[addy];
        return bal;
    }

}
