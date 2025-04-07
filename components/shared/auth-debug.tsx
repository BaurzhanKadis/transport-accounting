"use client";

import { Button } from "@/components/ui/button";
import useAuthStore from "@/store/authUser";
import { useState } from "react";

export function AuthDebug() {
  const { user, fetchUser, isLoading, isInitialized, error } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleRefresh = async () => {
    try {
      await fetchUser();
    } catch (err) {
      console.error("Error refreshing user:", err);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700"
        >
          Debug Auth
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 p-4 bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">Auth Debug Panel</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="h-6 w-6 p-0"
        >
          ✕
        </Button>
      </div>

      <div className="space-y-2 text-sm mb-3">
        <div className="flex justify-between">
          <span className="font-medium">Is Initialized:</span>
          <span>{isInitialized ? "✅ Yes" : "❌ No"}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Is Loading:</span>
          <span>{isLoading ? "⏳ Yes" : "✅ No"}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Is Authenticated:</span>
          <span>{user ? "✅ Yes" : "❌ No"}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Has Error:</span>
          <span>{error ? "❌ Yes" : "✅ No"}</span>
        </div>
        {error && (
          <div className="bg-red-50 p-2 rounded text-red-700 text-xs">
            {error.message}
          </div>
        )}
      </div>

      {user && (
        <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
          <div className="font-medium mb-1">User Data:</div>
          <pre className="overflow-auto max-h-24">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      )}

      <Button
        onClick={handleRefresh}
        size="sm"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "Loading..." : "Refresh Auth State"}
      </Button>
    </div>
  );
}
