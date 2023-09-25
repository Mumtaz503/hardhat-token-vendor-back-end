const { ethers, network } = require("hardhat");
const { networkConfig,
    pricePerETH,
    developmentChains,
    collateralPerToken,
    minCollateral
} = require("../helper-hardhat-config");

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deployer } = await getNamedAccounts();
    const { deploy, log } = deployments;
    const chainId = network.config.chainId;
    let arguments;

    const myToken = await ethers.getContract("MyToken");

    if (developmentChains.includes(network.name)) {
        const weth9 = await ethers.getContract("WETH9Mock");
        arguments = [myToken.target, pricePerETH, weth9.target, collateralPerToken, minCollateral];
    } else {
        const wethTokenAddress = networkConfig[chainId]["wethAddress"];
        arguments = [myToken.target, pricePerETH, wethTokenAddress, collateralPerToken, minCollateral];
    }

    log("deploying contract please wait");

    const tokenVendor = await deploy("TokenVendor", {
        contract: "TokenVendor",
        from: deployer,
        args: arguments,
        log: true,
    });

    log(`Contract successfully deployed at ${tokenVendor.target}`);

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("verifying contract please wait...");
        await verify(tokenVendor.target, arguments);
        log("contract succesfully verified");
    }

    log("------------------------------------------------------------");
}

module.exports.tags = ["all", "tokenVendor"];

