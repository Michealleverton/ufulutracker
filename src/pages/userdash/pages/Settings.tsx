import React, { useState, useEffect } from "react";
import { Mail, Lock, User, Moon, Sun } from "lucide-react";
import { FormInput } from "../components/FormInput";
import { supabase } from "../../../lib/supabase";
import toast from "react-hot-toast";
import { useTheme } from "../../../Context/ThemeContext";

const Settings = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentPlan, setCurrentPlan] = useState(""); // Store the user's current plan
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    setIsLoading(true); // Start loading
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, plan")
        .eq("id", user.id)
        .single();

      if (data) {
        setUsername(data.username);
        setCurrentPlan(data.plan); // Set the current plan
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
      }
    }
  };

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
      // Check if the email already exists
      const { data: existingEmails, error: emailError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email);

      if (emailError) {
        console.error("Error checking email:", emailError);
        toast.error("Error checking email");
        return;
      }

      if (existingEmails.length > 0 && existingEmails[0].id !== user.id) {
        toast.error("Email already exists");
        return;
      }

      const { error } = await supabase.auth.updateUser({ email });
      if (error) {
        console.error("Error updating email:", error);
        toast.error("Error updating email");
      } else {
        // Update the email in the profiles table as well
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ email })
          .eq("id", user.id);

        if (profileError) {
          console.error("Error updating email in profile:", profileError);
          toast.error("Error updating email in profile");
        } else {
          toast.success("Email updated successfully");
        }
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

  const handlePlanChange = async (newPlan: string) => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) {
      toast.error("Error fetching user");
      return;
    }

    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({ plan: newPlan })
        .eq("id", user.id);

      if (error) {
        toast.error("Error updating plan");
      } else {
        setCurrentPlan(newPlan); // Update the current plan in state
        toast.success(`Plan updated to ${newPlan}`);
      }
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark", !isDarkMode);
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
        <div className="flex flex-row gap-10 justify-center">
          {/* User Info Section */}
          <div className="w-[28rem] mt-[7rem] p-6 bg-gray-800 dark:bg-gray-200 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold text-white dark:text-black mb-6">
              Update User Info
            </h2>
            <form
              onSubmit={handleUpdateProfile}
              className={`space-y-6 mb-4 ${
                isDarkMode ? "text-black" : "text-white"
              }`}
            >
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
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Update Username
              </button>
            </form>
            <form onSubmit={handleUpdateEmail} className="space-y-6 mb-4">
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
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Update Email
              </button>
            </form>
            <form onSubmit={handleUpdatePassword} className="space-y-6 mb-4">
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
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Update Password
              </button>
            </form>
            <div
              className={`p-12 ${
                theme === "dark"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-black"
              }`}
            >
              <h1 className="text-3xl font-bold mb-6">Settings</h1>
              <button
                onClick={toggleTheme}
                className={`px-4 py-2 rounded ${
                  theme === "dark"
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-300 text-black"
                }`}
              >
                Switch to {theme === "dark" ? "Light" : "Dark"} Mode
              </button>
            </div>
          </div>

          {/* Plan Management Section */}
          <div className="flex justify-center mt-28">
            <div className="w-[28rem] p-6 bg-gray-800 dark:bg-gray-200 rounded-lg shadow-xl">
              <h2 className="text-2xl font-bold text-white dark:text-black mb-14">
                Manage Your Subscription
              </h2>

              {/* Current Plan */}
              <div className="w-full p-4 bg-indigo-600 rounded-lg shadow-lg mb-6">
                <h3 className="text-lg font-bold text-white uppercase">
                  Current Plan :{" "}
                  <span className="font-semibold capitalize">
                    {" "}
                    {currentPlan} Plan
                  </span>
                </h3>
              </div>

              {/* Plan Options */}
              <div className="flex flex-col gap-4">
                {[
                  { name: "basic", title: "Basic Plan", price: "$0/month" },
                  { name: "pro", title: "Pro Plan", price: "$9.99/month" },
                  {
                    name: "premium",
                    title: "Premium Plan",
                    price: "$14.99/month",
                  },
                ]
                  .filter((plan) => plan.name !== currentPlan) // Exclude the current plan
                  .map((plan) => (
                    <div
                      key={plan.name}
                      className="p-4 rounded-lg shadow-lg bg-gray-700 last:mb-0"
                    >
                      <h3 className="text-lg font-bold text-white mb-2">
                        {plan.title}
                      </h3>
                      <p className="text-white mb-4">{plan.price}</p>
                      <button
                        onClick={() => handlePlanChange(plan.name)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                      >
                        Switch to {plan.title}
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Settings;
