import React, { useState, useEffect, useRef } from "react";
import { Mail, Lock, User } from "lucide-react";
import { FormInput } from "../components/FormInput";
import { supabase } from "../../../lib/supabase";
import toast from "react-hot-toast";
import useScrollToTop from "../../hooks/useScrollToTop";
// import { useTheme } from "../../../Context/ThemeContext";

const Settings = () => {

  useScrollToTop();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [isDarkMode] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(""); // Store the user's current plan
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [isDeleting, setIsDeleting] = useState(false); // Add deleting state for button spinner
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // const { theme, toggleTheme } = useTheme();

  // Helper function to check if user is on free/basic plan
  const isFreePlan = (plan: string) => {
    return !plan || plan === 'free' || plan === 'Free' || plan === 'basic' || plan === 'Basic';
  };

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    setIsLoading(true); // Start loading
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setUser(user); // Store the user object
      const { data, error } = await supabase
        .from("profiles")
        .select("username, plan, avatar_url")
        .eq("id", user.id)
        .single();

      if (data) {
        setUsername(data.username);
        setCurrentPlan(data.plan);
        // Always add a timestamp to bust cache when displaying
        setAvatarUrl(
          data.avatar_url ? data.avatar_url + "?t=" + Date.now() : null
        );
      }
      if (error) toast.error("Error loading profile");
    }
    setIsLoading(false); // Stop loading
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) {
      console.error("Error getting user:", userError);
      toast.error("Error updating profile");
      return;
    }

    if (user) {
      // Check if the username already exists
      const { data: existingUsernames, error: usernameError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username);

      if (usernameError) {
        console.error("Error checking username:", usernameError);
        toast.error("Error checking username");
        return;
      }

      if (existingUsernames.length > 0 && existingUsernames[0].id !== user.id) {
        toast.error("Username already exists");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ username })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating profile:", error);
        toast.error("Error updating profile");
      } else {
        toast.success("Profile updated successfully");
        setTimeout(() => window.location.reload(), 1000); // Add the reload here
      }
    }
  };

  // Remove this function as the logic is now in handleUpdateProfile
  // const handleUsernameUpdate = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setTimeout(() => window.location.reload(), 1000);}

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) {
      console.error("Error getting user:", userError);
      toast.error("Error updating email");
      return;
    }

    if (user) {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) {
        console.error("Error updating email:", error);
        toast.error("Error updating email");
      } else {
        toast.success("Email updated successfully");
      }
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error("Error updating password");
    } else {
      toast.success("Password updated successfully");
    }
  };

  // const handlePlanChange = async (newPlan: string) => {
  //   const {
  //     data: { user },
  //     error: userError,
  //   } = await supabase.auth.getUser();
  //   if (userError) {
  //     toast.error("Error fetching user");
  //     return;
  //   }

  //   if (user) {
  //     const { error } = await supabase
  //       .from("profiles")
  //       .update({ plan: newPlan })
  //       .eq("id", user.id);

  //     if (error) {
  //       toast.error("Error updating plan");
  //     } else {
  //       setCurrentPlan(newPlan); // Update the current plan in state
  //       toast.success(`Plan updated to ${newPlan}`);
  //       setTimeout(() => {
  //         window.location.reload();
  //       }, 3000);
  //     }
  //   }
  // };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Get the current avatar URL from the profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single();

    // Delete the old avatar from storage if it exists and is in your bucket
    if (profile?.avatar_url) {
      // Works for both public and private URLs
      const urlParts = profile.avatar_url.split("/");
      // Find the index of 'avatars' and get everything after it
      const avatarsIndex: number = urlParts.findIndex(
        (part: string) => part === "avatars"
      );
      if (avatarsIndex !== -1) {
        const filePath = urlParts.slice(avatarsIndex + 1).join("/");
        if (filePath) {
          await supabase.storage.from("avatars").remove([filePath]);
        }
      }
    }

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}.${fileExt}`;

    // Upload new avatar
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });
    console.log(data, error);

    if (error) {
      toast.error("Error uploading avatar: " + error.message);
      return;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;

    // Update profile with new avatar URL
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    if (updateError) {
      toast.error("Error saving avatar URL");
      return;
    }

    const publicUrlWithTimestamp = publicUrl + "?t=" + Date.now();
    setAvatarUrl(publicUrlWithTimestamp);
    toast.success("Avatar updated!");
    console.log("Avatar public URL:", publicUrlWithTimestamp);
    setTimeout(() => window.location.reload(), 1000);
  };

  // const toggleDarkMode = () => {
  //   setIsDarkMode(!isDarkMode);
  //   document.documentElement.classList.toggle("dark", !isDarkMode);
  // };

  const handleCancelAccount = async () => {
    try {
      setIsDeleting(true); // Start the deleting state
      
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      
      if (userError) {
        toast.error("Error getting user information");
        setShowCancelModal(false);
        setIsDeleting(false);
        return;
      }

      if (!user) {
        toast.error("No user found");
        setShowCancelModal(false);
        setIsDeleting(false);
        return;
      }

      // Check if user has an active subscription and attempt to cancel it
      if (currentPlan && !isFreePlan(currentPlan)) {
        console.log(`User has active ${currentPlan} subscription, attempting to cancel...`);
        
        try {
          // Get user profile to check for plan (subscription_id will be added later)
          console.log('Fetching profile for user ID:', user.id);
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('plan')
            .eq('id', user.id)
            .single();

          console.log('Profile fetch result:', { profile, profileError });

          if (profileError) {
            console.error("Error fetching profile:", profileError);
            toast.error(`Error fetching subscription details: ${profileError.message}`);
            setIsDeleting(false);
            return;
          }

          if (!profile) {
            console.error("No profile found for user");
            toast.error("No profile found for user");
            setIsDeleting(false);
            return;
          }

          // Cancel Stripe subscription and delete customer
          // Use user email as fallback if no customer_id is available
          console.log('Attempting to cancel Stripe subscription and delete customer...');
          console.log('Request payload:', {
            customerId: null,
            subscriptionId: null,
            userEmail: user.email
          });
          
          const response = await fetch('http://localhost:3000/api/cancel-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              customerId: null, // We don't have customer_id stored yet
              subscriptionId: null, // We don't have subscription_id stored yet
              userEmail: user.email
            }),
          });

          console.log('Response status:', response.status);
          console.log('Response ok:', response.ok);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response error:', errorText);
            throw new Error(`Server error: ${response.status} - ${errorText}`);
          }

          const result = await response.json();
          console.log('Stripe cancellation result:', result);
          
          if (result.success) {
            console.log('Stripe subscription cancelled and customer deleted:', result);
            if (result.subscriptionsCancelled > 0) {
              toast.success(`Successfully cancelled ${result.subscriptionsCancelled} subscription(s) and deleted Stripe customer`);
            } else {
              toast.success('Stripe customer deleted (no active subscriptions found)');
            }
          } else {
            console.error('Stripe cancellation failed:', result.error);
            toast.error(`Failed to cancel Stripe subscription: ${result.error}`);
            // Continue with account deletion even if Stripe fails
          }
            
        } catch (stripeError) {
          console.error('Error cancelling Stripe subscription:', stripeError);
          
          // Check if it's a network error vs API error
          if (stripeError instanceof TypeError && stripeError.message.includes('fetch')) {
            toast.error('Unable to connect to payment server. Continuing with account deletion...');
          } else {
            toast.error('Error cancelling subscription. Continuing with account deletion...');
          }
          // Continue with account deletion even if Stripe fails
        }
      } else {
        console.log('User has free/basic plan, no Stripe subscription to cancel');
      }

      // Delete user data from database
      console.log("Deleting user data from database...");
      const { data, error: deleteError } = await supabase.rpc('delete_user_account');

      if (deleteError) {
        console.error("Error deleting user data:", deleteError);
        toast.error("Error deleting account data. Please try again or contact support.");
        setShowCancelModal(false);
        setIsDeleting(false);
        return;
      }

      console.log("User data deletion result:", data);

      if (!data || !data.success) {
        console.error("Database error:", data?.message || "Unknown error");
        toast.error("Error deleting account data. Please contact support.");
        setShowCancelModal(false);
        setIsDeleting(false);
        return;
      }

      console.log("User data deleted successfully, signing out...");

      // Clear all localStorage data
      console.log("Clearing all localStorage data...");
      localStorage.clear();

      // Sign out the user
      await supabase.auth.signOut();

      console.log("Account successfully deleted");
      toast.success("Your account has been successfully deleted. Thank you for using our service.");

      // Redirect to home page after a 5-second delay so you can read console logs
      console.log("Redirecting to home page in 5 seconds...");
      setTimeout(() => {
        window.location.href = "/";
      }, 5000);

    } catch (error) {
      console.error("Account cancellation error:", error);
      toast.error("An unexpected error occurred while deleting your account. Please contact support.");
      setShowCancelModal(false);
      setIsDeleting(false);
    }
  };

  const handleOpenCustomerPortal = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast.error("Please log in to access the customer portal");
        return;
      }

      // Check if user is on free/basic plan
      if (isFreePlan(currentPlan)) {
        console.log('User is on free/basic plan, creating basic customer and redirecting to upgrade');
        
        // For free users, we'll create a basic customer and then redirect to checkout for upgrade
        try {
          const response = await fetch('http://localhost:3000/api/create-basic-customer-and-checkout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userEmail: user.email,
              userName: username || user.email?.split('@')[0] || 'User',
              priceId: 'price_1Rj9b7Apncs80C2oHFbyg25v' // Your existing $0 subscription price
            }),
          });

          const data = await response.json();

          if (data.success && data.url) {
            // Redirect to Stripe checkout for upgrade
            window.location.href = data.url;
          } else {
            toast.error(data.error || 'Failed to create upgrade session');
          }
        } catch (error) {
          console.error('Error creating upgrade session:', error);
          toast.error('Failed to create upgrade session');
        }
        return;
      }

      // For paid users, open the customer portal
      const response = await fetch('http://localhost:3000/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: null, // Will be added later when customer_id column exists
          userEmail: user.email
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        // Open portal in same window so return URL works
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Failed to open customer portal');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Failed to open customer portal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="loader absolute top-1/2 left-1/2">
            <div className="loader-item"></div>
            <div className="loader-item"></div>
            <div className="loader-item"></div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
          <div className="w-full max-w-2xl space-y-8">
            <h1 className="text-3xl font-bold text-white mb-8 text-center">
              Profile Settings
            </h1>

            {/* Avatar Section */}
            <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-6 flex flex-col items-center shadow-lg">
              <h2 className="text-xl font-semibold text-white mb-4">Profile Avatar</h2>
              <div className="relative flex flex-col items-center">
                <img
                  src={avatarUrl || "https://ui-avatars.com/api/?name=User"}
                  alt="Avatar"
                  className="w-36 h-36 rounded-full object-cover mb-2 border-4 border-indigo-500"
                />
                <button
                  className="bg-green-600 hover:bg-green-700 border border-green-500 text-white px-3 py-1 text-xs rounded absolute shadow"
                  style={{ minWidth: '60px', bottom: '40px', right: '24px', transform: 'translate(50%, 50%)' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Update
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
            </div>

            {/* Profile Info Cards Group */}
            <div className="w-full flex flex-col gap-4 bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-300/20">
              {/* Username Update Card */}
              <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-6 shadow-lg">
                <h2 className="text-lg font-semibold text-white mb-4">Update Username</h2>
                <form onSubmit={handleUpdateProfile}>
                  <FormInput
                    id="username"
                    type="text"
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    icon={User}
                    required
                  />
                  <button
                    type="submit"
                    className="w-full flex justify-center mt-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Update Username
                  </button>
                </form>
              </div>

              {/* Email Update Card */}
              <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-6 shadow-lg">
                <h2 className="text-lg font-semibold text-white mb-4">Update Email</h2>
                <form onSubmit={handleUpdateEmail}>
                  <FormInput
                    id="email"
                    type="email"
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={Mail}
                    required
                  />
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 mt-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Update Email
                  </button>
                </form>
              </div>

              {/* Password Update Card */}
              <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-6 shadow-lg">
                <h2 className="text-lg font-semibold text-white mb-4">Update Password</h2>
                <form onSubmit={handleUpdatePassword}>
                  <FormInput
                    id="password"
                    type="password"
                    label="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={Lock}
                    required
                  />
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 mt-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            </div>

            {/* Subscription Section */}
            <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-white mb-2">
                Subscription
              </h2>
              <div className="mb-2 text-gray-300">
                Current Plan: <span className="font-bold capitalize">{currentPlan} Plan</span>
              </div>
              <div className="text-gray-500 mb-6 text-sm">
                {isFreePlan(currentPlan) ? 
                  'Upgrade to a paid plan to unlock more features and trading strategies.' :
                  'Update/Cancel your subscription plan or manage your billing details through the customer portal.'
                }
              </div>
              <button
                type="button"
                onClick={handleOpenCustomerPortal}
                disabled={!user || isLoading}
                className="text-white shadow-lg mb-2 text-sm font-medium block w-full text-center py-2 rounded-lg transition-colors bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none"
              >
                {isLoading ? 'Opening Portal...' : 
                  isFreePlan(currentPlan) ? 
                  'Upgrade Subscription' : 'Manage Subscription'}
              </button>
            </div>

            {/* Cancel Account Section */}
            <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-6 shadow-lg flex flex-col items-center">
              <button
                type="button"
                className="w-full max-w-xs flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={() => setShowCancelModal(true)}
              >
                Cancel Ufulu Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Account Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">
              Cancel Your Account
            </h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to cancel your Ufulu account? This action cannot be undone and you will lose access to all your data and trading strategies.
            </p>
            <div className="bg-blue-900 border border-blue-600 rounded-lg p-4 mb-6">
              <p className="text-blue-200 text-sm">
                <strong>ℹ️ Note:</strong> If you have an active subscription, it will be automatically canceled as part of the account deletion process.
              </p>
            </div>
            <div className="flex gap-4 justify-end">
              <button
                type="button"
                className="px-4 py-2 text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setShowCancelModal(false)}
                disabled={isDeleting}
              >
                Keep Account
              </button>
              <button
                type="button"
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                onClick={handleCancelAccount}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Deleting Account...
                  </>
                ) : (
                  "Yes, Cancel Account"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Settings;
