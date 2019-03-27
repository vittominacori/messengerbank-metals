pragma solidity ^0.5.7;

import "eth-token-recover/contracts/TokenRecover.sol";
import "./MBMTimelock.sol";

/**
 * @title MBMLockBuilder
 * @author Vittorio Minacori (https://github.com/vittominacori)
 * @dev This contract will allow a owner to create new MBMTimelock
 */
contract MBMLockBuilder is TokenRecover {

    event LockCreated(address indexed timelock, address indexed beneficiary, uint256 releaseTime);

    // ERC20 basic token contract being held
    IERC20 private _token;

    /**
     * @param token Address of the token being distributed
     */
    constructor(IERC20 token) public {
        require(address(token) != address(0));

        _token = token;
    }

    /**
     * @param beneficiary Who will receive the tokens after they are released
     * @param releaseTime Timestamp when token release is enabled
     */
    function createLock(address beneficiary, uint256 releaseTime) external onlyOwner {
        MBMTimelock lock = new MBMTimelock(_token, beneficiary, releaseTime);

        emit LockCreated(address(lock), beneficiary, releaseTime);
    }

    /**
     * @return the token being held.
     */
    function token() public view returns (IERC20) {
        return _token;
    }
}
