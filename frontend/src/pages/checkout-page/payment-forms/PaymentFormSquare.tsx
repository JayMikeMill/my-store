// React hooks for state and lifecycle
import { useEffect, useState } from "react";

// Import shared types for shipping address and cart items
import { type ShippingInfo } from "@shared/types/Shipping";
import type { OrderItem } from "@shared/types/Order";
import { useApi } from "@api/useApi";

// Import PaymentStatus and PaymentMethod enums
import {
  TransactionStatuses,
  PaymentMethods,
  OrderStatuses,
} from "@shared/types/Order";
import { useAuth } from "@contexts/auth/AuthContext";

// Square environment variables (from Vite)
const SQUARE_APPLICATION_ID = import.meta.env.VITE_SQUARE_APPLICATION_ID || "";
const SQUARE_LOCATION_ID = import.meta.env.VITE_SQUARE_LOCATION_ID || "";

// Extend the window object to include Square
declare global {
  interface Window {
    Square?: any;
  }
}

// Props expected by the PaymentForm component
interface SquarePaymentFormProps {
  total: number; // Total amount to charge
  orderItems: OrderItem[]; // Items in the cart
  shippingInfo: ShippingInfo;
  setLoading: (loading: boolean) => void;
  setMessage: (msg: string | null) => void;
}

// PaymentForm component
export default function PaymentFormSquare({
  total,
  orderItems,
  shippingInfo,
  setLoading,
  setMessage,
}: SquarePaymentFormProps) {
  // State to store the Square card instance
  const [cardInstance, setCardInstance] = useState<any>(null);
  const { processPayment, orders } = useApi();

  // Initialize Square payments when the component mounts
  useEffect(() => {
    async function initializeSquare() {
      if (!window.Square) return console.error("Square.js not loaded");
      try {
        // Initialize Square payments object
        const payments = window.Square.payments(
          SQUARE_APPLICATION_ID,
          SQUARE_LOCATION_ID
        );
        const card = await payments.card();

        // Clear any previous card container content
        document.getElementById("card-container")!.innerHTML = "";

        // Attach the card form to the DOM
        await card.attach("#card-container");
        setCardInstance(card);
      } catch (err) {
        console.error("Square card init error:", err);
      }
    }

    initializeSquare();
  }, []); // Empty dependency array → runs once on mount

  // Generate a payment token (nonce) from the Square card form
  const handleGenerateNonce = async () => {
    if (!cardInstance) return alert("Payment form not ready yet");
    try {
      const result = await cardInstance.tokenize();
      if (result.status === "OK") return result.token;

      // Show validation errors if tokenization fails
      alert(
        "Payment info invalid: " +
          (result.errors?.map((e: any) => e.message).join(", ") || "")
      );
      return null;
    } catch (err) {
      console.error("Tokenization error:", err);
      return null;
    }
  };

  // Handle the payment process
  const handlePayment = async () => {
    const nonce = await handleGenerateNonce();

    if (!nonce) return alert("Could not get payment info");

    try {
      setLoading(true); // Show loading indicator

      const response = await processPayment({
        nonce,
        amount: total,
        items: orderItems.map((item) => ({
          name:
            typeof item.product === "string"
              ? item.product
              : typeof item.product === "object" && "name" in item.product
                ? (item.product as { name: string }).name
                : "Unknown Product",
          price: item.price,
          quantity: item.quantity,
        })),
        address: shippingInfo.address,
      });

      // Narrow the type of response to access payment property
      const payment = (response as { payment: any }).payment;
      console.log("Payment response data:", payment);

      // Display result message
      if (payment.status === "COMPLETED") onSuccess(payment);
      else setMessage("Payment failed: " + payment.error);
    } catch (err) {
      console.error("Payment error:", err);
      setMessage("Payment could not be processed");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000); // Clear message after 3s
    }
  };

  const onSuccess = (payment: any) => {
    setMessage("Payment successful!");

    orders.create({
      id: "pending id",
      //userId: user?.id || "guest",
      items: orderItems,
      total,
      status: OrderStatuses.PAID,
      createdAt: new Date(),
      updatedAt: new Date(),
      transaction: {
        method: PaymentMethods.SQUARE,
        amount: payment.amountMoney.amount,
        currency: payment.amountMoney.currency,
        status: TransactionStatuses.PAID,
      },
      shippingInfo,
    });
  };
  // Render the payment form
  return (
    <div className="payment-form max-w-2xl mx-auto p-lg bg-surface rounded-lg shadow-xl flex flex-col gap-md text-text font-sans">
      <h3 className="text-3xl mb-lg text-center font-bold">
        {total > 0 ? "Payment" : ""}
      </h3>
      <p className="text-lg font-semibold text-textSecondary text-right md:text-left">
        Total: ${total.toFixed(2)}
      </p>

      {/* Container for Square card input */}
      <div
        id="card-container"
        className="w-full h-52 mb-md border border-border rounded-md bg-background"
      ></div>

      {/* Pay button */}
      <button
        onClick={handlePayment}
        className="bg-primary hover:bg-primaryDark text-white rounded-md px-6 py-3 font-semibold shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed w-full"
        disabled={!cardInstance}
      >
        Pay Now
      </button>
    </div>
  );
}
