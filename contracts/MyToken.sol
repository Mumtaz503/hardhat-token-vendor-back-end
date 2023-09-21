// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IMyToken.sol";

contract MyToken is ERC20, IMyToken {
    address private immutable wethAddress;

    constructor(
        string memory name,
        string memory symbol,
        address _wethAddress
    ) ERC20(name, symbol) {
        wethAddress = _wethAddress;
    }

    function mint(address to, uint256 amount) external override {
        _mint(to, amount);
    }

    function mintWithWeth(uint256 _amount) public {
        require(_amount > 0, "Please send a valid amount");
        IERC20(wethAddress).transferFrom(msg.sender, address(this), _amount);
        _mint(msg.sender, _amount);
    }
}
