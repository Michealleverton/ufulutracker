import React from 'react';
import { Github, Twitter, Linkedin, Facebook } from 'lucide-react';

export const Footer = () => {
  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com/ufulutracker', label: 'Twitter' },
    { icon: Github, href: 'https://github.com/ufulutracker', label: 'GitHub' },
    { icon: Linkedin, href: 'https://linkedin.com/company/ufulutracker', label: 'LinkedIn' },
    { icon: Facebook, href: 'https://facebook.com/ufulutracker', label: 'Facebook' },
  ];

  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-sm text-center">
            Copyright © Ufulu Inc. 2025 - All Rights Reserved.
          </div>
          <div className="flex space-x-6">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-indigo-400 transition-colors"
                aria-label={label}
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
