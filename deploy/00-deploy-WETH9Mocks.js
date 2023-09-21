

module.exports = async function ({ deployments, getNamedAccounts }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    const weth9Mocks = await deploy("WETH9Mock", {
        contract: "WETH9Mock",
        from: deployer,
        log: true,
        args: [],
    });

    log(`WETH9 Contract deployed at ${weth9Mocks.address}`);
    log("------------------------------------------------------------");
}

module.exports.tags = ["all", "mocks"];