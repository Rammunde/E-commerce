const Razorpay = require('razorpay');
const config = require('./index');

/**
 * Initializes and returns a Razorpay instance.
 * Throws a descriptive error if API keys are missing.
 */
function getRazorpayInstance() {
  const key_id = config.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
  const key_secret = config.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    const error = new Error(
      'Razorpay credentials missing. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file.'
    );
    error.statusCode = 500;
    throw error;
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
}

module.exports = {
  getRazorpayInstance,
};
