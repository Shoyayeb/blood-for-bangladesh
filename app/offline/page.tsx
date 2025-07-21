'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, RefreshCw, WifiOff } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <WifiOff className="w-8 h-8 text-gray-400" />
          </div>
          <CardTitle>You&apos;re Offline</CardTitle>
          <CardDescription>
            No internet connection detected. Some features may not be available.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 space-y-2">
            <p>You can still:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>View cached pages you&apos;ve visited</li>
              <li>Access your saved information</li>
              <li>Use basic app features</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <Button
              onClick={() => window.location.reload()}
              className="w-full"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Link href="/" className="block">
              <Button variant="ghost" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Go to Home
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Blood for Bangladesh works best with an internet connection
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
