//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/metatx/MinimalForwarderUpgradeable.sol";
import "./lib/Hashing.sol";
import "./ERC2771ContextUpgradeable.sol";
import "./IEvent.sol";
import "./ISecretPhraseVerifier.sol";

contract MintNFT is
    ERC721EnumerableUpgradeable,
    ERC2771ContextUpgradeable,
    OwnableUpgradeable,
    PausableUpgradeable
{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    address private eventManagerAddr;

    function setEventManagerAddr(address _addr) public onlyOwner {
        require(_addr != address(0), "event manager address is blank");
        eventManagerAddr = _addr;
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
    // remaining mint count of Event
    mapping(uint256 => uint256) private remainingEventNftCount;
    // secretPhrase via EventId
    mapping(uint256 => bytes32) private eventSecretPhrases;
    // is mint locked via EventId
    mapping(uint256 => bool) private isMintLocked;

    address private secretPhraseVerifierAddr;

    event MintedNFTAttributeURL(address indexed holder, string url);
    event MintLocked(uint256 indexed eventId, bool isLocked);
    event ResetSecretPhrase(address indexed executor, uint256 indexed eventId);

    modifier onlyGroupOwner(uint256 _eventId) {
        IEventManager eventManager = IEventManager(eventManagerAddr);
        require(
            eventManager.isGroupOwnerByEventId(msg.sender, _eventId),
            "you are not event group owner"
        );
        _;
    }

    // Currently, reinitializer(3) was executed as constructor.
    function initialize(
        MinimalForwarderUpgradeable trustedForwarder,
        address _secretPhraseVerifierAddr
    ) public reinitializer(3) {
        __ERC721_init("MintRally", "MR");
        __Ownable_init();
        __ERC2771Context_init(address(trustedForwarder));
        secretPhraseVerifierAddr = _secretPhraseVerifierAddr;
        __Pausable_init();
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

    function mintParticipateNFT(
        uint256 _groupId,
        uint256 _eventId,
        uint256[24] memory _proof
    ) external whenNotPaused {
        canMint(_eventId, _proof);
        remainingEventNftCount[_eventId] = remainingEventNftCount[_eventId] - 1;

        ISecretPhraseVerifier secretPhraseVerifier = ISecretPhraseVerifier(
            secretPhraseVerifierAddr
        );
        secretPhraseVerifier.submitProof(_proof, _eventId);

        isHoldingEventNFT[
            Hashing.hashingAddressUint256(_msgSender(), _eventId)
        ] = true;

        bytes32 groupHash = Hashing.hashingAddressUint256(
            _msgSender(),
            _groupId
        );
        uint256 participationCount = countOfParticipation[groupHash];
        countOfParticipation[groupHash] = participationCount + 1;

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
        _tokenIds.increment();
        emit MintedNFTAttributeURL(_msgSender(), metaDataURL);
    }

    function canMint(
        uint256 _eventId,
        uint256[24] memory _proof
    ) public view returns (bool) {
        require(verifySecretPhrase(_proof, _eventId), "invalid secret phrase");
        require(
            remainingEventNftCount[_eventId] != 0,
            "remaining count is zero"
        );

        require(
            !isHoldingEventNFTByAddress(_msgSender(), _eventId),
            "already minted"
        );

        require(!isMintLocked[_eventId], "mint is locked");

        return true;
    }

    function changeMintLocked(
        uint256 _eventId,
        bool _locked
    ) external onlyGroupOwner(_eventId) whenNotPaused {
        isMintLocked[_eventId] = _locked;
        emit MintLocked(_eventId, _locked);
    }

    function resetSecretPhrase(
        uint256 _eventId,
        bytes32 _secretPhrase
    ) external onlyGroupOwner(_eventId) whenNotPaused {
        eventSecretPhrases[_eventId] = _secretPhrase;
        emit ResetSecretPhrase(_msgSender(), _eventId);
    }

    function getIsMintLocked(uint256 _eventId) external view returns (bool) {
        return isMintLocked[_eventId];
    }

    function isHoldingEventNFTByAddress(
        address _addr,
        uint256 _eventId
    ) public view returns (bool) {
        return
            isHoldingEventNFT[Hashing.hashingAddressUint256(_addr, _eventId)];
    }

    function setEventInfo(
        uint256 _eventId,
        uint256 _mintLimit,
        bytes32 _secretPhrase,
        NFTAttribute[] memory attributes
    ) external whenNotPaused {
        require(_msgSender() == eventManagerAddr, "unauthorized");
        remainingEventNftCount[_eventId] = _mintLimit;
        eventSecretPhrases[_eventId] = _secretPhrase;
        for (uint256 index = 0; index < attributes.length; index++) {
            eventNftAttributes[
                Hashing.hashingDoubleUint256(
                    _eventId,
                    attributes[index].requiredParticipateCount
                )
            ] = attributes[index].metaDataURL;
        }
    }

    function getRemainingNFTCount(
        uint256 _eventId
    ) external view returns (uint256) {
        return remainingEventNftCount[_eventId];
    }

    function burn(uint256 tokenId) public onlyOwner whenNotPaused {
        _burn(tokenId);
    }

    function tokenURI(
        uint256 _tokenId
    ) public view override returns (string memory) {
        string memory metaDataURL = nftMetaDataURL[_tokenId];
        return metaDataURL;
    }

    function verifySecretPhrase(
        uint256[24] memory _proof,
        uint256 _eventId
    ) internal view returns (bool) {
        ISecretPhraseVerifier secretPhraseVerifier = ISecretPhraseVerifier(
            secretPhraseVerifierAddr
        );
        uint256[1] memory publicInput = [uint256(eventSecretPhrases[_eventId])];
        bool result = secretPhraseVerifier.verifyProof(
            _proof,
            publicInput,
            _eventId
        );
        return result;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
