//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {IERC1155MetadataURI} from "@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol";
import {ContextUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {ERC165Upgradeable} from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {IERC1155MetadataURIView} from "./IERC1155MetadataURIView.sol";
import {IMintNFT} from "./IMintNFT.sol";
import {IEventManager} from "./IEvent.sol";

contract MintRallyViewer is Initializable, ContextUpgradeable, ERC165Upgradeable, IERC1155MetadataURIView, OwnableUpgradeable {
    address private mintManagerAddr;
    address private eventManagerAddr;

    // struct NFTAttribute {
    //     string metaDataURL;
    //     uint256 requiredParticipateCount;
    // }

    function initialize(
        address _owner,
        address _mintManagerAddr,
        address _eventManagerAddr
    ) public initializer {
        __Context_init();
        __ERC165_init();
        __Ownable_init();
        _transferOwnership(_owner);
        mintManagerAddr = _mintManagerAddr;
        eventManagerAddr = _eventManagerAddr;
    }
    
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165Upgradeable, IERC1155MetadataURIView) returns (bool) {
        return
            interfaceId == type(IERC1155).interfaceId ||
            interfaceId == type(IERC1155MetadataURI).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function balanceOf(address account, uint256 id) external view override returns (uint256) {
        return _balanceOf(account, id);
    }

    function balanceOfBatch(address[] calldata accounts, uint256[] calldata ids) external view override returns (uint256[] memory) {
        if (accounts.length != ids.length) {
            revert ERC1155InvalidArrayLength(ids.length, accounts.length);
        }
        uint256[] memory batchBalances = new uint256[](accounts.length);

        for (uint256 i = 0; i < accounts.length; ++i) {
            batchBalances[i] = _balanceOf(accounts[i], ids[i]);
        }

        return batchBalances;
    }

    function _balanceOf(address account, uint256 id) internal view returns (uint256) {
        bool isHolidingEventNFT = IMintNFT(mintManagerAddr).isHoldingEventNFTByAddress(account, id);
        if (isHolidingEventNFT) {
            return 1;
        } else {
            return 0;
        }
    }

    function uri(uint256 id) external view override returns (string memory) {
        IMintNFT.NFTAttribute[] memory attributes = IMintNFT(mintManagerAddr).getNFTAttributeRecordsByEventId(id, 1, 0);

        return attributes[0].metaDataURL;
    }
}