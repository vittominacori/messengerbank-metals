const { shouldFail, time } = require('openzeppelin-test-helpers');

function shouldBehaveLikeTokenTimelock (beneficiary, amount) {
  describe('should behave like a MBMTimelock', function () {
    it('can get state', async function () {
      (await this.timelock.token()).should.be.equal(this.token.address);
      (await this.timelock.beneficiary()).should.be.equal(beneficiary);
      (await this.timelock.releaseTime()).should.be.bignumber.equal(this.releaseTime);
    });

    it('cannot be released before time limit', async function () {
      await shouldFail.reverting(this.timelock.release());
    });

    it('cannot be released just before time limit', async function () {
      await time.increaseTo(this.releaseTime.sub(time.duration.seconds(3)));
      await shouldFail.reverting(this.timelock.release());
    });

    it('can be released just after limit', async function () {
      await time.increaseTo(this.releaseTime.add(time.duration.seconds(1)));
      await this.timelock.release();
      (await this.token.balanceOf(beneficiary)).should.be.bignumber.equal(amount);
    });

    it('can be released after time limit', async function () {
      await time.increaseTo(this.releaseTime.add(time.duration.years(1)));
      await this.timelock.release();
      (await this.token.balanceOf(beneficiary)).should.be.bignumber.equal(amount);
    });

    it('cannot be released twice', async function () {
      await time.increaseTo(this.releaseTime.add(time.duration.years(1)));
      await this.timelock.release();
      await shouldFail.reverting(this.timelock.release());
      (await this.token.balanceOf(beneficiary)).should.be.bignumber.equal(amount);
    });
  });
}

module.exports = {
  shouldBehaveLikeTokenTimelock,
};
