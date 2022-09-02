//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

interface IMintNFT {
    struct NFTAttribute {
        string metaDataURL;
        uint256 requiredParticipateCount;
    }

    function pushGroupNFTAttributes(
        uint256 groupId,
        NFTAttribute[] memory attributes
    ) external;
}
