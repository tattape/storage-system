'use client'

import Image from "next/image";
import { getAllBaskets } from "../services/baskets";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
      setChecking(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
        <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        <div className="mt-4 text-lg text-blue-700 font-semibold">Loading...</div>
      </div>
    );
  }
  return null;
}
