const testOrder = require('./testOrder.json');

beforeAll(() => {
  process.env.STORE_ISA = "EXAMPLE";
  process.env.ORDERFUL_KEY = 'example'
});

test('Test posting an order to Orderful', async () => {
    const postToOrderful = require('../app_modules/post-order.js');
  try {
    await postToOrderful(testOrder, "Example");
    // You can log the result or check for successful execution
    console.log('Order posted to Orderful successfully');
  } catch (error) {
    console.error('Error posting to Orderful:', error);
    // Handle errors appropriately
  }
});
