//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MintNFT is ERC721Enumerable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct ParticipateNFTAttributes {
        string name;
        string groupId;
        string eventId;
    }

    ParticipateNFTAttributes[] participateNFTs;

    mapping(uint256 => ParticipateNFTAttributes) public attributesOfNFT;

    constructor() ERC721("MintRally", "MR") {
        console.log("ok");
    }

    function mintParticipateNFT(string memory eventId) external {
        for (uint256 index = 0; index < participateNFTs.length; index++) {
            ParticipateNFTAttributes memory p = participateNFTs[index];
            if (keccak256(bytes(p.eventId)) == keccak256(bytes(eventId))) {
                attributesOfNFT[_tokenIds.current()] = p;
                _safeMint(msg.sender, _tokenIds.current());
                _tokenIds.increment();
                break;
            }
        }
    }

    function checkOwnedNFTsId()
        external
        view
        returns (ParticipateNFTAttributes[] memory)
    {
        uint256 tokenCount = balanceOf(msg.sender);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        for (uint256 i = 0; i < tokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex((msg.sender), i);
        }
        ParticipateNFTAttributes[] memory attributes = getTokens(
            tokenIds,
            msg.sender
        );
        return attributes;
    }

    function getTokens(uint256[] memory tokenIds, address _owner)
        internal
        view
        returns (ParticipateNFTAttributes[] memory)
    {
        uint256 holdingTokenCount = balanceOf(_owner);
        ParticipateNFTAttributes[]
            memory holdingNFTsAttributes = new ParticipateNFTAttributes[](
                holdingTokenCount
            );
        for (uint256 i = 0; i < holdingTokenCount; i++) {
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
                    groupId: attributes[index].groupId,
                    eventId: attributes[index].eventId
                })
            );
        }
        console.log(participateNFTs[0].name);
        console.log(participateNFTs[1].name);
        return _tokenIds.current();
    }
}
