const { network, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    log("Deploying FoodieBooking...");
    log("----------------------------------------------------");

    const foodieToken = await ethers.getContract("FoodieToken", deployer);
    const foodieNft = await ethers.getContract("FoodieNft", deployer);
    const tokenAddress = foodieToken.address;
    const nftAddress = foodieNft.address;

    const arguments = [tokenAddress, nftAddress];
    const foodieBooking = await deploy("FoodieBooking", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...");
        await verify(foodieBooking.address, arguments);
    }
};

module.exports.tags = ["all", "booking"];
