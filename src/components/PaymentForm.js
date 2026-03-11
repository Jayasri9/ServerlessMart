import { useState } from "react";
import { processPayment } from "../utils/paymentGateway";

function PaymentForm({ onPaymentSuccess, onPaymentCancel, amount, orderData }) {
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    cardholderName: "",
    upiId: "",
    paymentMethod: "card"
  });
  const [processing, setProcessing] = useState(false);

  const handleChange = (e) => {
    setPaymentData({ ...paymentData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const paymentResult = await processPayment(amount, paymentData);
      onPaymentSuccess(paymentResult);
    } catch (error) {
      alert(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const renderCardPayment = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
      <div>
        <label>Cardholder Name *</label>
        <input
          type="text"
          name="cardholderName"
          value={paymentData.cardholderName}
          onChange={handleChange}
          required
          placeholder="John Doe"
          style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}
        />
      </div>

      <div>
        <label>Card Number *</label>
        <input
          type="text"
          name="cardNumber"
          value={paymentData.cardNumber}
          onChange={(e) => {
            const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
            setPaymentData({ ...paymentData, cardNumber: value });
          }}
          required
          placeholder="1234 5678 9012 3456"
          maxLength="19"
          style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
        <div>
          <label>Expiry Month *</label>
          <select
            name="expiryMonth"
            value={paymentData.expiryMonth}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}
          >
            <option value="">MM</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                {String(i + 1).padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Expiry Year *</label>
          <select
            name="expiryYear"
            value={paymentData.expiryYear}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}
          >
            <option value="">YY</option>
            {Array.from({ length: 10 }, (_, i) => (
              <option key={new Date().getFullYear() + i} value={String(new Date().getFullYear() + i).slice(2)}>
                {String(new Date().getFullYear() + i).slice(2)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>CVV *</label>
          <input
            type="text"
            name="cvv"
            value={paymentData.cvv}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 3);
              setPaymentData({ ...paymentData, cvv: value });
            }}
            required
            placeholder="123"
            maxLength="3"
            style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}
          />
        </div>
      </div>
    </div>
  );

  const renderUPIPayment = () => (
    <div>
      <label>UPI ID *</label>
      <input
        type="text"
        name="upiId"
        value={paymentData.upiId}
        onChange={handleChange}
        required
        placeholder="username@upi"
        style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}
      />
      <div style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
        You will receive a payment request on your UPI app
      </div>
    </div>
  );

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px", backgroundColor: "white" }}>
      <h3 style={{ marginTop: 0, marginBottom: "20px" }}>Payment Details</h3>

      <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: "18px", fontWeight: "bold" }}>Total Amount:</span>
          <span style={{ fontSize: "24px", fontWeight: "bold", color: "#007bff" }}>
            ₹{amount.toFixed(2)}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <label>Payment Method *</label>
          <select
            name="paymentMethod"
            value={paymentData.paymentMethod}
            onChange={handleChange}
            style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}
          >
            <option value="card">Credit/Debit Card</option>
            <option value="upi">UPI</option>
          </select>
        </div>

        {paymentData.paymentMethod === "card" ? renderCardPayment() : renderUPIPayment()}

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onPaymentCancel}
            disabled={processing}
            style={{ padding: "12px 24px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "8px" }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={processing}
            style={{ padding: "12px 24px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "8px" }}
          >
            {processing ? "Processing..." : `Pay ₹${amount.toFixed(2)}`}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PaymentForm;