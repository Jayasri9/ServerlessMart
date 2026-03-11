import { USE_MOCK_PAYMENT } from "../config";

// this helper hides whether we're using a fake simulation or talking to a real
// payment provider. the rest of the application just awaits a result object with
// `paymentId`/`transactionId`/`method`.

export async function processPayment(amount, paymentDetails) {
  if (USE_MOCK_PAYMENT) {
    // existing simulation copied from PaymentForm
    await new Promise((r) => setTimeout(r, 2000));
    if (Math.random() < 0.1) {
      throw new Error("Mock failure");
    }
    return {
      paymentId: `PAY${Date.now()}`,
      transactionId: "TXN" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      amount,
      method: paymentDetails.paymentMethod
    };
  }

  // TODO: implement real gateway interaction (e.g. call server endpoint that
  // creates a Stripe PaymentIntent or Razorpay order and then confirm it here).
  throw new Error("Real payment path not implemented");
}
