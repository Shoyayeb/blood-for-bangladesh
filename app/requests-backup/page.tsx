'use client';

import { ActiveBloodRequests } from '@/components/active-blood-requests';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Heart } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function RequestsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="grid gap-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export default function ActiveRequestsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <Heart className="h-8 w-8 text-red-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Active Blood Requests
              </h1>
              <p className="text-gray-600">
                Help save lives by responding to urgent blood requests across Bangladesh
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <Card className="mb-8 bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800">How You Can Help</CardTitle>
            <CardDescription className="text-red-700">
              Every blood donation can save up to 3 lives. Browse the requests below and contact hospitals directly if you can help.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-red-800 mb-2">For Donors:</h4>
                <ul className="space-y-1 text-red-700">
                  <li>• Check if your blood group matches the request</li>
                  <li>• Ensure you&apos;re eligible to donate (3+ months since last donation)</li>
                  <li>• Contact the hospital directly using the provided phone number</li>
                  <li>• Consider registering as a donor for future notifications</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-red-800 mb-2">Emergency Guidelines:</h4>
                <ul className="space-y-1 text-red-700">
                  <li>• Critical and high urgency requests need immediate attention</li>
                  <li>• Multiple donors may be needed for one request</li>
                  <li>• Verify details with the hospital before traveling</li>
                  <li>• Bring valid ID and be prepared for screening</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Current Blood Requests</CardTitle>
            <CardDescription>
              Filter by blood group, urgency, or hospital zone to find requests you can help with
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<RequestsLoading />}>
              <ActiveBloodRequests />
            </Suspense>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-blue-800 mb-2">
                Want to Get Notified About Requests?
              </h3>
              <p className="text-blue-700 mb-4">
                Register as a donor to receive notifications about blood requests in your area
              </p>
              <Link href="/auth/login">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Register as Donor
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
