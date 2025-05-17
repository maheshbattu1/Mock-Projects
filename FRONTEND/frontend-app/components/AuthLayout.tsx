'use client';

import React, { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getUser } from "@/lib/auth";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is authenticated using our utility function
    if (!isAuthenticated()) {
      router.push("/signin");
      return;
    }

    // Get user data from localStorage
    const userData = getUser();
    if (!userData) {
      router.push("/signin");
      return;
    }

    setUser(userData);
    setLoading(false);
  }, [router]);

  if (loading) return <div className="p-4">Loading...</div>;

  return <>{children}</>;
}
