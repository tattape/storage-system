"use client";
import { Spinner } from "@heroui/react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-secondary-100 to-secondary-300">
      <Spinner size="lg" color="secondary" />
      <div className="mt-4 text-lg text-blue-700 font-semibold">Loading...</div>
    </div>
  );
}
