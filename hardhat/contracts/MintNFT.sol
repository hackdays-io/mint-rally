//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./lib/Base64.sol";

contract MintNFT is ERC721Enumerable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct ParticipateNFTAttributes {
        string name;
        string image;
        uint256 groupId;
        uint256 eventId;
        uint256 requiredParticipateCount;
    }

    mapping(uint256 => ParticipateNFTAttributes) public attributesOfNFT;
    mapping(uint256 => ParticipateNFTAttributes[]) private groupsNFTAttributes;

    constructor() ERC721("MintRally", "MR") {}

    function mintParticipateNFT(
        uint256 _groupId,
        uint256 _eventId,
        uint256 _participateCount
    ) external {
        ParticipateNFTAttributes[]
            memory groupNFTAttributes = groupsNFTAttributes[_groupId];

        bool minted = false;
        ParticipateNFTAttributes memory defaultNFT;
        for (uint256 index = 0; index < groupNFTAttributes.length; index++) {
            ParticipateNFTAttributes memory gp = groupNFTAttributes[index];
            gp.eventId = _eventId;
            if (gp.requiredParticipateCount == 0) {
                defaultNFT = gp;
            }
            if (gp.requiredParticipateCount == _participateCount) {
                attributesOfNFT[_tokenIds.current()] = gp;
                _safeMint(msg.sender, _tokenIds.current());
                minted = true;
            }
        }
        if (!minted) {
            attributesOfNFT[_tokenIds.current()] = defaultNFT;
            _safeMint(msg.sender, _tokenIds.current());
        }
        _tokenIds.increment();
    }

    function getOwnedNFTs()
        public
        view
        returns (ParticipateNFTAttributes[] memory)
    {
        uint256 tokenCount = balanceOf(msg.sender);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        for (uint256 i = 0; i < tokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex((msg.sender), i);
        }

        ParticipateNFTAttributes[]
            memory holdingNFTsAttributes = new ParticipateNFTAttributes[](
                tokenCount
            );
        for (uint256 i = 0; i < tokenCount; i++) {
            uint256 id = tokenIds[i];
            holdingNFTsAttributes[i] = attributesOfNFT[id];
        }
        return holdingNFTsAttributes;
    }

    function pushGroupNFTAttributes(
        uint256 groupId,
        ParticipateNFTAttributes[] memory attributes
    ) external {
        for (uint256 index = 0; index < attributes.length; index++) {
            groupsNFTAttributes[groupId].push(
                ParticipateNFTAttributes({
                    name: attributes[index].name,
                    image: attributes[index].image,
                    groupId: attributes[index].groupId,
                    eventId: attributes[index].eventId,
                    requiredParticipateCount: attributes[index]
                        .requiredParticipateCount
                })
            );
        }
    }

    function getGroupNFTAttributes(uint256 _groupId)
        external
        view
        returns (ParticipateNFTAttributes[] memory)
    {
        return groupsNFTAttributes[_groupId];
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        ParticipateNFTAttributes memory attributes = attributesOfNFT[_tokenId];

        string memory json = Base64.encode(
            abi.encodePacked(
                "{'name': '",
                attributes.name,
                " -- NFT #: ",
                Strings.toString(_tokenId),
                "', 'description': 'MintRally NFT', 'image': '",
                attributes.image,
                "}"
            )
        );

        string memory output = string(
            abi.encodePacked("data:application/json;base64,", json)
        );
        return output;
    }
}
