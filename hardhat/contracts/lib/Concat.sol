// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

library Concat {
    function concatString(
        string memory str1,
        string memory str2,
        string memory str3
    ) internal pure returns (string memory) {
        bytes memory strbyte1 = bytes(str1);
        bytes memory strbyte2 = bytes(str2);
        bytes memory strbyte3 = bytes(str3);
        bytes memory str = new bytes(
            strbyte1.length + strbyte2.length + strbyte3.length
        );
        uint8 point = 0;
        for (uint8 j = 0; j < strbyte1.length; j++) {
            str[point] = strbyte1[j];
            point++;
        }
        for (uint8 k = 0; k < strbyte2.length; k++) {
            str[point] = strbyte2[k];
            point++;
        }
        for (uint8 k = 0; k < strbyte3.length; k++) {
            str[point] = strbyte3[k];
            point++;
        }
        return string(str);
    }
}
