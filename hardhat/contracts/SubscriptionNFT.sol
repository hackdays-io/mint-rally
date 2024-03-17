// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract SubscriptionNFT is
    Initializable,
    ERC721EnumerableUpgradeable,
    OwnableUpgradeable
{
    uint256 private _tokenIds;

    function initialize() public initializer {
        __ERC721_init("SubscriptionNFT", "SNFT");
        __ERC721URIStorage_init();
        __Ownable_init();
    }

    function mintNFT(address recipient, string memory tokenURI)
        public onlyOwner
        returns (uint256)
    {
        _tokenIds++;

        uint256 newItemId = _tokenIds;
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }

}