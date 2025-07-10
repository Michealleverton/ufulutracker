import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";
import { FormInput } from "../components/FormInput";
import { supabase } from "../../../lib/supabase";
import toast from "react-hot-toast";
import { Navbar } from "../../Navbar";
import loginbacking from "../../../assets/loginbacking.png";

const pricingPlans = [
  {
    name: "free",
    price: 0,
    priceId: "",
    yearlyPriceId: "",
    // ...features
  },
  {
    name: "pro",
    price: 9.99,
    priceId: "price_1OuKNjApncs80C2o3yA4dx5K",
    yearlyPriceId: "price_1Rfw1LApncs80C2oiWyIGsD9", // Replace with your actual yearly Pro price ID
    // ...features
  },
  {
    name: "premium",
    price: 14.99,
    priceId: "price_1OuKLwApncs80C2oPK9ZaJup",
    yearlyPriceId: "price_1Rfw2jApncs80C2oWUBe16yM", // Replace with your actual yearly Premium price ID
    // ...features
  },
];

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Scroll to bottom on mount
  useEffect(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!password.trim()) {
      toast.error("Password is required");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setLoading(true);

    try {
      // Get the selected plan from localStorage
      const selectedPlan = localStorage.getItem("selectedPlan") || "free";
      const selectedBillingPeriod = localStorage.getItem("selectedBillingPeriod") || "monthly";
      
      // For free/basic plan, create user immediately
      if (selectedPlan.toLowerCase() === "free") {
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) {
          console.error("Auth error:", authError);
          if (authError.message === "User already registered") {
            throw new Error(
              "This email is already registered. Please try logging in instead."
            );
          }
          throw authError;
        }

        if (authData.user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert([{ 
              id: authData.user.id, 
              username,
              plan: 'free',
              max_strategies: 1
            }]);

          if (profileError) {
            console.error("Profile error:", profileError);
            if (profileError.code === "23505") {
              throw new Error(
                "This username is already taken. Please choose another one."
              );
            }
            throw profileError;
          }

          toast.success(
            "Registration successful! Please check your email to verify your account."
          );
          navigate("/login");
        }
      } else {
        // For paid plans, go to payment first WITHOUT creating user
        const plan = pricingPlans.find((p) => p.name === selectedPlan);
        if (plan) {
          // Use the correct price ID based on billing period
          const priceId = selectedBillingPeriod === "yearly" ? plan.yearlyPriceId : plan.priceId;
          
          if (priceId) {
            // Store user registration data for after payment
            localStorage.setItem("pendingUserData", JSON.stringify({
              email,
              password,
              username
            }));
            
            // Test if server is accessible first
            try {
              await fetch("http://localhost:3000/", { method: "GET" });
            } catch (testError) {
              console.error("Server not accessible:", testError);
              toast.error("Payment server is not running. Please try again later.");
              return;
            }
            
            // Call your backend to create a Stripe Checkout Session
            const response = await fetch(
              "http://localhost:3000/api/create-checkout-session",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ priceId, email }),
              }
            );
            
            if (!response.ok) {
              toast.error("Payment server error.");
              return;
            }
            const data = await response.json();
            
            if (data.url) {
              toast.success("Redirecting you to payment...");
              setTimeout(() => {
                window.location.href = data.url;
              }, 1500);
              return;
            } else {
              toast.error("Failed to create payment session.");
            }
          } else {
            toast.error("Invalid price configuration for selected plan.");
          }
        } else {
          toast.error("Selected plan not found.");
        }
      }
    } catch (error: unknown) {
      console.error("Registration error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div
        className="min-h-screen bg-local bg-center flex items-center justify-center px-4"
        style={{ backgroundImage: `url(${loginbacking})` }}
      >
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8 mt-16">
          <div className="text-center mb-8">
            {/* <UserPlus className="h-12 w-12 text-indigo-400 mx-auto mb-4" /> */}
            <h2 className="text-3xl font-bold text-white">Create Account</h2>
            <p className="text-gray-300 mt-2">
              Join Ufulu Tracker and start your journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              id="username"
              type="text"
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              icon={User}
              required
            />

            <FormInput
              id="email"
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              required
            />

            <FormInput
              id="password"
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={Lock}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-300">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-indigo-400 hover:text-indigo-500"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
