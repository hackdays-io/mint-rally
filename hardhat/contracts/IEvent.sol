// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IEventManager {
    function getIsMintLocked(uint256 _eventId) external view returns (bool);
}
