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
      } else {
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
                await updateUserPlan(sessionData.customer_id, sessionData.subscription_id);
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
          await updateUserPlan(customerId, subscriptionId);
        } else {
          console.log('No session_id or subscription_id found in URL');
        }
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

  const updateUserPlan = async (customerId: string, subscriptionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // For $0 subscriptions, set plan to 'premium' (or whatever plan you want)
      const selectedPlan = localStorage.getItem("selectedPlan") || 'premium';
      
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
          customer_id: customerId,
          subscription_id: subscriptionId,
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

  const handleCheckClick = () => {
    // Don't allow navigation until processing is complete
    if (isProcessing) {
      console.log('Still processing subscription, please wait...');
      return;
    }
    
    if (isVerified) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  return (
    <div
      className="w-full h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${loginbacking})` }}
    >
      <div
        className={`flex flex-col items-center justify-center text-center font-semibold bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-2xl px-10 py-12 max-w-md w-full border border-green-200 backdrop-blur-md transition-all duration-700 ${
          show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        } ring-2 ring-green-700`}
      >
        {/* Animated glowing checkmark */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative group">
            <div className="absolute inset-0 rounded-full bg-green-400 blur-xl opacity-60 animate-pulse"></div>
            <div
              className={`flex items-center justify-center w-24 h-24 rounded-full shadow-lg ring-4 ring-green-700 ${
                isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 cursor-pointer'
              }`}
              onClick={handleCheckClick}
              tabIndex={0}
              role="button"
              aria-label="Continue"
              onKeyDown={e => (e.key === "Enter" || e.key === " ") && handleCheckClick()}
            >
              <Check size={56} color="white" />
            </div>
          </div>
        </div>
        <h1 className="text-green-700 text-4xl font-extrabold mb-2 drop-shadow-lg">
          Payment Successful!
        </h1>
        <p className="text-gray-700 dark:text-gray-200 text-lg mb-2">
          Thank you for your subscription.
        </p>
        <p className="text-gray-600 dark:text-gray-300 text-base mb-6">
          You can now access your account and enjoy all features.
        </p>
        <button
          onClick={handleCheckClick}
          disabled={isProcessing}
          className={`mt-2 px-6 py-2 rounded-full font-semibold shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400 ${
            isProcessing 
              ? 'bg-gray-400 cursor-not-allowed text-gray-600' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isProcessing 
            ? (isVerified ? "Setting up account..." : "Processing...") 
            : (isVerified ? "Go to Dashboard" : "Go to Home")
          }
        </button>
      </div>
    </div>
  );
};

export default Success;