pragma solidity =0.5.16;


interface IERC20 {
    event Approval(address indexed owner, address indexed spender, uint value);
    event Transfer(address indexed from, address indexed to, uint value);

    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    function totalSupply() external view returns (uint);
    function balanceOf(address owner) external view returns (uint);
    function allowance(address owner, address spender) external view returns (uint);

    function approve(address spender, uint value) external returns (bool);
    function transfer(address to, uint value) external returns (bool);
    function transferFrom(address from, address to, uint value) external returns (bool);
}

interface IUniswapV2Router02 {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
}

interface IWETH {
    function deposit() external payable;
    function transfer(address to, uint value) external returns (bool);
    function withdraw(uint) external;
}

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

contract WintermuteContract {

    address public owner;
    address public factory;

    constructor(address _uniswap_factory_address) public {
        owner = msg.sender;
        factory = _uniswap_factory_address;
    }

    function depositETH() external payable {}

    function withdrawETH() external {
        require(msg.sender == owner, "Only the owner can withdraw ETH");
        msg.sender.transfer(address(this).balance);
    }

    function depositERC20(address _token, uint _amount) public {
        IERC20(_token).transferFrom(msg.sender, address(this), _amount);
    }

    function withdrawERC20(address _token, uint _amount) public {
        require(msg.sender == owner, "Only the owner can withdraw from this contract");
        IERC20 tokenContract = IERC20(_token);
        tokenContract.transfer(msg.sender, _amount);
    }

    function wrapETH(address wethAddress) public payable {
        WETH(wethAddress).deposit.value(msg.value)(msg.sender);
    }

    function unwrapETH(address wethAddress, uint amount ) public {
        WETH(wethAddress).withdraw(msg.sender, amount);
    }

    function swapExactTokensForTokens(
        address _tokenIn,
        address _tokenOut,
        address _router,
        uint _amountIn,
        uint _amountOutMin
    ) external payable {
        IERC20(_tokenIn).approve(_router, _amountIn);
        IERC20(_tokenIn).allowance(address(this), _router);

        address[] memory path = new address[](2);
        path[0] = _tokenIn;
        path[1] = _tokenOut;

        IUniswapV2Router02(_router).swapExactTokensForTokens(
            _amountIn,
            _amountOutMin,
            path,
            msg.sender,
            block.timestamp + 1000000000
        );
    }

    function balance() external view returns(uint balanceETH) {
        balanceETH = address(this).balance;
    }

    function balanceOfERC20(address tokenAddress) external view returns(uint) {
        return IERC20(tokenAddress).balanceOf(address(this));
    }
}