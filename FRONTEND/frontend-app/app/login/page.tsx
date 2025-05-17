'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import Button from '@/components/Button';
import { SIGNIN_MUTATION } from '@/graphql/mutations';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [signin, { loading, error }] = useMutation(SIGNIN_MUTATION, {
    onCompleted: (data) => {
      if (data.signin.success) {
        // Store token in localStorage
        if (data.signin.token) {
          localStorage.setItem('token', data.signin.token);
          router.push('/dashboard');
        } else {
          alert("Authentication successful but no token received");
        }
      } else {
        alert(data.signin.message || "Login failed");
      }
    },
    onError: (error) => {
      console.error("Login error:", error);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signin({ variables: { email, password } });
    } catch (err) {
      console.error("Submission error:", err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">Login</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
        />

        <Button
          label={loading ? 'Logging in...' : 'Login'}
          onClick={() => {}}
          className="w-full"
        />

        {error && <p className="text-red-500 text-sm">Error: {error.message}</p>}
      </form>
    </div>
  );
}
