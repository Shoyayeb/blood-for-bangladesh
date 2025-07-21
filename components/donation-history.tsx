'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Droplets, FileText, MapPin } from 'lucide-react';
import Link from 'next/link';

export function DonationHistory() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600 mb-4">Please login to view your donation history.</p>
            <Link href="/auth/login">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const donations = user.donations || [];
  const totalDonations = donations.length;
  const livesImpacted = totalDonations * 3; // Each donation can help up to 3 people

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Droplets className="w-5 h-5 text-red-600" />
              <h1 className="text-xl font-bold text-gray-900">Donation History</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Statistics Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {totalDonations}
                  </div>
                  <div className="text-sm text-gray-600">Total Donations</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {livesImpacted}
                  </div>
                  <div className="text-sm text-gray-600">Lives Potentially Helped</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {user.lastDonation ? format(new Date(user.lastDonation), 'MMM yyyy') : 'Never'}
                  </div>
                  <div className="text-sm text-gray-600">Last Donation</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Donation History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Your Donation Timeline</span>
              </CardTitle>
              <CardDescription>
                Complete history of your blood donations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {donations.length === 0 ? (
                <div className="text-center py-12">
                  <Droplets className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No donations yet</h3>
                  <p className="text-gray-600 mb-6">
                    You haven't recorded any blood donations yet. When you donate blood, 
                    mark it in your dashboard to track your contributions.
                  </p>
                  <Link href="/dashboard">
                    <Button className="bg-red-600 hover:bg-red-700">
                      Go to Dashboard
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {donations
                    .sort((a, b) => new Date(b.donatedAt).getTime() - new Date(a.donatedAt).getTime())
                    .map((donation, index) => (
                    <div 
                      key={donation.id} 
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                              <Droplets className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                Donation #{donations.length - index}
                              </h4>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span>{format(new Date(donation.donatedAt), 'MMMM d, yyyy')}</span>
                                <span>•</span>
                                <span>{format(new Date(donation.donatedAt), 'h:mm a')}</span>
                              </div>
                            </div>
                          </div>

                          {donation.location && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600 ml-13">
                              <MapPin className="w-4 h-4" />
                              <span>{donation.location}</span>
                            </div>
                          )}

                          {donation.notes && (
                            <div className="flex items-start space-x-2 text-sm text-gray-600 ml-13">
                              <FileText className="w-4 h-4 mt-0.5" />
                              <span>{donation.notes}</span>
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            {Math.floor((new Date().getTime() - new Date(donation.donatedAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Impact Summary */}
          {donations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">🏆</span>
                  <span>Your Impact</span>
                </CardTitle>
                <CardDescription>
                  Thank you for being a life-saver!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600 mb-1">
                        {(totalDonations * 450).toLocaleString()} ml
                      </div>
                      <div className="text-sm text-gray-600">Total Blood Donated</div>
                    </div>
                    
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {livesImpacted}
                      </div>
                      <div className="text-sm text-gray-600">Lives Potentially Saved</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {Math.floor((new Date().getTime() - new Date(donations[donations.length - 1]?.donatedAt).getTime()) / (1000 * 60 * 60 * 24 * 365 * 24))} {/* Approximate years */}
                      </div>
                      <div className="text-sm text-gray-600">Years as Donor</div>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        🌟
                      </div>
                      <div className="text-sm text-gray-600">Community Hero</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg text-center">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    🩸 Every Drop Counts!
                  </h3>
                  <p className="text-sm text-gray-600">
                    Your {totalDonations} donation{totalDonations !== 1 ? 's' : ''} have made a real difference in saving lives. 
                    Thank you for being a hero in your community!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
