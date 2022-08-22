//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "./MintNFTV2.sol";

contract MintNFTV3 is MintNFTV2 {
    bool initializedV3;
    string greetingV3;

    function initializeV3() public initializer {
        require(!initializedV3);
        initializedV3 = true;
        greetingV3 = "Hello, V2 World!";
    }

    function helloV3() public view returns (string memory) {
        require(initializedV3);
        return greetingV3;
    }

    function returnV1StateFromV3() public view returns (address) {
        return eventManagerAddr;
    }

    function returnV2StateFromv3() public view returns (string memory) {
        return greetingV2;
    }
}
