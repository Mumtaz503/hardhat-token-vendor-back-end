const { ethers } = require("hardhat");

const networkConfig = {
    31337: {
        name: "localhost",
        wethAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    },
    11155111: {
        name: "sepolia",
        ethUsdPricefeedAddress: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
        wethAddress: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
    },
}

const collateralPerToken = ethers.parseEther("0.005");
const minCollateral = ethers.parseEther("0.1");
const pricePerETH = "300";
const tokenName = "MyToken";
const tokenSymbol = "MT";
const developmentChains = ["hardhat", "localhost"];
//const mainNetWethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

module.exports = {
    networkConfig,
    pricePerETH,
    developmentChains,
    tokenName,
    tokenSymbol,
    collateralPerToken,
    minCollateral,
    //mainNetWethAddress,
}