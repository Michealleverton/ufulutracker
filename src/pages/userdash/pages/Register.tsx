import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import { FormInput } from '../components/FormInput';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import {Navbar} from '../../Navbar';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        if (authError.message === 'User already registered') {
          throw new Error('This email is already registered. Please try logging in instead.');
        }
        throw authError;
      }

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ id: authData.user.id, username }]);

        if (profileError) {
          if (profileError.code === '23505') {
            throw new Error('This username is already taken. Please choose another one.');
          }
          throw profileError;
        }
      }

      toast.success('Registration successful! Please check your email to verify your account.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div>
      <Navbar />
    </div>
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <UserPlus className="h-12 w-12 text-indigo-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white">Create Account</h2>
          <p className="text-gray-300 mt-2">Join Ufulu Tracker and start your journey</p>
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-300">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-500">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default Register