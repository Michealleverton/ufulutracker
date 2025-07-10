import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import loginbacking from "../assets/loginbacking.png";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const Success = () => {
  const navigate = useNavigate();
  const isVerified = localStorage.getItem("Loggedin") === "true";

  // Fade-in animation state
  const [show, setShow] = useState(false);
  const [isProcessing, setIsProcessing] = useState(true); // Add processing state
  
  useEffect(() => {
    setShow(true);
    // Mark user as logged in after successful payment
    localStorage.setItem("Loggedin", "true");
    
    // Process the Stripe session and update user profile
    processStripeSession();
  }, []);

  const processStripeSession = async () => {
    try {
      // Get parameters from URL
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');
      const subscriptionId = urlParams.get('subscription_id');
      const customerId = urlParams.get('customer_id');
      
      console.log('Processing payment success:', { sessionId, subscriptionId, customerId });
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (!user || userError) {
        console.log('No authenticated user found, checking for pending user data...');
        
        // Get pending user data from localStorage (stored during registration)
        const pendingUserDataStr = localStorage.getItem('pendingUserData');
        if (pendingUserDataStr) {
          const pendingUserData = JSON.parse(pendingUserDataStr);
          console.log('Found pending user data, creating account...');
          
          // Create the user account now that payment is successful
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: pendingUserData.email,
            password: pendingUserData.password,
          });

          if (authError) {
            console.error('Error creating user after payment:', authError);
            throw authError;
          }

          if (authData.user) {
            // Get the selected plan from localStorage
            const selectedPlan = localStorage.getItem("selectedPlan") || 'premium';
            
            // Determine max_strategies based on plan
            let maxStrategies;
            switch (selectedPlan) {
              case 'free':
                maxStrategies = 1;
                break;
              case 'pro':
                maxStrategies = 3;
                break;
              case 'premium':
                maxStrategies = 10;
                break;
              default:
                maxStrategies = 1;
            }

            // Create profile with payment information
            const { error: profileError } = await supabase
              .from("profiles")
              .insert([{ 
                id: authData.user.id, 
                username: pendingUserData.username,
                plan: selectedPlan,
                max_strategies: maxStrategies,
                subscription_status: 'active'
              }]);

            if (profileError) {
              console.error('Error creating profile after payment:', profileError);
              throw profileError;
            }

            console.log('User account created successfully after payment');
            
            // Clean up pending data
            localStorage.removeItem('pendingUserData');
            localStorage.setItem("selectedPlan", selectedPlan);
            
            // Add a small delay to ensure database changes are visible
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        return;
      }

      // If user already exists, update their subscription info
      if (sessionId) {
        // Handle Stripe checkout session (paid plans)
        try {
          const response = await fetch('http://localhost:3000/api/get-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId: sessionId
            }),
          });

          if (response.ok) {
            const sessionData = await response.json();
            console.log('Stripe session data:', sessionData);
            
            // Update user profile with subscription information
            if (sessionData.subscription_id && sessionData.customer_id) {
              await updateUserPlan(sessionData.customer_id, sessionData.subscription_id, 'premium');
            }
          } else {
            console.error('Failed to get session details');
          }
        } catch (error) {
          console.error('Error getting session details:', error);
        }
      } else if (subscriptionId && customerId) {
        // Handle direct subscription creation ($0 plans)
        console.log('Processing direct subscription:', subscriptionId);
        await updateUserPlan(customerId, subscriptionId, 'premium');
      } else {
        console.log('No session_id or subscription_id found in URL');
      }
    } catch (error) {
      console.error('Error processing payment success:', error);
    } finally {
      setIsProcessing(false);
      
      // Set flag for dashboard to refresh strategies
      localStorage.setItem('refreshAfterPayment', 'true');
      
      // Add a small delay to ensure all updates are processed
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  };

  const updateUserPlan = async (customerId: string, subscriptionId: string, planType: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get the selected plan from localStorage (set during upgrade flow)
      const selectedPlan = localStorage.getItem("selectedPlan") || planType;
      
      // Determine max_strategies based on plan
      let maxStrategies;
      switch (selectedPlan) {
        case 'free':
        case 'basic':
          maxStrategies = 1;
          break;
        case 'pro':
          maxStrategies = 3;
          break;
        case 'premium':
          maxStrategies = 10;
          break;
        default:
          maxStrategies = 1;
      }
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          plan: selectedPlan,
          subscription_id: customerId,
          subscription_status: 'active',
          max_strategies: maxStrategies
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating user profile:', updateError);
      } else {
        console.log('User profile updated successfully with plan:', selectedPlan);
        localStorage.setItem("selectedPlan", selectedPlan);
      }
    } catch (error) {
      console.error('Error in updateUserPlan:', error);
    }
  };

  const handleDashboardNavigation = () => {
    if (isProcessing) {
      // Don't navigate while still processing
      return;
    }
    navigate("/dashboard");
  };

  return (
    <div
      className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: `url(${loginbacking})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Success Content */}
      <div className={`relative z-10 max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center transition-all duration-1000 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Success Icon */}
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <Check className="w-8 h-8 text-green-600" />
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isProcessing ? "Processing Payment..." : "Payment Successful!"}
        </h1>
        
        <p className="text-gray-600 mb-8">
          {isProcessing 
            ? "Please wait while we set up your account..." 
            : "Thank you for your purchase. Your subscription has been activated successfully."
          }
        </p>

        {/* Loading Spinner or Success Actions */}
        {isProcessing ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Setting up your account...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Continue to Dashboard Button */}
            <button
              onClick={handleDashboardNavigation}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Continue to Dashboard
            </button>

            {/* Secondary Action */}
            <button
              onClick={() => navigate("/")}
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Return to Home
            </button>
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help? Contact our{" "}
            <a href="#" className="text-blue-600 hover:underline">
              support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Success;
