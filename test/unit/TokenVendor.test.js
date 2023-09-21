const { assert } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");

describe("Token Vendor Unit Tests", function () {
    let deployer, user, deployerSigner, userSigner, weth9Mock, myToken, tokenVendor;

    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        user = (await getNamedAccounts()).user;
        deployerSigner = ethers.provider.getSigner(deployer);
        userSigner = ethers.provider.getSigner(user);

        await deployments.fixture(["all"]);

        weth9Mock = await ethers.getContract("WETH9Mock", deployer);
        myToken = await ethers.getContract("MyToken", deployer);
        tokenVendor = await ethers.getContract("TokenVendor", deployer);
    });

    describe("Constructor", function () {
        it("Should set the address of the custom ERC-20 token", async function () {
            const myTokenAddress = await tokenVendor.getMyToken();
            assert.equal(myTokenAddress, myToken.target);
        });
        it("Should set the address of WETH contract right", async function () {
            const getWethAddress = await tokenVendor.getWethAddress();
            assert.equal(getWethAddress, weth9Mock.target);
        });
        it("Should set deployer as the owner", async function () {
            const ownerAddress = await tokenVendor.getOwner();
            assert.equal(ownerAddress, deployer);
        });
    });
});
