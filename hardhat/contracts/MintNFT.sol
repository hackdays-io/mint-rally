//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./IEvent.sol";
import "./lib/Hashing.sol";

contract MintNFT is ERC721EnumerableUpgradeable, OwnableUpgradeable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    address private eventManagerAddr;

    function setEventManagerAddr(address _eventManagerAddr) public onlyOwner {
        require(
            _eventManagerAddr != address(0),
            "event manager address is blank"
        );
        eventManagerAddr = _eventManagerAddr;
    }

    struct NFTAttribute {
        string metaDataURL;
        uint256 requiredParticipateCount;
    }

    // NFT meta data url via tokenId
    mapping(uint256 => string) private nftMetaDataURL;
    // Holding NFT via hash of eventId and address
    mapping(bytes32 => bool) private isHoldingEventNFT;
    // Participate count via hash of groupId and address hash
    mapping(bytes32 => uint256) private countOfParticipation;
    // NFT attribute location (ex. ipfs, centralized storage) via hash of participateCount, eventId
    mapping(bytes32 => string) private eventNftAttributes;

    function initialize() public initializer {
        __ERC721_init("MintRally", "MR");
        __Ownable_init();
    }

    function _msgSender() internal view virtual override returns (address) {
        return super._msgSender();
    }

    function _msgData()
        internal
        view
        virtual
        override
        returns (bytes calldata)
    {
        return super._msgData();
    }

    function mintParticipateNFT(
        uint256 _groupId,
        uint256 _eventId,
        string memory _secretPhrase
    ) external returns (string memory) {
        IEventManager _eventManager = IEventManager(eventManagerAddr);
        require(
            _eventManager.verifySecretPhrase(_secretPhrase, _eventId),
            "invalid secret phrase"
        );

        bytes32 eventHash = Hashing.hashingAddressUint256(
            _msgSender(),
            _eventId
        );
        bool holdingEventNFT = isHoldingEventNFT[eventHash];
        require(!holdingEventNFT, "already minted");
        isHoldingEventNFT[eventHash] = true;

        bytes32 groupHash = Hashing.hashingAddressUint256(
            _msgSender(),
            _groupId
        );
        uint256 participationCount = countOfParticipation[groupHash];

        string memory metaDataURL = eventNftAttributes[
            Hashing.hashingDoubleUint256(_eventId, 0)
        ];
        string memory specialMetaDataURL = eventNftAttributes[
            Hashing.hashingDoubleUint256(_eventId, participationCount)
        ];
        if (
            keccak256(abi.encodePacked(specialMetaDataURL)) !=
            keccak256(abi.encodePacked(""))
        ) {
            metaDataURL = specialMetaDataURL;
        }

        nftMetaDataURL[_tokenIds.current()] = metaDataURL;
        _safeMint(_msgSender(), _tokenIds.current());
        countOfParticipation[groupHash] = participationCount + 1;
        _tokenIds.increment();
        return metaDataURL;
    }

    function pushEventNFTAttributes(
        uint256 _eventId,
        NFTAttribute[] memory attributes
    ) external {
        require(_msgSender() == eventManagerAddr, "unauthorized");
        for (uint256 index = 0; index < attributes.length; index++) {
            eventNftAttributes[
                Hashing.hashingDoubleUint256(
                    _eventId,
                    attributes[index].requiredParticipateCount
                )
            ] = attributes[index].metaDataURL;
        }
    }

    function burn(uint256 tokenId) public onlyOwner {
        _burn(tokenId);
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        string memory metaDataURL = nftMetaDataURL[_tokenId];
        return metaDataURL;
    }
}
