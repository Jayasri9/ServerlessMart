 // Configuration toggles for the application
 // REACT_APP_

export const USE_MOCK_PAYMENT = process.env.REACT_APP_USE_MOCK_PAYMENT === "true";
export const STRIPE_PUBLISHABLE_KEY = process.env.REACT_APP_STRIPE_PK || "";
export const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY || "";

// other feature flags or keys can go here

// to be finished commit