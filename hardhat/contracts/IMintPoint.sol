// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IMintPoint {

    event Register(address indexed account, uint256 indexed id);
    event MintByMinter(address indexed account, uint256 indexed id);
    event MintForReferral(address indexed from, address indexed to, uint256 indexed id);
    event Transfer(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values, uint256 timestamp);


    function supportsInterface(bytes4 interfaceId) external view returns (bool);

    function register() external;

    function mintByMinter(address to, uint256 id, uint256 amount) external;

    function mintForReferral(address to, uint256 amount) external;

    function burn(uint256 tokenId, uint256 amount) external;
}