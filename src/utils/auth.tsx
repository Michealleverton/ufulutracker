import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error logging out:', error);
    toast.error('Error logging out');
  } else {
    toast.success('Logged out successfully');
    const navigate = useNavigate();
    navigate('/login'); // Redirect to login page after logout
  }
};