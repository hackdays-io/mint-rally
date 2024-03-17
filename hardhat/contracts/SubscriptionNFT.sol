// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import {AccessControlEnumerableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import {IMintPoint} from "./IMintPoint.sol";

contract SubscriptionNFT is
    Initializable,
    ERC721URIStorageUpgradeable,
    AccessControlEnumerableUpgradeable
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    uint256 private _tokenIds;
    address public mintPointAddr;
    mapping(address => uint256) private subscriptionEnds;

    function initialize() public initializer {
        __ERC721_init("SubscriptionNFT", "SNFT");
        __ERC721URIStorage_init();
        __AccessControlEnumerable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(MINTER_ROLE, _msgSender());
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(
            ERC721Upgradeable,
            AccessControlEnumerableUpgradeable
        )
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function setMintAddr(address _mintPointAddr) public onlyRole(DEFAULT_ADMIN_ROLE) {
        mintPointAddr = _mintPointAddr;
    }

    function mintNFT(address recipient, string memory tokenURI, uint256 subscriptionEnd)
        public onlyRole(MINTER_ROLE)
        returns (uint256)
    {
        subscriptionEnds[recipient] = subscriptionEnd;

        _tokenIds++;
        uint256 newItemId = _tokenIds;
        _setTokenURI(newItemId, tokenURI);
        _mint(recipient, newItemId);

        return newItemId;
    }

    function airdrop() public onlyRole(MINTER_ROLE) {
        for (uint256 i = 1; i <= _tokenIds; i++) {
            address owner = ownerOf(i);
            if (subscriptionEnds[owner] > block.timestamp) {
                IMintPoint(mintPointAddr).mintByMinter(owner, i, 1000);
            }
            // TODO: 一ヶ月に一回しかエアドロップできないような制限をつける
            //　不平等にならないように気をつける必要あり（期限が5月15日か16日か、など日数がわずかに違うだけで、その月のエアドロをもらえるか否かが決まってしまうなど）
        }
    }
}