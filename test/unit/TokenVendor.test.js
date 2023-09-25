const { assert, expect } = require("chai");
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
    
    describe("buyTokens function", function () {
        it("Should revert if no payment is not sent", async function () {
            const tokenAmountToBuy = 10;
            await expect(tokenVendor.buyTokens(tokenAmountToBuy, {value: 0})).to.be.revertedWith("Insufficient Payment");
        });
        it("Should revert if insufficient payment is sent", async function () {
            const tokenAmountToBuy = BigInt(10);
            const pricePerEth = BigInt(300000);
            const payment = (tokenAmountToBuy * pricePerEth) - BigInt(10);
            await expect(tokenVendor.buyTokens(tokenAmountToBuy, {value: payment})).to.be.revertedWith("Insufficient Payment");
        });
        it("Should send the user the required amount from the contract", async function () {
            const amountToMint = BigInt(50);
            const tokenAmountToBuy = BigInt(20);
            const pricePerEth = BigInt(300000);
            const payment = (tokenAmountToBuy * pricePerEth);

            await myToken.mint(tokenVendor.target, amountToMint);
            await tokenVendor.buyTokens(tokenAmountToBuy, {value: payment});

            const remainingContractBalance = await myToken.balanceOf(tokenVendor.target);
            const buyerBalance = await myToken.balanceOf(deployer);

            assert(remainingContractBalance < amountToMint);
            assert.equal((amountToMint - remainingContractBalance), buyerBalance);
        });
        it("Should mint the required amount to the buyer from 'MyToken' contract", async function () {
            const tokenAmountToBuy = BigInt(20);
            const pricePerEth = BigInt(300000);
            const payment = (tokenAmountToBuy * pricePerEth);

            await tokenVendor.buyTokens(tokenAmountToBuy, {value: payment});
            
            const buyerBalance = await myToken.balanceOf(deployer);

            assert.equal(buyerBalance, tokenAmountToBuy);
        });
        it("Should emit an event upon minting of tokens", async function () {
            const tokenAmountToBuy = BigInt(20);
            const pricePerEth = BigInt(300000);
            const payment = (tokenAmountToBuy * pricePerEth);

            await expect(tokenVendor.buyTokens(tokenAmountToBuy, {value: payment})).to.emit(tokenVendor, "TokensBought");
        });
    });
});
