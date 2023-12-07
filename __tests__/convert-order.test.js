const testOrder = require('./testOrder.json');
const referenceOutput = require('./referenceOutput.json');

beforeAll(() => {
    process.env.STORE_ISA = "INSPIREME";

})

test('Test conversion to X12-like JSON', async () => {
    const convertToX12 = require('../app_modules/convert-order.js');
    const results = await convertToX12(testOrder, 'Orderful');
    expect(results).toEqual(referenceOutput);
});