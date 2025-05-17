'use client';

import React from "react";
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Home, UserPlus, Settings, PlusSquare, List, UserCircle } from 'lucide-react';
import { useQuery, useApolloClient } from "@apollo/client";
import { ME_QUERY } from "@/graphql/quaries";
import { getUser, logout, hasRole, isAdmin, isAgent } from "@/lib/auth";
import { UserRole } from "@/lib/types";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { data, loading } = useQuery(ME_QUERY);
  const client = useApolloClient();
  const user = getUser();

  const handleSignOut = () => {
    logout();
    client.clearStore();
    window.location.href = "/signin";
  };

  return (
    <div
      className="relative h-[300px] bg-gradient-to-br from-blue-900 to-black bg-blend-darken text-white"
      style={{
        backgroundImage:
          "url('https://images.pexels.com/photos/280221/pexels-photo-280221.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-opacity-70 bg-black flex flex-col justify-between">
        {/* Top Navigation */}
        <div className="flex items-center justify-between px-6 py-4">
          <Link href="/">
            <h1 className="text-2xl font-bold cursor-pointer">DWELZO</h1>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/properties" className="hover:text-gray-300 flex items-center gap-1">
              <Home size={18} />
              <span>Properties</span>
            </Link>
            
            {/* Show "Post Property" only to agents and admins */}
            {user && (isAgent() || isAdmin()) && (
              <Link href="/create-property" className="bg-white text-black px-4 py-1 rounded hover:bg-gray-200 flex items-center gap-1">
                <PlusSquare size={18} />
                <span>Post Property</span>
              </Link>
            )}
            
            {loading ? (
              <span>Loading...</span>
            ) : user ? (
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <UserCircle size={20} />
                  <span>{user.name}</span>
                  <span className="text-xs ml-2">▼</span>
                </button>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      {/* Display user role badge */}
                      <span className={`inline-block mt-1 px-2 py-1 rounded text-xs ${
                        user.role === UserRole.ADMIN 
                          ? 'bg-red-100 text-red-800' 
                          : user.role === UserRole.AGENT 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role || UserRole.USER}
                      </span>
                    </div>
                    
                    <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Dashboard
                    </Link>
                    
                    <Link href="/favorites" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      My Favorites
                    </Link>
                    
                    {/* Admin-only links */}
                    {isAdmin() && (
                      <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Admin Panel
                      </Link>
                    )}
                    
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/signin" className="text-sm hover:underline flex items-center gap-1">
                  <UserCircle size={18} />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/signup"
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded flex items-center gap-1"
                >
                  <UserPlus size={18} />
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden px-6 space-y-2 pb-4 bg-black bg-opacity-80 rounded">
            <Link href="/properties" className="block w-full text-left py-2 flex items-center gap-2">
              <Home size={18} />
              <span>Properties</span>
            </Link>
            
            {/* Show "Post Property" only to agents and admins */}
            {user && (isAgent() || isAdmin()) && (
              <Link href="/create-property" className="block w-full text-left py-2 flex items-center gap-2">
                <PlusSquare size={18} />
                <span>Post Property</span>
              </Link>
            )}
            
            {loading ? (
              <span>Loading...</span>
            ) : user ? (
              <>
                <div className="py-2 border-t border-gray-700">
                  <div className="flex items-center gap-2">
                    <UserCircle size={18} />
                    <span>{user.name}</span>
                  </div>
                  <span className={`inline-block mt-1 px-2 py-1 rounded text-xs ${
                    user.role === UserRole.ADMIN 
                      ? 'bg-red-100 text-red-800' 
                      : user.role === UserRole.AGENT 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role || UserRole.USER}
                  </span>
                </div>
                
                <Link href="/dashboard" className="block w-full text-left py-2 pl-6">
                  Dashboard
                </Link>
                
                <Link href="/favorites" className="block w-full text-left py-2 pl-6">
                  My Favorites
                </Link>
                
                {/* Admin-only links */}
                {isAdmin() && (
                  <Link href="/admin" className="block w-full text-left py-2 pl-6">
                    Admin Panel
                  </Link>
                )}
                
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left py-2 text-red-400 hover:text-red-300"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/signin" className="block w-full text-left py-2 flex items-center gap-2">
                  <UserCircle size={18} />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/signup"
                  className="inline-block px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded flex items-center gap-2 mt-2"
                >
                  <UserPlus size={18} />
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>
        )}

        {/* Hero Text */}
        <div className="px-6 py-8">
          <h2 className="text-xl">LIMITED PERIOD OFFER</h2>
          <p className="text-sm">
            Premium 3 BHK Homes in Patancheru - ₹1 Cr. Onwards
          </p>
        </div>
      </div>
    </div>
  );
}
