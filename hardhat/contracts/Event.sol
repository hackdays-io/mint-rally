// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./IMintNFT.sol";

contract EventManager is OwnableUpgradeable {
    struct Group {
        uint256 groupId;
        address ownerAddress;
        string name;
    }

    struct EventRecord {
        uint256 eventRecordId;
        uint256 groupId;
        string name;
        string description;
        string date;
        string startTime;
        string endTime;
        bytes32 secretPhrase;
    }

    using Counters for Counters.Counter;

    Counters.Counter private _eventRecordIds;
    Counters.Counter private _groupIds;

    Group[] private groups;
    EventRecord[] private eventRecords;

    mapping(address => uint256[]) private ownGroupIds;
    mapping(uint256 => address[]) private participantAddresses;
    mapping(address => uint256[]) private participantGroupIds;
    mapping(address => uint256[]) private eventIdsByParticipant;
    mapping(uint256 => uint256[]) private eventIdsByGroupId;
    mapping(uint256 => uint256) private groupIdByEventId;

    address private mintNFTAddr;

    function setMintNFTAddr(address _mintNftAddr) public onlyOwner {
        require(_mintNftAddr != address(0), "mint nft address is blank");
        mintNFTAddr = _mintNftAddr;
    }

    function initialize() public initializer {
        __Ownable_init();
        _groupIds.increment();
        _eventRecordIds.increment();
    }

    function createGroup(string memory _name) external {
        uint256 _newGroupId = _groupIds.current();

        groups.push(
            Group({groupId: _newGroupId, ownerAddress: msg.sender, name: _name})
        );
        ownGroupIds[msg.sender].push(_newGroupId);
        _groupIds.increment();
    }

    function getGroups() public view returns (Group[] memory) {
        uint256 _numberOfGroups = groups.length;
        // create array of groups
        Group[] memory _groups = new Group[](_numberOfGroups);
        _groups = groups;
        return _groups;
    }

    function getOwnGroups() public view returns (Group[] memory) {
        uint256 _numberOfOwnGroups = ownGroupIds[msg.sender].length;
        uint256 _numberOfAllGroups = groups.length;

        Group[] memory _groups = new Group[](_numberOfOwnGroups);
        uint256 _count = 0;
        for (uint256 _i = 0; _i < _numberOfAllGroups; _i++) {
            if (groups[_i].ownerAddress == msg.sender) {
                _groups[_count] = groups[_i];
                _count++;
            }
        }
        return _groups;
    }

    function createEventRecord(
        uint256 _groupId,
        string memory _name,
        string memory _description,
        string memory _date,
        string memory _startTime,
        string memory _endTime,
        string memory _secretPhrase,
        IMintNFT.NFTAttribute[] memory _eventNFTAttributes
    ) external {
        bool _isGroupOwner = false;
        for (uint256 _i = 0; _i < ownGroupIds[msg.sender].length; _i++) {
            if (ownGroupIds[msg.sender][_i] == _groupId) {
                _isGroupOwner = true;
            }
        }
        require(_isGroupOwner, "You are not group owner");

        uint256 _newEventId = _eventRecordIds.current();
        bytes32 encryptedSecretPhrase = keccak256(bytes(_secretPhrase));
        eventRecords.push(
            EventRecord({
                eventRecordId: _newEventId,
                groupId: _groupId,
                name: _name,
                description: _description,
                date: _date,
                startTime: _startTime,
                endTime: _endTime,
                secretPhrase: encryptedSecretPhrase
            })
        );

        IMintNFT _mintNFT = IMintNFT(mintNFTAddr);
        _mintNFT.pushEventNFTAttributes(_newEventId, _eventNFTAttributes);

        eventIdsByGroupId[_groupId].push(_newEventId);
        groupIdByEventId[_newEventId] = _groupId;
        _eventRecordIds.increment();
    }

    function getEventRecords() public view returns (EventRecord[] memory) {
        uint256 _numberOfEventRecords = eventRecords.length;
        // create array of events
        EventRecord[] memory _eventRecords = new EventRecord[](
            _numberOfEventRecords
        );
        _eventRecords = eventRecords;
        return _eventRecords;
    }

    //申込みはregisterを別で作って管理したほうがいいかも。
    //これだと、applyしただけの人になってしまうので。
    function applyForParticipation(uint256 _eventRecordId) external {
        participantAddresses[_eventRecordId].push(msg.sender);
        eventIdsByParticipant[msg.sender].push(_eventRecordId);
        uint256 _groupId = groupIdByEventId[_eventRecordId];
        participantGroupIds[msg.sender].push(_groupId);
    }

    function getParticipationEventIds()
        external
        view
        returns (uint256[] memory)
    {
        uint256[] memory _eventIds = eventIdsByParticipant[msg.sender];
        return _eventIds;
    }

    function getEventById(uint256 _eventId)
        external
        view
        returns (EventRecord memory)
    {
        uint256 _eventRecordIndex = _eventId - 1;
        EventRecord memory _eventRecord = eventRecords[_eventRecordIndex];
        return _eventRecord;
    }

    function countParticipationByGroup(
        address _participantAddress,
        uint256 _groupId
    ) public view returns (uint256) {
        uint256 _numberOfGroupIds = participantGroupIds[_participantAddress]
            .length;
        uint256 _numberOfParticipations = 0;
        for (uint256 _i = 0; _i < _numberOfGroupIds; _i++) {
            if (participantGroupIds[_participantAddress][_i] == _groupId) {
                _numberOfParticipations++;
            }
        }
        return _numberOfParticipations;
    }

    function verifySecretPhrase(
        string memory _secretPhrase,
        uint256 _eventRecordId
    ) external view returns (bool) {
        bytes memory hexSecretPhrase = bytes(_secretPhrase);
        bytes32 encryptedSecretPhrase = keccak256(hexSecretPhrase);
        uint256 _indexOfEventRecord = _eventRecordId - 1;
        bool result = eventRecords[_indexOfEventRecord].secretPhrase ==
            encryptedSecretPhrase;
        return result;
    }

    function testConnection() external pure returns (string memory) {
        string memory testResult = "Test connection successful";
        return testResult;
    }
}
