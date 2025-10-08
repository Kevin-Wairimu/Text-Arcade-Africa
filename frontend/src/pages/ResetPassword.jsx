import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAlert } from '../context/AlertContext';

export default function ResetPassword() {
  const { token } = useParams(); // Gets the token from the URL, e.g., /reset-password/THIS_TOKEN
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return showAlert("Passwords do not match.", "error");
    }
    if (password.length < 6) {
      return showAlert("Password must be at least 6 characters long.", "error");
    }

    setLoading(true);
    try {
      // We will create this API endpoint in the next step
      const { data } = await API.post(`/api/auth/reset-password/${token}`, { password });
      
      showAlert(data.message, "success");
      
      // Redirect to the login page after a successful reset
      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (err) {
      const errorMessage = err.response?.data?.message || "Invalid or expired token. Please try again.";
      showAlert(errorMessage, "error");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-emerald-50 to-white">
      <div className="bg-white/70 backdrop-blur-md p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
        <h1 className="text-3xl font-bold text-center text-taa-primary mb-2">
          Reset Your Password
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-taa-accent"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-taa-accent"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-taa-primary hover:bg-taa-accent text-white py-3 rounded-lg transition font-medium disabled:bg-gray-400"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </main>
  );
}