const expect = require('chai').expect;
const request = require('request-promise-native');

const ctx = global.ctx;

describe('functional tests', () => {
    it('GET /answer', async () => {
        const response = await request(`${ctx.serviceBaseUrl}/api/answer`);

        expect(response).to.be.equal('{"answer:42}');
    });
});
