pragma solidity ^0.5.7;

import "openzeppelin-solidity/contracts/token/ERC20/TokenTimelock.sol";

/**
 * @title MBMTimelock
 * @author Vittorio Minacori (https://github.com/vittominacori)
 * @dev Extends from TokenTimelock which is a token holder contract that will allow a
 *  beneficiary to extract the tokens after a given release time
 */
contract MBMTimelock is TokenTimelock {

    /**
     * @param token Address of the token being distributed
     * @param beneficiary Who will receive the tokens after they are released
     * @param releaseTime Timestamp when token release is enabled
     */
    constructor(
        IERC20 token,
        address beneficiary,
        uint256 releaseTime
    )
        public
        TokenTimelock(token, beneficiary, releaseTime)
    {} // solhint-disable-line no-empty-blocks
}
