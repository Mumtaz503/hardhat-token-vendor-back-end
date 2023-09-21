// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.7;
import "./MyToken.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./interfaces/IMyToken.sol";

contract TokenVendor is Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    MyToken private s_myToken;
    uint256 private immutable pricePerEth;
    uint256 private immutable collateralPerToken;
    address private immutable wethAddress;
    uint256 private immutable minCollateral;
    address private immutable i_owner;

    mapping(address => uint256) private s_addressToCollateral;
    mapping(address => uint256) private s_addressToBorrowedTokens;

    event TokensBought(address indexed buyer, uint256 amountBought);
    event TokensSold(address indexed seller, uint256 amountSold);
    event CollateralDeposited(
        address indexed borrower,
        uint256 collateralAmount
    );
    event CollateralWithdrawn(
        address indexed borrower,
        uint256 collateralAmount
    );
    event TokensBorrowed(address indexed borrower, uint256 amount);

    constructor(
        address _myTokenAddress,
        uint256 _conversion,
        address _wethAddress,
        uint256 _collateralPerToken,
        uint256 _minCollateral
    ) {
        s_myToken = MyToken(_myTokenAddress);
        pricePerEth = _conversion;
        wethAddress = _wethAddress;
        collateralPerToken = _collateralPerToken;
        minCollateral = _minCollateral;
        i_owner = msg.sender;
    }

    //DoneZo
    function buyTokens(uint256 _amountToBuy) public payable {
        uint256 tokenAmount = _amountToBuy * pricePerEth;
        require(msg.value >= tokenAmount, "Insufficient Payment");
        s_myToken.mint(msg.sender, tokenAmount);
        emit TokensBought(msg.sender, tokenAmount);
    }

    //DoneZo
    function sellTokens(uint256 _amountToSell) public {
        require(_amountToSell > 0, "Please input a valid amount");
        require(
            s_myToken.balanceOf(msg.sender) >= _amountToSell,
            "Insufficient Balance"
        );
        s_myToken.transferFrom(msg.sender, address(this), _amountToSell);
        uint256 ethAmount = _amountToSell.div(pricePerEth);
        payable(msg.sender).transfer(ethAmount);
        emit TokensSold(msg.sender, _amountToSell);
    }

    //DoneZo
    function depositCollateral(uint256 _collateralAmount) public {
        require(
            _collateralAmount > 0,
            "Collateral Amount must be greater than zero"
        );
        s_addressToCollateral[msg.sender] = s_addressToCollateral[msg.sender]
            .add(_collateralAmount);
        IERC20(wethAddress).safeTransferFrom(
            msg.sender,
            address(this),
            _collateralAmount
        );
        emit CollateralDeposited(msg.sender, _collateralAmount);
    }

    //DoneZo
    function withdrawCollateral(
        uint256 _amount
    ) public WithdrawOnlyIfDeposited {
        require(_amount > 0, "Please enter a valid amount");
        require(
            s_addressToCollateral[msg.sender] >= _amount,
            "Insufficient Funds"
        );
        IERC20(wethAddress).safeTransfer(msg.sender, _amount);
        s_addressToCollateral[msg.sender] = s_addressToCollateral[msg.sender]
            .sub(_amount);
        emit CollateralWithdrawn(msg.sender, _amount);
    }

    //DoneZo
    function borrowMyToken(uint256 _amountToBorrow) public {
        require(_amountToBorrow > 0, "No valid amount");
        require(
            s_addressToCollateral[msg.sender] >= minCollateral,
            "You need to deposit collateral"
        );

        uint256 availableCollateral = s_addressToCollateral[msg.sender];
        uint256 borrowLimit = availableCollateral.div(collateralPerToken);

        require(
            _amountToBorrow <= borrowLimit,
            "You have reached the borrow limit"
        );

        uint256 availableTokens = s_myToken.balanceOf(address(this));
        uint256 tokensToMint = _amountToBorrow - availableTokens;

        if (tokensToMint > 0) {
            uint256 tokenAmount = tokensToMint.mul(pricePerEth);
            require(
                s_addressToCollateral[msg.sender] >= tokenAmount,
                "You don't have enough collateral"
            );
            s_myToken.mintWithWeth(tokenAmount);
        }
        s_addressToBorrowedTokens[msg.sender] = s_addressToBorrowedTokens[
            msg.sender
        ].add(_amountToBorrow);
        s_myToken.transfer(msg.sender, _amountToBorrow);
        emit TokensBorrowed(msg.sender, _amountToBorrow);
    }

    //DoneZo
    function repayMyToken(uint256 _repayAmount) public {
        require(_repayAmount > 0, "enter sufficient amount");
        uint256 borrowedTokens = s_addressToBorrowedTokens[msg.sender];
        require(
            borrowedTokens >= _repayAmount,
            "You haven't borrowed any tokens"
        );
        s_addressToBorrowedTokens[msg.sender] = borrowedTokens.sub(
            _repayAmount
        );
        s_myToken.transferFrom(msg.sender, address(this), _repayAmount);
    }

    function withdraw() external onlyOwner {
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }

    modifier WithdrawOnlyIfDeposited() {
        require(
            s_addressToCollateral[msg.sender] > 0,
            "No collateral deposited"
        );
        _;
    }

    function getMyToken() public view returns (address) {
        return address(s_myToken);
    }

    function getWethAddress() public view returns (address) {
        return wethAddress;
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }
}
//AJSHJAKSDKJASDKJ
