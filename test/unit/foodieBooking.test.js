const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Foodie Booking Unit Tests", function () {
          let foodieNft, foodieToken, foodieBooking, deployer, user, chef;
          const nftUri = "ipfs://QmaVkBn2tKmjbhphU7eyztbvSQU5EXDdqRyXZtRhSGgJGo";

          beforeEach(async () => {
              accounts = await ethers.getSigners();
              deployer = accounts[0];
              user = accounts[1];
              chef = accounts[2];
              await deployments.fixture(["all"]);
              foodieNft = await ethers.getContract("FoodieNft");
              foodieToken = await ethers.getContract("FoodieToken");
              foodieBooking = await ethers.getContract("FoodieBooking");
              const tokenAllowance = ethers.utils.parseEther("1000000000");
              const txResponse = await foodieToken.approve(foodieNft.address, tokenAllowance);
              await txResponse.wait(1);
          });

          describe("Constructor", function () {
              it("should set booking variable", async function () {
                  const tokenAddress = await foodieBooking.token();
                  const nftAddress = await foodieBooking.nft();
                  assert.equal(tokenAddress, foodieToken.address);
                  assert.equal(nftAddress, foodieNft.address);
              });
          });

          describe("Add Chef", function () {
              it("should create chef", async function () {
                  const chefData = {
                      name: "Harun Abdul-Salam",
                      wallet: chef.address,
                      fee: ethers.utils.parseEther("50"),
                  };
                  const txResponse = await foodieBooking.addChef(chefData.name, chefData.wallet, chefData.fee);
                  await txResponse.wait(1);
                  const chefId = await foodieBooking.getChefList(0);
                  const newChef = await foodieBooking.getChef(chefId);
                  assert.equal(newChef.id.toString(), chefId.toString());
                  assert.equal(newChef.name.toString(), chefData.name.toString());
                  assert.equal(newChef.wallet.toString(), chefData.wallet.toString());
                  assert.equal(newChef.fee.toString(), chefData.fee.toString());
              });
          });

          describe("Book Chef", function () {
              let chefId;
              beforeEach(async () => {
                  const chefData = {
                      name: "Harun Abdul-Salam",
                      wallet: chef.address,
                      fee: ethers.utils.parseEther("50"),
                  };
                  const chefTxResponse = await foodieBooking.addChef(chefData.name, chefData.wallet, chefData.fee);
                  await chefTxResponse.wait(1);
                  chefId = await foodieBooking.getChefList(0);
                  const mintTxResponse = await foodieNft.mintNFT(nftUri);
                  await mintTxResponse.wait(1);
              });
              it("should revert when nft is not found", async function () {
                  const foodieBookingUser = await ethers.getContract("FoodieBooking", user);
                  await expect(foodieBookingUser.bookChef(chefId)).to.be.revertedWith("You do not own NFT");
              });
              it("should revert when token is insufficient", async function () {
                  const balance = await foodieToken.balanceOf(deployer.address);
                  await foodieToken.transfer(user.address, balance);
                  await expect(foodieBooking.bookChef(chefId)).to.be.revertedWith("Insufficient Token");
              });
              it("should book a chef", async function () {
                  const initialChefBalance = await foodieToken.balanceOf(chef.address);
                  const tokenAllowance = ethers.utils.parseEther("1000000000");
                  const approveTxResponse = await foodieToken.approve(foodieBooking.address, tokenAllowance);
                  await approveTxResponse.wait(1);
                  const bookChefTxResponse = await foodieBooking.bookChef(chefId);
                  await bookChefTxResponse.wait(1);
                  const finalChefBalance = await foodieToken.balanceOf(chef.address);
                  const bookings = await foodieBooking.getBookings(deployer.address);
                  const bookedChef = await foodieBooking.getChef(chefId);

                  expect(bookChefTxResponse).to.emit(foodieBooking, "ChefBooked");
                  assert.equal(finalChefBalance.toString(), initialChefBalance.add(bookedChef.fee).toString());
                  assert.equal(bookings.toString(), chefId);
              });
          });
      });
