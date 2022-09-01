//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./IEvent.sol";

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
    // NFT attributes via hash of participateCount and groupId
    mapping(bytes32 => string) private nftAttributes;

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

        bool holdingEventNFT = isHoldingEventNFT[
            getAddressUint256Hash(_msgSender(), _eventId)
        ];
        require(!holdingEventNFT, "already minted NFT on event");
        isHoldingEventNFT[getAddressUint256Hash(_msgSender(), _eventId)] = true;

        uint256 participationCount = countOfParticipation[
            getAddressUint256Hash(_msgSender(), _groupId)
        ];

        string memory metaDataURL = nftAttributes[
            getDoubleUint256Hash(_groupId, 0)
        ];
        string memory specialMetaDataURL = nftAttributes[
            getDoubleUint256Hash(_groupId, participationCount)
        ];
        if (
            keccak256(abi.encodePacked(specialMetaDataURL)) !=
            keccak256(abi.encodePacked(""))
        ) {
            metaDataURL = specialMetaDataURL;
        }

        nftMetaDataURL[_tokenIds.current()] = metaDataURL;
        _safeMint(_msgSender(), _tokenIds.current());
        _tokenIds.increment();
        return metaDataURL;
    }

    function pushGroupNFTAttributes(
        uint256 _groupId,
        NFTAttribute[] memory attributes
    ) external {
        for (uint256 index = 0; index < attributes.length; index++) {
            nftAttributes[
                getDoubleUint256Hash(
                    _groupId,
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

    function getAddressUint256Hash(address _address, uint256 _id)
        private
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_address, _id));
    }

    function getDoubleUint256Hash(uint256 _arg1, uint256 _arg2)
        private
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_arg1, _arg2));
    }
}
