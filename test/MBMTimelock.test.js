const { BN, shouldFail, time } = require('openzeppelin-test-helpers');

const { shouldBehaveLikeTokenTimelock } = require('./behaviours/MBMTimelock.behaviour');

const ERC20Mock = artifacts.require('ERC20Mock');
const TokenTimelock = artifacts.require('MBMTimelock');

contract('MBMTimelock', function ([owner, beneficiary]) {
  const amount = new BN(100);
  const note = 'your custom text';

  context('with token', function () {
    beforeEach(async function () {
      this.token = await ERC20Mock.new(owner, amount);
    });

    it('rejects a release time in the past', async function () {
      const pastReleaseTime = (await time.latest()).sub(time.duration.years(1));
      await shouldFail.reverting(
        TokenTimelock.new(this.token.address, beneficiary, pastReleaseTime, note)
      );
    });

    describe('creating a valid timelock', function () {
      beforeEach(async function () {
        this.releaseTime = (await time.latest()).add(time.duration.years(1));
        this.timelock = await TokenTimelock.new(this.token.address, beneficiary, this.releaseTime, note);
        await this.token.transfer(this.timelock.address, amount, { from: owner });
      });

      context('once deployed', function () {
        it('should have note right set', async function () {
          (await this.timelock.note()).should.be.equal(note);
        });

        shouldBehaveLikeTokenTimelock(beneficiary, amount);
      });
    });
  });
});
