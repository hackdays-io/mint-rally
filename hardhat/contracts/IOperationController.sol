//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IOperationController {
    function paused() external view returns (bool);
}
