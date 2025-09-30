// Layout.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-white ">
      {/* Navbar */}
      <nav className="  text-gray-900 px-10 py-4 shadow-md flex justify-between items-center w-full fixed z-10 bg-white">
        <div className="text-2xl font-bold">
          <Link to="/" className="text-purple-500">CrowdFunding</Link>
        </div>
        <div className="space-x-6">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/my-campaigns" className="hover:underline">My Campaigns</Link>
          <Link to="/my-contributions" className="hover:underline">My Contributions</Link>
          <Link to="/create" className="hover:underline">Create Campaign</Link>
        </div>
      </nav>

      {/* Contenu central */}
      <main className="flex-1 p-6 mt-15 z-0">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-300 items-center justify-center text-gray-900 text-center py-10 mt-auto">
        &copy; {new Date().getFullYear()} CrowdFunding. Tous droits réservés.
      </footer>
    </div>
  );
}
