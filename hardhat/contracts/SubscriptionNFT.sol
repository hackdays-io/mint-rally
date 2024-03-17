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
    mapping(uint256 => AirDropInfo) private airDropInfos;

    struct AirDropInfo {
        uint256[] dates;
        uint256 dropIndex;
    }

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

    function mintNFT(address recipient, string memory tokenURI, AirDropInfo calldata airDropInfo)
        public onlyRole(MINTER_ROLE)
        returns (uint256)
    {

        _tokenIds++;
        uint256 newItemId = _tokenIds;

        airDropInfos[newItemId] = airDropInfo;

        _setTokenURI(newItemId, tokenURI);
        _mint(recipient, newItemId);

        return newItemId;
    }

    function airdrop() public onlyRole(MINTER_ROLE) {
        for (uint256 i = 1; i <= _tokenIds; i++) {
            AirDropInfo memory airDropInfo = airDropInfos[i];
            if (airDropInfo.dates[airDropInfo.dropIndex] > block.timestamp) {
                address owner = ownerOf(i);
                IMintPoint(mintPointAddr).mintByMinter(owner, 1, 1000);
            }
            airDropInfos[i].dropIndex++;
        }
    }
}