pragma solidity ^0.5.7;

import "openzeppelin-solidity/contracts/token/ERC20/TokenTimelock.sol";

/**
 * @title MBMTimelock
 * @dev Extends from TokenTimelock which is a token holder contract that will allow a
 *  beneficiary to extract the tokens after a given release time
 */
contract MBMTimelock is TokenTimelock {

    // A text string to add a note
    string private _note;

    /**
     * @param token Address of the token being distributed
     * @param beneficiary Who will receive the tokens after they are released
     * @param releaseTime Timestamp when token release is enabled
     * @param note A text string to add a note
     */
    constructor(
        IERC20 token,
        address beneficiary,
        uint256 releaseTime,
        string memory note
    )
        public
        TokenTimelock(token, beneficiary, releaseTime)
    {
        _note = note;
    }

    /**
     * @return the timelock note.
     */
    function note() public view returns (string memory) {
        return _note;
    }
}
