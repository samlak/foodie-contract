// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract FoodieBooking {
    ERC20 public token;
    ERC721 public nft;

    struct Chef {
        bytes32 id;
        string name;
        address wallet;
        uint256 fee;
    }
    uint256 private chefCounter;
    mapping(bytes32 => Chef) public chefs;
    bytes32[] public chefsList;

    event ChefBooked(address indexed user, bytes32 chefId);

    mapping(address => bytes32) public bookings;

    constructor(address _token, address _nft) {
        token = ERC20(_token);
        nft = ERC721(_nft);
    }

    function bookChef(bytes32 _chefId) public {
        if (nft.balanceOf(msg.sender) == 0) {
            revert("You do not own NFT");
        }
        Chef memory chef = chefs[_chefId];
        if (token.balanceOf(msg.sender) < chef.fee) {
            revert("Insufficient Token");
        }
        token.transferFrom(msg.sender, chef.wallet, chef.fee);
        bookings[msg.sender] = _chefId;
        emit ChefBooked(msg.sender, _chefId);
    }

    function addChef(
        string memory _name,
        address _wallet,
        uint256 _fee
    ) public {
        chefCounter = chefCounter + 1;
        bytes32 chefId = keccak256(abi.encodePacked(chefCounter, _name));
        chefs[chefId] = Chef(chefId, _name, _wallet, _fee);
        chefsList.push(chefId);
    }

    function getChef(bytes32 _chefId) public view returns (Chef memory) {
        Chef memory chef = chefs[_chefId];
        return chef;
    }

    function getChefList(uint256 _index) public view returns (bytes32) {
        return chefsList[_index];
    }

    function getChefListLength() public view returns (uint256) {
        return chefsList.length;
    }

    function getBookings(address _address) public view returns (bytes32) {
        return bookings[_address];
    }
}
