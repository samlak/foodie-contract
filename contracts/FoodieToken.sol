// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FoodieToken is ERC20 {
    constructor() ERC20("Foodie Token", "FOOD") {
        _mint(msg.sender, 1000000000 ether);
    }
}
