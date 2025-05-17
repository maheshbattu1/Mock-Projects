"use client";

import React from "react";
import { useState } from "react";
import { useMutation } from "@apollo/client";
import { SIGNUP_MUTATION } from "@/graphql/mutations";
import { useRouter } from "next/navigation";
import { saveToken, saveUser } from "@/lib/auth";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState<string>("");
  const [address, setAddress] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [signup, { loading, error: mutationError }] = useMutation(SIGNUP_MUTATION);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(""); // Clear any previous errors
    
    try {
      const { data } = await signup({
        variables: { 
          name, 
          email, 
          password,
          phone: phone || undefined,
          age: age ? parseInt(age, 10) || undefined : undefined,
          address: address || undefined
        },
      });
      
      if (data.signup.success) {
        // Save the JWT token and user to localStorage
        saveToken(data.signup.token);
        saveUser(data.signup.user);
        
        // Navigate to dashboard directly since user is now authenticated
        router.push("/dashboard");
      } else {
        // Display specific error from the response
        setErrorMessage(data.signup.error || "Sign up failed");
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      
      // Extract detailed error message from GraphQL error
      const graphQLError = err.graphQLErrors?.[0]?.message;
      const networkError = err.networkError?.message;
      
      // Set a user-friendly error message, preferring GraphQL errors
      if (graphQLError?.includes("hashed_password")) {
        setErrorMessage("The server is experiencing a database configuration issue. Please contact support.");
      } else if (graphQLError) {
        setErrorMessage(graphQLError);
      } else if (networkError) {
        setErrorMessage(`Network error: ${networkError}`);
      } else {
        setErrorMessage("An unexpected error occurred during signup. Please try again later.");
      }
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Required fields */}
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
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
        
        {/* Optional fields */}
        <details className="mb-4">
          <summary className="cursor-pointer text-blue-500 hover:text-blue-700">
            Additional Information (Optional)
          </summary>
          <div className="mt-3 space-y-4">
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full p-2 border rounded"
              min="0"
              max="120"
            />
            <input
              type="text"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </details>
        
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errorMessage}
          </div>
        )}
        
        {mutationError && !errorMessage && (
          <p className="text-red-500 mt-2">An error occurred. Please try again.</p>
        )}
      </form>
    </div>
  );
}