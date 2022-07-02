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
        string groupId;
        string eventId;
        uint256 requiredParticipateCount;
    }

    ParticipateNFTAttributes[] internal participateNFTs;
    mapping(uint256 => ParticipateNFTAttributes) public attributesOfNFT;

    constructor() ERC721("MintRally", "MR") {}

    function mintParticipateNFT(
        string memory groupId,
        string memory secretPhrase
    ) external {
        require(1 == 1, "invalid secretPhrase");

        uint256 participateCount = 0;

        ParticipateNFTAttributes[]
            memory groupNFTs = new ParticipateNFTAttributes[](
                participateNFTs.length
            );
        ParticipateNFTAttributes memory defaultNFT;
        for (uint256 index = 0; index < participateNFTs.length; index++) {
            ParticipateNFTAttributes memory p = participateNFTs[index];
            if (keccak256(bytes(p.groupId)) == keccak256(bytes(groupId))) {
                groupNFTs[index] = p;
                if (p.requiredParticipateCount == 0) {
                    defaultNFT = p;
                }
            }
        }

        bool minted = false;

        for (uint256 index = 0; index < groupNFTs.length; index++) {
            ParticipateNFTAttributes memory gp = groupNFTs[index];
            if (gp.requiredParticipateCount == participateCount) {
                attributesOfNFT[_tokenIds.current()] = gp;
                _safeMint(msg.sender, _tokenIds.current());
                minted = true;
                break;
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

    function pushParticipateNFT(ParticipateNFTAttributes[] memory attributes)
        external
        returns (uint256)
    {
        for (uint256 index = 0; index < attributes.length; index++) {
            participateNFTs.push(
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
        return _tokenIds.current();
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
