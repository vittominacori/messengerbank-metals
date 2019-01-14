const shouldFail = require('openzeppelin-solidity/test/helpers/shouldFail');
const { ZERO_ADDRESS } = require('openzeppelin-solidity/test/helpers/constants');
const expectEvent = require('openzeppelin-solidity/test/helpers/expectEvent');

require('chai')
  .should();

function capitalize (str) {
  return str.replace(/\b\w/g, l => l.toUpperCase());
}

function shouldBehaveLikePublicRole (authorized, roler, [anyone], rolename) {
  rolename = capitalize(rolename);

  describe('should behave like public role', function () {
    beforeEach('check preconditions', async function () {
      (await this.contract[`is${rolename}`](authorized)).should.equal(true);
      (await this.contract[`is${rolename}`](roler)).should.equal(true);
      (await this.contract[`is${rolename}`](anyone)).should.equal(false);
    });

    it('reverts when querying roles for the null account', async function () {
      await shouldFail.reverting(this.contract[`is${rolename}`](ZERO_ADDRESS));
    });

    context('add', function () {
      describe('if an authorized account is calling', function () {
        it('adds role to a new account', async function () {
          await this.contract[`add${rolename}`](anyone, { from: authorized });
          (await this.contract[`is${rolename}`](anyone)).should.equal(true);
        });

        it(`emits a ${rolename}Added event`, async function () {
          const { logs } = await this.contract[`add${rolename}`](anyone, { from: authorized });
          expectEvent.inLogs(logs, `${rolename}Added`, { account: anyone });
        });

        it('reverts when adding role to an already assigned account', async function () {
          await shouldFail.reverting(this.contract[`add${rolename}`](authorized, { from: authorized }));
        });

        it('reverts when adding role to the null account', async function () {
          await shouldFail.reverting(this.contract[`add${rolename}`](ZERO_ADDRESS, { from: authorized }));
        });
      });

      describe(`if a ${rolename} account is calling`, function () {
        it('reverts', async function () {
          await shouldFail.reverting(this.contract[`add${rolename}`](anyone, { from: roler }));
        });
      });

      describe('if an unauthorized account is calling', function () {
        it('reverts', async function () {
          await shouldFail.reverting(this.contract[`add${rolename}`](anyone, { from: anyone }));
        });
      });
    });

    context('remove', function () {
      describe('if an authorized account is calling', function () {
        it('removes role from an already assigned account', async function () {
          await this.contract[`remove${rolename}`](authorized);
          (await this.contract[`is${rolename}`](authorized)).should.equal(false);
          (await this.contract[`is${rolename}`](roler)).should.equal(true);
        });

        it(`emits a ${rolename}Removed event`, async function () {
          const { logs } = await this.contract[`remove${rolename}`](authorized);
          expectEvent.inLogs(logs, `${rolename}Removed`, { account: authorized });
        });

        it('reverts when removing from an unassigned account', async function () {
          await shouldFail.reverting(this.contract[`remove${rolename}`](anyone));
        });

        it('reverts when removing role from the null account', async function () {
          await shouldFail.reverting(this.contract[`remove${rolename}`](ZERO_ADDRESS));
        });
      });

      describe(`if a ${rolename} account is calling`, function () {
        it('reverts', async function () {
          await shouldFail.reverting(this.contract[`remove${rolename}`](authorized, { from: roler }));
        });
      });

      describe('if an unauthorized account is calling', function () {
        it('reverts', async function () {
          await shouldFail.reverting(this.contract[`remove${rolename}`](authorized, { from: anyone }));
        });
      });
    });

    describe('renouncing roles', function () {
      it('renounces an assigned role', async function () {
        await this.contract[`renounce${rolename}`]({ from: authorized });
        (await this.contract[`is${rolename}`](authorized)).should.equal(false);
      });

      it(`emits a ${rolename}Removed event`, async function () {
        const { logs } = await this.contract[`renounce${rolename}`]({ from: authorized });
        expectEvent.inLogs(logs, `${rolename}Removed`, { account: authorized });
      });

      it('reverts when renouncing unassigned role', async function () {
        await shouldFail.reverting(this.contract[`renounce${rolename}`]({ from: anyone }));
      });
    });
  });
}

module.exports = {
  shouldBehaveLikePublicRole,
};
