'use client';

import { ActiveBloodRequests } from '@/components/active-blood-requests';
import { NotificationCenter } from '@/components/notification-center';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth-context';
import { daysUntilAvailable, formatBloodGroup, isUserAvailable } from '@/lib/utils-donation';
import { format } from 'date-fns';
import { Bell, Heart, Search } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useState } from 'react';

export function UserDashboard() {
  const { user, logout, refreshUser } = useAuth();
  const [donating, setDonating] = useState(false);
  const [donationNotes, setDonationNotes] = useState('');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600 mb-4">Please login to access your dashboard.</p>
            <Link href="/auth/login">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canDonate = isUserAvailable(user.availableFrom ? new Date(user.availableFrom) : null);
  const daysLeft = user.availableFrom ? daysUntilAvailable(new Date(user.availableFrom)) : 0;

  const handleMarkDonation = async () => {
    setDonating(true);
    try {
      const response = await fetch('/api/users/donate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          notes: donationNotes || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Donation recorded successfully! Thank you for saving lives. 🩸');
        setDonationNotes('');
        await refreshUser(); // Refresh user data
      } else {
        alert(data.error || 'Failed to record donation');
      }
    } catch (error) {
      console.error('Donation error:', error);
      alert('Failed to record donation');
    } finally {
      setDonating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl">🩸</span>
              <h1 className="text-xl font-bold text-gray-900">Blood Donor App</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/search">
                <Button variant="outline">Find Donors</Button>
              </Link>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user.name}! 👋
          </h2>
          <p className="text-gray-600">
            Thank you for being a blood donor. Your contributions save lives.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">👤</span>
                <span>Your Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Name:</span> {user.name}
                </div>
                <div>
                  <span className="font-medium">Phone:</span> {user.phoneNumber}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Blood Group:</span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                    {formatBloodGroup(user.bloodGroup)}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Location:</span> {user.area}, {user.city}, {user.state}
                </div>
                <div className="pt-2">
                  <Link href="/dashboard/profile">
                    <Button variant="outline" size="sm" className="w-full">
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Donation Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">🩸</span>
                <span>Donation Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {canDonate ? (
                  <div className="text-center">
                    <div className="text-green-600 font-semibold mb-2">
                      ✅ Ready to Donate!
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      You&apos;re eligible to donate blood.
                    </p>
                    <div className="space-y-2">
                      <textarea
                        placeholder="Add donation notes (optional)"
                        value={donationNotes}
                        onChange={(e) => setDonationNotes(e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                        rows={2}
                      />
                      <Button 
                        onClick={handleMarkDonation}
                        disabled={donating}
                        className="w-full bg-red-600 hover:bg-red-700"
                      >
                        {donating ? 'Recording...' : 'Mark as Donated'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-orange-600 font-semibold mb-2">
                      ⏳ Cooldown Period
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      You can donate again in <strong>{daysLeft} days</strong>
                    </p>
                    {user.lastDonation && (
                      <p className="text-xs text-gray-500">
                        Last donated: {format(new Date(user.lastDonation), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">⚡</span>
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/search">
                  <Button variant="outline" className="w-full justify-start">
                    🔍 Find Blood Donors
                  </Button>
                </Link>
                <Link href="/dashboard/history">
                  <Button variant="outline" className="w-full justify-start">
                    📋 Donation History
                  </Button>
                </Link>
                <Link href="/dashboard/profile">
                  <Button variant="outline" className="w-full justify-start">
                    ⚙️ Update Profile
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.open('tel:emergency', '_self')}
                >
                  🚨 Emergency Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Impact</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {user.donations?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Donations</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {(user.donations?.length || 0) * 3}
                  </div>
                  <div className="text-sm text-gray-600">Lives Potentially Saved</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {user.isActive ? 'Active' : 'Inactive'}
                  </div>
                  <div className="text-sm text-gray-600">Donor Status</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {formatBloodGroup(user.bloodGroup)}
                  </div>
                  <div className="text-sm text-gray-600">Blood Group</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Notifications and Active Requests */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Blood Requests & Notifications</h3>
          
          <Tabs defaultValue="notifications" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                My Notifications
              </TabsTrigger>
              <TabsTrigger value="active-requests" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Active Requests
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-red-500" />
                    Blood Request Notifications
                  </CardTitle>
                  <p className="text-gray-600">
                    Notifications about blood requests in your area. Respond to help save lives.
                  </p>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                    </div>
                  }>
                    <NotificationCenter />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="active-requests">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Active Blood Requests
                  </CardTitle>
                  <p className="text-gray-600">
                    Browse all active blood requests across Bangladesh. Find ways to help in your community.
                  </p>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                    </div>
                  }>
                    <ActiveBloodRequests />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
