// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IMintPoint {

    event Register(address indexed account, uint256 indexed id);
    event Mint(address indexed account, uint256 indexed id);
    event Transfer(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values, uint256 timestamp);


    function supportsInterface(bytes4 interfaceId) external view returns (bool);

    function register() external;

    function mint(address to, uint256 id) external;

    function burn(uint256 tokenId) external;
}