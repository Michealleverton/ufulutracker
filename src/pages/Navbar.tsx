import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CircleDollarSign, Users, Menu, X, LogIn, LayoutDashboard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import logoicon from '../assets/ufululogo.png'

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  const navLinks = [
    { 
      to: "#pricing", 
      icon: CircleDollarSign, 
      text: "Pricing",
      onClick: () => scrollToSection('pricing')
    },
    { 
      to: "#aifeature", 
      icon: CircleDollarSign, 
      text: "AI Assistant",
      onClick: () => scrollToSection('aifeature')
    },
    { to: "/community", icon: Users, text: "Community" },
    { 
      to: "#about", 
      icon: Users, 
      text: "About Us",
      onClick: () => scrollToSection('about')
    },
    { 
      to: isLoggedIn ? "/dashboard" : "/login", 
      icon: isLoggedIn ? LayoutDashboard : LogIn, 
      text: isLoggedIn ? "Dashboard" : "Login" 
    }
  ];

  return (
    <nav className="sticky top-0 bg-gray-800 shadow-lg border-b border-gray-700 z-50 py-2">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">

          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src={logoicon} alt="Ufulu Tracker Logo" className="h-12 w-12 rounded-full mr-4 bg-white" />
              <span className="ml-2 text-xl font-bold text-white">Ufulu Tracker</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map(({ to, icon: Icon, text, onClick }) => (
              <Link
                key={to}
                to={to}
                onClick={onClick}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-indigo-400"
              >
                <Icon className="h-5 w-5 mr-1" />
                {text}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
          
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-800">
            {navLinks.map(({ to, icon: Icon, text, onClick }) => (
              <Link
                key={to}
                to={to}
                onClick={onClick}
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-indigo-400 hover:bg-gray-700"
              >
                <Icon className="h-5 w-5 mr-2" />
                {text}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};
