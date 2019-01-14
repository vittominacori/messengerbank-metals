pragma solidity ^0.4.25;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";
import "eth-token-recover/contracts/TokenRecover.sol";

/**
 * @title MBMToken
 * @dev Implementation of the MBMToken
 */
contract MBMToken is ERC20Detailed, ERC20Mintable, ERC20Burnable, TokenRecover {

  event MintFinished();

  // indicates if minting is finished
  bool private _mintingFinished = false;

  /**
   * @dev Tokens can be minted only before minting finished
   */
  modifier canMint() {
    require(!_mintingFinished);
    _;
  }

  /**
   * @param name Name of the token
   * @param symbol A symbol to be used as ticker
   * @param decimals Number of decimals. All the operations are done using the smallest and indivisible token unit
   * @param initialSupply Initial token supply
   */
  constructor(
    string name,
    string symbol,
    uint8 decimals,
    uint256 initialSupply
  )
    ERC20Detailed(name, symbol, decimals)
    public
  {
    if (initialSupply > 0) {
      _mint(owner(), initialSupply);
    }
  }

  /**
   * @return if minting is finished or not
   */
  function mintingFinished() public view returns (bool) {
    return _mintingFinished;
  }

  /**
   * @dev Function to mint tokens
   * @param to The address that will receive the minted tokens.
   * @param value The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */
  function mint(address to, uint256 value) public canMint returns (bool) {
    return super.mint(to, value);
  }

  /**
   * @dev Function to disable minting
   */
  function finishMinting() public onlyOwner canMint {
    _mintingFinished = true;
    emit MintFinished();
  }

  /**
   * @dev Add the `minter` role to an address
   * @param account Address you want to add the role
   */
  function addMinter(address account) public onlyOwner {
    _addMinter(account);
  }

  /**
   * @dev Remove the `minter` role from address
   * @param account Address you want to remove role
   */
  function removeMinter(address account) public onlyOwner {
    _removeMinter(account);
  }
}
