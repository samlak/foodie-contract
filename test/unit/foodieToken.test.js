const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Foodie Token Unit Tests", function () {
          let foodieToken, deployer;

          beforeEach(async () => {
              accounts = await ethers.getSigners();
              deployer = accounts[0];
              await deployments.fixture(["token"]);
              foodieToken = await ethers.getContract("FoodieToken");
          });

          describe("Constructor", function () {
              it("should transfer token after contract is created", async function () {
                  const balance = await foodieToken.balanceOf(deployer.address);
                  assert.equal(balance.toString(), ethers.utils.parseEther("1000000000").toString());
              });
          });
      });
