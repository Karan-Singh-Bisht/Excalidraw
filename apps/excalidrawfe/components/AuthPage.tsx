"use client";

import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Zap, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

export function AuthPage({ isSignIn }: { isSignIn: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function handleAuth(isSignIn: boolean) {
    try {
      const response = await axios.post(
        `http://localhost:3001/api/v1/auth/${isSignIn ? "signin" : "signup"}`,
        isSignIn ? { email, password } : { email, password, username }
      );
      console.log("Auth success", response.data);
      if (response?.data?.token) {
        router.push("/");
      }
    } catch (err: any) {
      console.error("Auth failed:", err.response?.data || err.message);
      alert("Authentication failed. Check your credentials.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {isSignIn ? "Welcome Back!" : "Create an Account"}
        </h2>

        <div className="space-y-4">
          {!isSignIn && (
            <input
              type="text"
              placeholder="Enter your username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-black focus:ring-2 focus:ring-blue-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-black focus:ring-2 focus:ring-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="flex items-center">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-black focus:ring-2 focus:ring-purple-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Eye
              className="text-black hover:cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            ></Eye>
          </div>

          <button
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 rounded-lg hover:shadow-md transition-all duration-300"
            onClick={() => {
              handleAuth(isSignIn);
            }}
          >
            {isSignIn ? "Sign In" : "Sign Up"}
          </button>
        </div>

        {isSignIn ? (
          <p className="mt-4 text-sm text-center text-gray-500">
            Don’t have an account?{" "}
            <Link
              onClick={() => {
                setEmail(""), setPassword(""), setUsername("");
              }}
              href="/signup"
              className="text-blue-600 cursor-pointer hover:underline"
            >
              Sign up
            </Link>
          </p>
        ) : (
          <p className="mt-4 text-sm text-center text-gray-500">
            Already have an account?{" "}
            <Link
              href={"/signin"}
              className="text-blue-600 cursor-pointer hover:underline"
            >
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
