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
        string imageURI;
        string groupId;
        string eventId;
        uint256 requiredParticipateCount;
    }

    ParticipateNFTAttributes[] participateNFTs;

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
                console.log("index", index);
                groupNFTs[index] = p;
                if (p.requiredParticipateCount == 0) {
                    defaultNFT = p;
                }
            }
        }

        console.log("nft names", defaultNFT.name);

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

    function checkOwnedNFTsId() external view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(msg.sender);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        for (uint256 i = 0; i < tokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex((msg.sender), i);
        }
        ParticipateNFTAttributes[] memory attributes = getTokens(
            tokenIds,
            msg.sender
        );
        return tokenIds;
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

        console.log("holding count", holdingTokenCount);
        for (uint256 i = 0; i < holdingTokenCount; i++) {
            uint256 id = tokenIds[i];
            console.log("name", attributesOfNFT[id].name);
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
                    imageURI: attributes[index].imageURI,
                    groupId: attributes[index].groupId,
                    eventId: attributes[index].eventId,
                    requiredParticipateCount: attributes[index]
                        .requiredParticipateCount
                })
            );
        }
        return _tokenIds.current();
    }
}
