import React from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Public Employment Service Office
                </span>
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-blue-100 hover:text-white transition-colors duration-200 font-medium">
                Dashboard
              </a>
              <a href="#" className="text-blue-100 hover:text-white transition-colors duration-200 font-medium">
                Jobs
              </a>
              <a href="#" className="text-blue-100 hover:text-white transition-colors duration-200 font-medium">
                Profile
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium">
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <Outlet />
        </div>
      </main>

      <footer className="bg-gray-800 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm">
              © 2025 Public Employment Service Office. All rights reserved.
            </p>
            <div className="mt-4 flex justify-center space-x-6 text-xs">
              <a href="#" className="hover:text-white transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors duration-200">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition-colors duration-200">
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
