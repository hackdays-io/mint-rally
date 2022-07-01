// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract EventManager {
    struct Group {
        uint256 groupId;
        string name;
    }

    using Counters for Counters.Counter;

    Counters.Counter private _eventIds;
    Counters.Counter private _groupIds;

    Group[] public groups;

    constructor() {
        console.log("init");
    }

    function createGroup(string memory _name) external {
        uint256 _newGroupId = _groupIds.current();
        groups.push(Group({groupId: _newGroupId, name: _name}));
        _groupIds.increment();
    }

    function getGroups() public view returns (Group[] memory) {
        uint256 _numberOfGroups = groups.length;
        console.log("number of groups: %s", _numberOfGroups);
        // create array of groups
        Group[] memory _groups = new Group[](_numberOfGroups);
        _groups = groups;
        return _groups;
    }
}
