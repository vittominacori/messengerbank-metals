pragma solidity ^0.5.7;

import "eth-token-recover/contracts/TokenRecover.sol";
import "./MBMTimelock.sol";

/**
 * @title MBMLockBuilder
 * @dev This contract will allow a owner to create new MBMTimelock
 */
contract MBMLockBuilder is TokenRecover {
    using SafeERC20 for IERC20;

    event LockCreated(address indexed timelock, address indexed beneficiary, uint256 releaseTime, uint256 amount);

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
     * @param amount The number of tokens to be locked for this contract
     * @param note A text string to add a note
     */
    function createLock(
        address beneficiary,
        uint256 releaseTime,
        uint256 amount,
        string calldata note
    )
        external
        onlyOwner
    {
        MBMTimelock lock = new MBMTimelock(_token, beneficiary, releaseTime, note);

        emit LockCreated(address(lock), beneficiary, releaseTime, amount);

        if (amount > 0) {
            _token.safeTransfer(address(lock), amount);
        }
    }

    /**
     * @return the token being held.
     */
    function token() public view returns (IERC20) {
        return _token;
    }
}
