// Replacing environment variable with static value
beforeAll(() => {
    process.env.STORE_ISA = "testISA";
});

// Mock receiver ISA ID
jest.mock('../app_modules/get-isa.js', () => jest.fn(() => 'testReceiver'));

// Mocked barcode response from Shopify API call
jest.mock('axios', () => ({
    get: jest.fn(() => Promise.resolve({
        data: {
            variant: {
                barcode: '012345678901'
            }
        }
    }))
}));

const testOrder = require('./testOrder.json');
const referenceOutput = require('./referenceOutput.json');

test('Test conversion to X12-like JSON', async () => {
    const convertToX12 = require('../app_modules/convert-order.js'); // Requiring the module inside the test to ensure environment variables set correctly
    const results = await convertToX12(testOrder, 'testReceiver');
    expect(results).toEqual(referenceOutput);
});