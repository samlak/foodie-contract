// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FoodieBooking {
    ERC20 public token;

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

    constructor(address _token) {
        token = ERC20(_token);
    }

    function bookChef(bytes32 _chefId) public {
        Chef memory chef = chefs[_chefId];
        if (token.balanceOf(msg.sender) < chef.fee) {
            revert("Insufficient Token");
        }
        token.transfer(chef.wallet, chef.fee);
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
    }

    function getChef(bytes32 _chefId)
        public
        view
        returns (
            bytes32,
            string memory,
            address,
            uint256
        )
    {
        Chef memory chef = chefs[_chefId];
        return (chef.id, chef.name, chef.wallet, chef.fee);
    }
}
