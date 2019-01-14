const shouldFail = require('openzeppelin-solidity/test/helpers/shouldFail');
const { ether } = require('openzeppelin-solidity/test/helpers/ether');

const { shouldBehaveLikeERC20Mintable } = require('openzeppelin-solidity/test/token/ERC20/behaviors/ERC20Mintable.behavior'); // eslint-disable-line max-len
const { shouldBehaveLikeERC20Burnable } = require('openzeppelin-solidity/test/token/ERC20/behaviors/ERC20Burnable.behavior'); // eslint-disable-line max-len
const { shouldBehaveLikeOwnable } = require('openzeppelin-solidity/test/ownership/Ownable.behavior');
const { shouldBehaveLikeTokenRecover } = require('eth-token-recover/test/TokenRecover.behaviour');

const { shouldBehaveLikeERC20Detailed } = require('./behaviours/ERC20Detailed.behaviour');
const { shouldBehaveLikeERC20 } = require('./behaviours/ERC20.behaviour');
const { shouldBehaveLikePublicRole } = require('../access/roles/PublicRole.behavior');

const MBMToken = artifacts.require('MBMToken');

contract('MBMToken', function ([owner, anotherAccount, minter, recipient, thirdParty]) {
  const _name = 'MessengerBank Metals';
  const _symbol = 'MBM';
  const _decimals = 18;
  const _initialSupply = 1000000;

  context('creating a valid token', function () {
    describe('without initial supply', function () {
      beforeEach(async function () {
        this.token = await MBMToken.new(_name, _symbol, _decimals, 0, { from: owner });
      });

      describe('once deployed', function () {
        it('total supply should be equal to zero', async function () {
          (await this.token.totalSupply()).should.be.bignumber.equal(0);
        });

        it('owner balance should be equal to zero', async function () {
          (await this.token.balanceOf(owner)).should.be.bignumber.equal(0);
        });
      });
    });

    describe('with initial supply', function () {
      beforeEach(async function () {
        this.token = await MBMToken.new(_name, _symbol, _decimals, _initialSupply, { from: owner });
      });

      describe('once deployed', function () {
        it('total supply should be equal to initial supply', async function () {
          (await this.token.totalSupply()).should.be.bignumber.equal(_initialSupply);
        });

        it('owner balance should be equal to initial supply', async function () {
          (await this.token.balanceOf(owner)).should.be.bignumber.equal(_initialSupply);
        });
      });
    });
  });

  context('testing behaviours', function () {
    beforeEach(async function () {
      this.token = await MBMToken.new(_name, _symbol, _decimals, _initialSupply, { from: owner });
    });

    context('like a ERC20Detailed', function () {
      shouldBehaveLikeERC20Detailed(_name, _symbol, _decimals);
    });

    context('like a ERC20Mintable', function () {
      beforeEach(async function () {
        await this.token.addMinter(minter, { from: owner });
      });

      shouldBehaveLikeERC20Mintable(minter, [anotherAccount]);
    });

    context('like a ERC20Burnable', function () {
      beforeEach(async function () {
        await this.token.addMinter(minter, { from: owner });
      });

      shouldBehaveLikeERC20Burnable(owner, _initialSupply, [owner]);
    });

    context('like a ERC20', function () {
      beforeEach(async function () {
        await this.token.addMinter(minter, { from: owner });
      });

      shouldBehaveLikeERC20([owner, anotherAccount, recipient], _initialSupply);
    });

    context('like a MBMToken', function () {
      describe('if someone sends ether', function () {
        it('reverts', async function () {
          await shouldFail.reverting(this.token.send(ether(1)));
        });
      });

      context('before finish minting', function () {
        it('mintingFinished should be false', async function () {
          (await this.token.mintingFinished()).should.be.equal(false);
        });
      });

      context('calling finish minting', function () {
        describe('if an authorized account is calling', function () {
          it('should success', async function () {
            await this.token.finishMinting({ from: owner });
          });
        });

        describe('if an unauthorized account is calling', function () {
          it('reverts', async function () {
            await shouldFail.reverting(this.token.finishMinting({ from: minter }));
            await shouldFail.reverting(this.token.finishMinting({ from: thirdParty }));
          });
        });
      });

      context('after finish minting', function () {
        beforeEach(async function () {
          await this.token.finishMinting({ from: owner });
        });

        it('mintingFinished should be true', async function () {
          (await this.token.mintingFinished()).should.be.equal(true);
        });

        it('should fail to mint other tokens', async function () {
          await this.token.addMinter(minter, { from: owner });
          await shouldFail.reverting(this.token.mint(owner, _initialSupply, { from: minter }));
        });
      });

      context('testing ownership', function () {
        beforeEach(async function () {
          this.ownable = this.token;
        });

        shouldBehaveLikeOwnable(owner, [thirdParty]);
      });

      context('testing roles', function () {
        beforeEach(async function () {
          await this.token.addMinter(minter, { from: owner });
          this.contract = this.token;
        });

        shouldBehaveLikePublicRole(owner, minter, [thirdParty], 'minter');
      });
    });

    context('like a TokenRecover', function () {
      beforeEach(async function () {
        this.instance = this.token;
      });

      shouldBehaveLikeTokenRecover([owner, thirdParty]);
    });
  });
});
