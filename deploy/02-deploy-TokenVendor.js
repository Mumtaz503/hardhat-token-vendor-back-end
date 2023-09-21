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

    const myToken = await deployments.get("MyToken");

    if (developmentChains.includes(network.name)) {
        const weth9 = await deployments.get("WETH9Mock");
        arguments = [myToken.address, pricePerETH, weth9.address, collateralPerToken, minCollateral];
    } else {
        const wethTokenAddress = networkConfig[chainId]["wethAddress"];
        arguments = [myToken.address, pricePerETH, wethTokenAddress, collateralPerToken, minCollateral];
    }

    log("deploying contract please wait");

    const tokenVendor = await deploy("TokenVendor", {
        contract: "TokenVendor",
        from: deployer,
        args: arguments,
        log: true,
    });

    log(`Contract successfully deployed at ${tokenVendor.address}`);

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("verifying contract please wait...");
        await verify(tokenVendor.address, arguments);
        log("contract succesfully verified");
    }

    log("------------------------------------------------------------");
}

module.exports.tags = ["all", "tokenVendor"];

