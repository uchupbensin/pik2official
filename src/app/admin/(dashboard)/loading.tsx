import React from 'react';
import { Building2, ListTree, Star } from 'lucide-react';

export default function LoadingDashboard() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="mb-8">
        <div className="h-8 w-64 bg-gray-200 rounded-md mb-2"></div>
        <div className="h-5 w-96 bg-gray-200 rounded-md"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Skeleton Stat Cards */}
        {[1, 2, 3].map((item) => (
          <div key={item} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="p-3 bg-gray-100 rounded-xl h-12 w-12 flex-shrink-0"></div>
            <div className="w-full">
              <div className="h-4 w-24 bg-gray-200 rounded-md mb-2"></div>
              <div className="h-8 w-16 bg-gray-200 rounded-md"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Skeleton Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div className="h-6 w-40 bg-gray-200 rounded-md"></div>
            <div className="h-5 w-20 bg-gray-200 rounded-md"></div>
          </div>
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((row) => (
              <div key={row} className="flex justify-between items-center border-b border-gray-50 pb-4">
                <div className="space-y-2">
                  <div className="h-5 w-48 bg-gray-200 rounded-md"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded-md"></div>
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded-md"></div>
                <div className="h-6 w-16 bg-gray-200 rounded-md"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Skeleton Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="h-6 w-32 bg-gray-200 rounded-md mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-14 w-full bg-gray-100 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
