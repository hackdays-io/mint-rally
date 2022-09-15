//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IMintNFT {
    struct NFTAttribute {
        string metaDataURL;
        uint256 requiredParticipateCount;
    }

    function approve(address to, uint256 tokenId) external;

    function balanceOf(address _owner) external view returns (uint256);

    function burn(uint256 tokenId) external;

    function getApproved(uint256 tokenId) external view returns (address);

    function initialize() external;

    function isApprovedForAll(address _owner, address operator)
        external
        view
        returns (bool);

    function mintParticipateNFT(
        uint256 _groupId,
        uint256 _eventId,
        string memory _secretPhrase
    ) external returns (string memory);

    function name() external view returns (string memory);

    function owner() external view returns (address);

    function ownerOf(uint256 tokenId) external view returns (address);

    function setEventInfo(
        uint256 _eventId,
        uint256 _mintLimit,
        bytes32 _secretPhrase,
        NFTAttribute[] memory attributes
    ) external;

    function renounceOwnership() external;

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) external;

    function setApprovalForAll(address operator, bool approved) external;

    function setEventManagerAddr(address _eventManagerAddr) external;

    function supportsInterface(bytes4 interfaceId) external view returns (bool);

    function symbol() external view returns (string memory);

    function tokenByIndex(uint256 index) external view returns (uint256);

    function tokenOfOwnerByIndex(address _owner, uint256 index)
        external
        view
        returns (uint256);

    function tokenURI(uint256 _tokenId) external view returns (string memory);

    function totalSupply() external view returns (uint256);

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;

    function transferOwnership(address newOwner) external;
}
