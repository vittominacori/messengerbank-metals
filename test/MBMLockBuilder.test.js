const { BN, constants, expectEvent, shouldFail, time } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const { shouldBehaveLikeTokenRecover } = require('eth-token-recover/test/TokenRecover.behaviour');
const { shouldBehaveLikeTokenTimelock } = require('./behaviours/MBMTimelock.behaviour');

const ERC20Mock = artifacts.require('ERC20Mock');
const LockBuilder = artifacts.require('MBMLockBuilder');
const TokenTimelock = artifacts.require('MBMTimelock');

contract('MBMLockBuilder', function ([owner, beneficiary, thirdParty]) {
  it('rejects with zero address', async function () {
    await shouldFail.reverting(
      LockBuilder.new(ZERO_ADDRESS)
    );
  });

  context('with token', function () {
    const amount = new BN(100);

    beforeEach(async function () {
      this.token = await ERC20Mock.new(owner, amount);
    });

    context('once deployed', function () {
      beforeEach(async function () {
        this.builder = await LockBuilder.new(this.token.address, { from: owner });
      });

      it('can get state', async function () {
        (await this.builder.token()).should.be.equal(this.token.address);
      });

      context('try creating a timelock', function () {
        beforeEach(async function () {
          this.releaseTime = (await time.latest()).add(time.duration.years(1));
        });

        describe('if owner is calling', function () {
          beforeEach(async function () {
            ({ logs: this.logs } = await this.builder.createLock(beneficiary, this.releaseTime, { from: owner }));

            this.logs.filter(e => e.event === 'LockCreated').find(e => {
              this.lockAddress = e.args.timelock;
            });

            this.timelock = await TokenTimelock.at(this.lockAddress);
            await this.token.transfer(this.timelock.address, amount, { from: owner });
          });

          it('should emit a LockCreated event', async function () {
            expectEvent.inLogs(this.logs, 'LockCreated', {
              timelock: this.timelock.address,
              beneficiary: beneficiary,
              releaseTime: this.releaseTime,
            });
          });

          context('once deployed', function () {
            shouldBehaveLikeTokenTimelock(beneficiary, amount);
          });
        });

        describe('if thirdParty is calling', function () {
          it('reverts', async function () {
            await shouldFail.reverting(
              this.builder.createLock(beneficiary, this.releaseTime, { from: thirdParty })
            );
          });
        });
      });

      context('like a TokenRecover', function () {
        beforeEach(async function () {
          this.instance = this.builder;
        });

        shouldBehaveLikeTokenRecover([owner, thirdParty]);
      });
    });
  });
});
