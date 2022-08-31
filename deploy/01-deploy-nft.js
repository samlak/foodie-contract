const { network, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    log("Deploying FoodieNft...");
    log("----------------------------------------------------");

    const foodieToken = await ethers.getContract("FoodieToken", deployer);
    const tokenDeployer = foodieToken.signer.address;
    const tokenAddress = foodieToken.address;

    const arguments = [tokenAddress, tokenDeployer];
    const foodieNft = await deploy("FoodieNft", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...");
        await verify(foodieNft.address, arguments);
    }
};

module.exports.tags = ["all", "nft"];
