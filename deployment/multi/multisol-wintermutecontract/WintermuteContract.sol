pragma solidity =0.5.16;

import './IERC20.sol';
import './IUniswapV2Router02.sol';
import "./WETH.sol";

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

    function performUniswap(
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

    function balanceOfERC20(address tokenAddress) external view returns(uint balanceERC20) {
        IERC20(tokenAddress).balanceOf(address(this));
    }
}