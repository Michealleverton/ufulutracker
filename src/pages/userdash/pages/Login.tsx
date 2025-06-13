import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { FormInput } from '../components/FormInput';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import { Navbar } from '../../Navbar';
import loginbacking from '../../../assets/loginbacking.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Successfully logged in!');
      navigate('/dashboard'); // Redirect to dashboard after login
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <Navbar />
      </div>
      <div
        className="min-h-screen bg-local bg-center flex items-center justify-center px-4"
        style={{ backgroundImage: `url(${loginbacking})` }}
      >
        <div className="max-w-md w-full bg-gray-800 bg-opacity-90 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <LogIn className="h-12 w-12 text-indigo-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
            <p className="text-gray-300 mt-2 dark:text-black">Sign in to your Ufulu Tracker account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-300">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-500">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;