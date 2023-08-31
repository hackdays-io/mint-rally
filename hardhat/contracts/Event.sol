// SPDX-License-Identifier: MIT
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
        bool useMtx;
    }

    using Counters for Counters.Counter;

    Counters.Counter private _eventRecordIds;
    Counters.Counter private _groupIds;

    Group[] private groups;
    EventRecord[] private eventRecords;

    mapping(address => uint256[]) private ownGroupIds;
    mapping(uint256 => uint256[]) private eventIdsByGroupId;
    mapping(uint256 => uint256) private groupIdByEventId;

    // Mint nft contract address
    address private mintNFTAddr;
    // Relayer address for meta transaction
    address private relayerAddr;
    // price for mtx per mint. required gas * margin * gas limit multipler
    uint256 private mtxPrice;
    // max mint limit
    uint256 private maxMintLimit;

    modifier onlyGroupOwner(uint256 _groupId) {
        bool _isGroupOwner = false;
        for (uint256 _i = 0; _i < ownGroupIds[msg.sender].length; _i++) {
            if (ownGroupIds[msg.sender][_i] == _groupId) {
                _isGroupOwner = true;
            }
        }
        require(_isGroupOwner, "You are not group owner");
        _;
    }

    function setMintNFTAddr(address _mintNftAddr) public onlyOwner {
        require(_mintNftAddr != address(0), "mint nft address is blank");
        mintNFTAddr = _mintNftAddr;
    }

    function setRelayerAddr(address _relayerAddr) public onlyOwner {
        require(_relayerAddr != address(0), "relayer address is blank");
        relayerAddr = _relayerAddr;
    }

    function setMtxPrice(uint256 _price) public onlyOwner {
        mtxPrice = _price;
    }

    function setMaxMintLimit(uint256 _mintLimit) public onlyOwner {
        require(_mintLimit != 0, "mint limit is 0");
        maxMintLimit = _mintLimit;
    }

    event CreateGroup(address indexed owner, uint256 groupId);
    event CreateEvent(address indexed owner, uint256 eventId);

    function initialize(
        address _relayerAddr,
        uint256 _mtxPrice,
        uint256 _maxMintLimit
    ) public initializer {
        __Ownable_init();
        _groupIds.increment();
        _eventRecordIds.increment();
        setRelayerAddr(_relayerAddr);
        setMtxPrice(_mtxPrice);
        setMaxMintLimit(_maxMintLimit);
    }

    function createGroup(string memory _name) external {
        uint256 _newGroupId = _groupIds.current();
        _groupIds.increment();

        groups.push(
            Group({groupId: _newGroupId, ownerAddress: msg.sender, name: _name})
        );
        ownGroupIds[msg.sender].push(_newGroupId);

        emit CreateGroup(msg.sender, _newGroupId);
    }

    function getGroups() public view returns (Group[] memory) {
        uint256 _numberOfGroups = groups.length;
        Group[] memory _groups = new Group[](_numberOfGroups);
        _groups = groups;
        return _groups;
    }

    function getOwnGroups(
        address _address
    ) public view returns (Group[] memory) {
        uint256 _numberOfOwnGroups = ownGroupIds[_address].length;
        uint256 _numberOfAllGroups = groups.length;

        Group[] memory _groups = new Group[](_numberOfOwnGroups);
        uint256 _count = 0;
        for (uint256 _i = 0; _i < _numberOfAllGroups; _i++) {
            if (groups[_i].ownerAddress == _address) {
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
        uint256 _mintLimit,
        bool _useMtx,
        bytes32 _secretPhrase,
        IMintNFT.NFTAttribute[] memory _eventNFTAttributes
    ) external payable onlyGroupOwner(_groupId) {
        require(
            _mintLimit > 0 && _mintLimit <= maxMintLimit,
            "mint limit is invalid"
        );

        if (_useMtx) {
            uint256 depositPrice = (_mintLimit * tx.gasprice * mtxPrice);
            require(msg.value >= depositPrice, "Not enough value");
            (bool success, ) = (relayerAddr).call{value: msg.value}("");
            require(success, "transfer failed");
        }

        uint256 _newEventId = _eventRecordIds.current();
        _eventRecordIds.increment();

        eventRecords.push(
            EventRecord({
                eventRecordId: _newEventId,
                groupId: _groupId,
                name: _name,
                description: _description,
                date: _date,
                useMtx: _useMtx
            })
        );

        IMintNFT _mintNFT = IMintNFT(mintNFTAddr);
        _mintNFT.setEventInfo(
            _newEventId,
            _mintLimit,
            _secretPhrase,
            _eventNFTAttributes
        );

        eventIdsByGroupId[_groupId].push(_newEventId);
        groupIdByEventId[_newEventId] = _groupId;

        emit CreateEvent(msg.sender, _newEventId);
    }

    function getEventRecordCount() public view returns (uint256) {
        return eventRecords.length;
    }

    function getEventRecords(
        uint256 _limit,
        uint256 _offset
    ) public view returns (EventRecord[] memory) {
        uint256 _numberOfEventRecords = eventRecords.length;
        if (_limit == 0) {
            _limit = 100; // default limit
        }
        require(_limit <= 100, "limit is too large");
        // if limit is over the number of events, set limit to the number of events
        if (_limit + _offset > _numberOfEventRecords) {
            _limit = _numberOfEventRecords - _offset;
        }
        // create array of events
        EventRecord[] memory _eventRecords = new EventRecord[](_limit);

        // slice array of events by offset and limit
        for (uint256 i = 0; i < _limit; i++) {
            if (_numberOfEventRecords - (_offset + i + 1) >= 0) {
                _eventRecords[i] = eventRecords[
                    _numberOfEventRecords - (_offset + i + 1)
                ];
            }
        }
        return _eventRecords;
    }

    function getEventById(
        uint256 _eventId
    ) external view returns (EventRecord memory) {
        uint256 _eventRecordIndex = _eventId - 1;
        EventRecord memory _eventRecord = eventRecords[_eventRecordIndex];
        return _eventRecord;
    }

    function isGroupOwnerByEventId(
        address _address,
        uint256 _eventId
    ) public view returns (bool) {
        uint256 _groupId = groupIdByEventId[_eventId];
        bool isGroupOwner = false;
        for (uint256 _i = 0; _i < ownGroupIds[_address].length; _i++) {
            if (ownGroupIds[_address][_i] == _groupId) {
                isGroupOwner = true;
            }
        }
        return isGroupOwner;
    }
}
