//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "./MintNFT.sol";
import "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/metatx/MinimalForwarderUpgradeable.sol";

contract MintNFTV2 is
    MintNFT,
    ERC2771ContextUpgradeable,
    MinimalForwarderUpgradeable
{
    event Minted(address indexed to, uint256 indexed tokenId);
    bool initializedV2;

    constructor(MinimalForwarderUpgradeable forwarder)
        ERC2771ContextUpgradeable(address(forwarder))
    {}

    function initializeV2() public initializer {
        require(!initializedV2, "already initialized");
        initializedV2 = true;
    }

    function _msgSender()
        internal
        view
        virtual
        override(MintNFT, ERC2771ContextUpgradeable)
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
        override(MintNFT, ERC2771ContextUpgradeable)
        returns (bytes calldata)
    {
        if (isTrustedForwarder(msg.sender)) {
            return msg.data[:msg.data.length - 20];
        } else {
            return super._msgData();
        }
    }

    // TODO: intParticipateNFTにemit Mintedを追加する
}
