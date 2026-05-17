import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, Clock, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { UserLayout } from "@/components/layouts/UserLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { api, safeRequest } from "@/lib/api";
import { mockDb } from "@/lib/mockDb";

interface BookingDetails {
  service: string;
  date: string;
  time: string;
  address: string;
  amount: number;
  notes?: string;
  provider_id?: number;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Payment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"now" | "after" | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      console.log("Razorpay script loaded successfully");
      setRazorpayLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load Razorpay script");
      toast.error("Failed to load payment gateway. Please refresh and try again.");
    };
    document.body.appendChild(script);
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    const bookingData: BookingDetails = {
      service: params.get("service") || "Service",
      date: params.get("date") || "",
      time: params.get("time") || "",
      address: params.get("address") || "",
      amount: parseInt(params.get("amount") || "499"),
      notes: params.get("notes") || undefined,
      provider_id: params.get("provider_id") ? parseInt(params.get("provider_id")!) : undefined,
    };
    setBooking(bookingData);
  }, [params]);

  const createBookingInDB = async () => {
    if (!booking || !user) return null;
    const token = localStorage.getItem("hs_token");
    if (!token) {
      toast.error("Session expired. Please log in again.");
      navigate("/login");
      return null;
    }
    try {
      const response = await api.post("/bookings", {
        service: booking.service,
        booking_date: booking.date,
        booking_time: booking.time,
        address: booking.address,
        description: booking.notes || "",
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err) {
      // fallback to mockDb
      mockDb.createBooking({
        userId: user.id,
        userName: user.name,
        service: booking.service,
        date: booking.date,
        time: booking.time,
        address: booking.address,
        notes: booking.notes,
        price: booking.amount,
      });
      return { id: "mock-" + Date.now() };
    }
  };

  const handlePayNow = async () => {
    if (!booking || !user) return;

    if (!razorpayLoaded || !window.Razorpay) {
      toast.error("Payment gateway not loaded. Please refresh the page.");
      return;
    }

    setProcessing(true);

    try {
      await createBookingInDB();

      const options = {
        key: "rzp_test_Sq8ZtcOGeUBZmp",
        amount: 49900,
        currency: "INR",
        name: "HomeServe",
        description: "Home Service Booking",
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { color: "#0ea5e9" },
        handler: (_response: any) => {
          toast.success("Payment successful! Your booking is confirmed.");
          navigate("/user/my-bookings");
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            toast.error("Payment cancelled");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", (_response: any) => {
        toast.error("Payment failed. Please try again.");
        setProcessing(false);
      });
      razorpay.open();
    } catch (error) {
      toast.error("Failed to process payment. Please try again.");
      setProcessing(false);
    }
  };

  const handlePayAfter = async () => {
    if (!booking || !user) return;
    setProcessing(true);
    try {
      await createBookingInDB();
      toast.success("Booking confirmed! You can pay after the service is complete.");
      navigate("/user/my-bookings");
    } catch (error) {
      toast.error("Failed to create booking. Please try again.");
      setProcessing(false);
    }
  };

  if (!user) {
    return (
      <UserLayout>
        <div className="container py-24 text-center">
          <h1 className="font-display text-3xl font-extrabold">Sign in to continue</h1>
          <Button onClick={() => navigate("/login")} className="mt-6 bg-gradient-cta text-primary-foreground">
            Sign in
          </Button>
        </div>
      </UserLayout>
    );
  }

  if (!booking) {
    return (
      <UserLayout>
        <div className="container py-24 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-4">Loading payment details...</p>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="container py-12 md:py-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
            <div className="text-center mb-8">
              <h1 className="font-display text-3xl font-extrabold text-primary">Payment & Confirmation</h1>
              <p className="text-muted-foreground mt-2">Choose how you'd like to pay for your booking</p>
            </div>

            <div className="bg-muted/40 rounded-xl p-6 mb-8 border border-border">
              <h2 className="font-semibold text-foreground mb-4">Booking Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service</span>
                  <span className="font-medium text-foreground">{booking.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium text-foreground">{booking.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium text-foreground">{booking.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium text-foreground truncate max-w-[200px]">{booking.address}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="text-foreground font-semibold">Amount</span>
                  <span className="font-display text-lg font-bold text-primary">₹499</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => !processing && setPaymentMethod("now")}
                className={`w-full rounded-xl border-2 p-6 text-left transition-smooth ${
                  paymentMethod === "now" ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"
                } ${processing ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${paymentMethod === "now" ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"}`}>
                    {paymentMethod === "now" && <CheckCircle className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <CreditCard className="h-5 w-5" /> Pay Now
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">Secure payment via Razorpay. Get instant confirmation.</p>
                    <div className="mt-3 flex gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/15 text-green-600 rounded-full text-xs font-medium">
                        <CheckCircle className="h-3 w-3" /> Secure
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/15 text-blue-600 rounded-full text-xs font-medium">
                        <CreditCard className="h-3 w-3" /> Fast
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => !processing && setPaymentMethod("after")}
                className={`w-full rounded-xl border-2 p-6 text-left transition-smooth ${
                  paymentMethod === "after" ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"
                } ${processing ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${paymentMethod === "after" ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"}`}>
                    {paymentMethod === "after" && <CheckCircle className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Clock className="h-5 w-5" /> Pay After Service
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">Confirm booking now and pay after service is complete.</p>
                    <div className="mt-3 flex gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/15 text-yellow-600 rounded-full text-xs font-medium">
                        <Clock className="h-3 w-3" /> Flexible
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/15 text-blue-600 rounded-full text-xs font-medium">
                        <CheckCircle className="h-3 w-3" /> Easy
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>
            </div>

            <div className="mt-8 flex gap-3">
              <Button onClick={() => navigate(-1)} variant="outline" disabled={processing} className="flex-1">
                Edit Booking
              </Button>
              <Button
                onClick={paymentMethod === "now" ? handlePayNow : handlePayAfter}
                disabled={!paymentMethod || processing}
                className="flex-1 bg-gradient-cta text-primary-foreground hover:opacity-95"
              >
                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {paymentMethod === "now"
                  ? processing ? "Processing..." : "Proceed to Razorpay"
                  : processing ? "Confirming..." : "Confirm Booking"}
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">
                🔒 Your payment information is secure and encrypted. HomeServe never stores your card details.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </UserLayout>
  );
}
