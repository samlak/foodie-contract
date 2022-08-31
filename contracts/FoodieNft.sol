// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

contract FoodieNft is ERC721URIStorage, Ownable {
    ERC20 public token;
    address internal immutable tokenOwner;
    uint256 public tokenCounter;

    event NftMinted(uint256 indexed nftId, address minter);

    constructor(address _tokenAddress, address _tokenOwner) ERC721("Foodie NFT", "FOOD") {
        token = ERC20(_tokenAddress);
        tokenOwner = _tokenOwner;
    }

    function mintNFT(string memory _nftUri) public {
        if (balanceOf(msg.sender) > 0) {
            revert("NFT Minted Already");
        }
        uint256 nftId = tokenCounter;
        tokenCounter = tokenCounter + 1;
        _safeMint(msg.sender, nftId);
        _setTokenURI(nftId, _nftUri);
        token.transferFrom(tokenOwner, msg.sender, 1000 ether);
        emit NftMinted(nftId, msg.sender);
    }
}
