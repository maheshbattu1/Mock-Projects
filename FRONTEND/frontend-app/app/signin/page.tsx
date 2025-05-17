"use client";

import React from "react";
import { useState } from "react";
import { useMutation } from "@apollo/client";
import { SIGNIN_MUTATION } from "@/graphql/mutations";
import { useRouter } from "next/navigation";
import { saveToken, saveUser } from "@/lib/auth";

export default function SigninPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const [signin, { loading }] = useMutation(SIGNIN_MUTATION, {
    onCompleted: (data) => {
      if (data.signin.success) {
        // Save the JWT token and user to localStorage
        if (data.signin.token) {
          saveToken(data.signin.token);
          if (data.signin.user) {
            saveUser(data.signin.user);
          }
          // Navigate to dashboard
          router.push("/dashboard");
        } else {
          setErrorMessage("Authentication successful but no token received");
        }
      } else {
        // Use message field or error field as fallback
        setErrorMessage(data.signin.message || data.signin.error || "Sign in failed");
      }
    },
    onError: (error) => {
      console.error("Signin error:", error);
      setErrorMessage(error.message || "An error occurred during sign in");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      await signin({
        variables: { email, password },
      });
    } catch (err) {
      console.error("Form submission error:", err);
      // Error will be handled by onError callback
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sign In</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      </form>
    </div>
  );
}