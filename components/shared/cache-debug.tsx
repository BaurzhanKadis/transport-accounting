"use client";

import { Button } from "@/components/ui/button";
import { cacheService } from "@/services/cache";
import { useState, useEffect } from "react";

export function CacheDebug() {
  const [isOpen, setIsOpen] = useState(false);
  const [cacheSize, setCacheSize] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Обновление статистики кеша каждую секунду
  useEffect(() => {
    if (!isOpen) return;

    const intervalId = setInterval(() => {
      setCacheSize(cacheService.size());
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isOpen]);

  // Обновление при открытии панели
  useEffect(() => {
    if (isOpen) {
      setCacheSize(cacheService.size());
    }
  }, [isOpen, refreshKey]);

  const handleClearCache = () => {
    cacheService.clear();
    setCacheSize(0);
    setRefreshKey((prev) => prev + 1);
  };

  const handleCleanupCache = () => {
    cacheService.cleanup();
    setCacheSize(cacheService.size());
    setRefreshKey((prev) => prev + 1);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-20 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="bg-blue-100 hover:bg-blue-200 text-blue-700"
        >
          Cache Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 w-80 p-4 bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">Cache Debug Panel</h3>
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
          <span className="font-medium">Cache Size:</span>
          <span>{cacheSize} items</span>
        </div>
      </div>

      <div className="flex space-x-2">
        <Button
          onClick={handleCleanupCache}
          size="sm"
          variant="outline"
          className="flex-1"
        >
          Cleanup Expired
        </Button>
        <Button
          onClick={handleClearCache}
          size="sm"
          variant="destructive"
          className="flex-1"
        >
          Clear All
        </Button>
      </div>
    </div>
  );
}
