const { network } = require("hardhat");
const { tokenName, tokenSymbol, developmentChains, networkConfig } = require("../helper-hardhat-config");
const { verify } = require("../utils/verification");

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    let arguments;

    if (developmentChains.includes(network.name)) {
        const weth9 = await deployments.get("WETH9Mock");
        arguments = [tokenName, tokenSymbol, weth9.address];
    } else {
        const wethTokenAddress = networkConfig[chainId]["wethAddress"];
        arguments = [tokenName, tokenSymbol, wethTokenAddress];
    }

    log("Deploying my token please wait.....");
    const myToken = await deploy("MyToken", {
        contract: "MyToken",
        from: deployer,
        args: arguments,
        log: true,
    });

    log("Token successfully deployed");

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("verifying contract please wait...");
        await verify(myToken.address, arguments);
        log("contract succesfully verified");
    }

    log("------------------------------------------------------------");
}

module.exports.tags = ["all", "myToken"];