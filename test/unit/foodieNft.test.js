const { network, deployments, ethers } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Foodie NFT Unit Tests", function () {
          let foodieNft, foodieToken, deployer, minter;
          const nftUri = "ipfs://QmaVkBn2tKmjbhphU7eyztbvSQU5EXDdqRyXZtRhSGgJGo";

          beforeEach(async () => {
              accounts = await ethers.getSigners();
              deployer = accounts[0];
              minter = accounts[1];
              await deployments.fixture(["nft", "token"]);
              foodieNft = await ethers.getContract("FoodieNft");
              foodieToken = await ethers.getContract("FoodieToken");
              const tokenAllowance = ethers.utils.parseEther("1000000000");
              const txResponse = await foodieToken.approve(foodieNft.address, tokenAllowance);
              await txResponse.wait(1);
          });

          describe("Constructor", function () {
              it("should set the variable", async function () {
                  const tokenAddress = await foodieNft.token();
                  assert.equal(tokenAddress, foodieToken.address);
              });
          });

          describe("Mint NFT", function () {
              it("should mint NFT", async function () {
                  const txResponse = await foodieNft.mintNFT(nftUri);
                  await txResponse.wait(1);
                  const tokenURI = await foodieNft.tokenURI(0);
                  assert.equal(tokenURI, nftUri);
              });
              it("should transfer token after minting", async function () {
                  const initialDeployerBalance = await foodieToken.balanceOf(deployer.address);
                  foodieNft = await ethers.getContract("FoodieNft", minter);
                  const txResponse = await foodieNft.mintNFT(nftUri);
                  await txResponse.wait(1);
                  const minterBalance = await foodieToken.balanceOf(minter.address);
                  const finalDeployerBalance = await foodieToken.balanceOf(deployer.address);
                  assert.equal(minterBalance.toString(), ethers.utils.parseEther("1000").toString());
                  assert.equal(
                      finalDeployerBalance.toString(),
                      initialDeployerBalance.sub(ethers.utils.parseEther("1000")).toString()
                  );
              });

              it("should revert on second mint", async function () {
                  const txResponse = await foodieNft.mintNFT(nftUri);
                  await txResponse.wait(1);
                  await expect(foodieNft.mintNFT(nftUri)).to.be.revertedWith("NFT Minted Already");
              });

              it("should emit event on mint", async function () {
                  await expect(foodieNft.mintNFT(nftUri)).to.emit(foodieNft, "NftMinted");
              });
          });
      });
