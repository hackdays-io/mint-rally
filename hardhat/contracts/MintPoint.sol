// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/Base64.sol";
import {ERC1155Upgradeable, ERC1155SupplyUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";
import {AccessControlEnumerableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/metatx/MinimalForwarderUpgradeable.sol";
import "./ERC2771ContextUpgradeable.sol";
import {IMintPoint} from "./IMintPoint.sol";

contract MintPoint is
    ERC1155SupplyUpgradeable,
    AccessControlEnumerableUpgradeable,
    ERC2771ContextUpgradeable,
    IMintPoint
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    uint256 public tokenIds;
    string public name;
    string public symbol;

    function initialize(MinimalForwarderUpgradeable _trustedForwarder) public initializer {
        __ERC1155_init("");
        __ERC1155Supply_init();
        __AccessControlEnumerable_init();
        __ERC2771Context_init(address(_trustedForwarder));

        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(MINTER_ROLE, _msgSender());

        name = "MintPoint";
        symbol = "MNT";
        _register();
        _register();
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(
            AccessControlEnumerableUpgradeable,
            IMintPoint,
            ERC1155Upgradeable
        )
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function isApprovedForAll(
        address account,
        address operator
    ) public view override(ERC1155Upgradeable) returns (bool) {
        return super.isApprovedForAll(account, operator);
    }

    function mintByMinter(
        address to,
        uint256 tokenId,
        uint256 amount
    ) external onlyRole(MINTER_ROLE) {
        require(tokenId < tokenIds, "MintPoint: tokenId is not registered.");
        _mint(to, tokenId, amount, "");

        emit MintByMinter(to, tokenId);
    }

    function mintForReferral(address to, uint256 amount) external {
        require(amount < balanceOf(_msgSender(), 0), "MintPoint: not enough.");

        _burn(_msgSender(), 0, amount);

        _mint(to, 1, amount, "");

        emit MintForReferral(_msgSender(), to, 1);
    }

    function register() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _register();
    }

    function _register() internal {
        uint256 tokenId = tokenIds;

        tokenIds++;

        emit Register(_msgSender(), tokenId);
    }

    function burn(uint256 tokenId, uint256 amount) external {
        require(tokenId < tokenIds, "MintPoint: tokenId is not registered.");
        require(
            balanceOf(_msgSender(), tokenId) >= amount,
            "MintPoint: not minted."
        );
        _burn(_msgSender(), tokenId, amount);
    }

    function _msgSender()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (address sender)
    {
        if (isTrustedForwarder(msg.sender)) {
            // The assembly code is more direct than the Solidity version using `abi.decode`.
            /// @solidity memory-safe-assembly
            assembly {
                sender := shr(96, calldataload(sub(calldatasize(), 20)))
            }
        } else {
            return super._msgSender();
        }
    }

    function _msgData()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (bytes calldata)
    {
        if (isTrustedForwarder(msg.sender)) {
            return msg.data[:msg.data.length - 20];
        } else {
            return super._msgData();
        }
    }
}
