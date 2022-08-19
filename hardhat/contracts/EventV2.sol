//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "./Event.sol";

contract EventManagerV2 is EventManager {
  bool initializedV2;
  
  function initializeV2() public initializer {
    require(!initializedV2);
    initializedV2 = true;
  }
}