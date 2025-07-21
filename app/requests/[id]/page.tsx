'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { BLOOD_GROUP_DISPLAY } from '@/lib/types';
import { AlertTriangle, ArrowLeft, Hospital, MapPin, Phone, User } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface BloodRequest {
  id: string;
  requesterName: string;
  requesterPhone: string;
  bloodGroup: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  message?: string;
  requesterCity: string;
  requesterState: string;
  hospitalData?: {
    name: string;
    zone: string;
    address: string;
    phone: string;
  };
  createdAt: string;
  status: string;
}

const urgencyColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800', 
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};

const urgencyIcons = {
  low: '🟢',
  medium: '🟡',
  high: '🟠', 
  critical: '🔴'
};

export default function RequestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [request, setRequest] = useState<BloodRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responding, setResponding] = useState(false);

  const requestId = params.id as string;

  const fetchRequestDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/blood-requests/${requestId}`);
      const data = await response.json();
      
      if (response.ok) {
        setRequest(data.request);
      } else {
        setError(data.message || 'Failed to load request details');
      }
    } catch (err) {
      console.error('Error fetching request:', err);
      setError('Failed to load request details');
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    fetchRequestDetails();
  }, [fetchRequestDetails]);

  // Listen for navigation messages from service worker
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NAVIGATE_TO_REQUEST') {
        // Already on the right page, just scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleResponse = async (response: 'accepted' | 'declined') => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setResponding(true);
    try {
      const res = await fetch(`/api/notifications/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: requestId,
          response: response
        }),
      });

      if (res.ok) {
        // Show success message and navigate to dashboard
        alert(`You have ${response} this blood request. The requester will be notified.`);
        router.push('/dashboard');
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to respond to request');
      }
    } catch (err) {
      console.error('Error responding to request:', err);
      alert('Failed to respond to request');
    } finally {
      setResponding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="container mx-auto max-w-2xl">
          <Link href="/requests">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Requests
            </Button>
          </Link>
          
          <Card>
            <CardContent className="text-center py-8">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h2 className="text-xl font-semibold mb-2">Request Not Found</h2>
              <p className="text-gray-600 mb-4">{error || 'This blood request could not be found or may have been removed.'}</p>
              <Link href="/requests">
                <Button>Browse Active Requests</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const timeAgo = new Date(request.createdAt).toLocaleString();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/requests">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Requests
            </Button>
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <Badge className={`${urgencyColors[request.urgency]} font-medium`}>
              {urgencyIcons[request.urgency]} {request.urgency.toUpperCase()}
            </Badge>
            <Badge variant="outline">{BLOOD_GROUP_DISPLAY[request.bloodGroup as keyof typeof BLOOD_GROUP_DISPLAY]}</Badge>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900">Blood Request Details</h1>
          <p className="text-gray-600">Posted {timeAgo}</p>
        </div>

        {/* Request Details */}
        <div className="space-y-6">
          {/* Main Request Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-red-500" />
                Request Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Requester Name</label>
                  <p className="text-lg font-semibold">{request.requesterName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Blood Group Needed</label>
                  <p className="text-lg font-semibold text-red-600">
                    {BLOOD_GROUP_DISPLAY[request.bloodGroup as keyof typeof BLOOD_GROUP_DISPLAY]}
                  </p>
                </div>
              </div>
              
              {request.message && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Additional Message</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{request.message}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hospital Information */}
          {request.hospitalData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hospital className="h-5 w-5 text-blue-500" />
                  Hospital Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Hospital Name</label>
                  <p className="text-lg font-semibold">{request.hospitalData.name}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Zone</label>
                    <p>{request.hospitalData.zone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <a href={`tel:${request.hospitalData.phone}`} className="text-blue-600 hover:underline">
                      {request.hospitalData.phone}
                    </a>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Address</label>
                  <p className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1 text-gray-400 flex-shrink-0" />
                    {request.hospitalData.address}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-500" />
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Location</label>
                <p>{request.location}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">City</label>
                  <p>{request.requesterCity}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">State/Division</label>
                  <p>{request.requesterState}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-purple-500" />
                Contact & Response
              </CardTitle>
              <CardDescription>
                Contact the requester directly or respond to this notification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <a 
                  href={`tel:${request.requesterPhone}`}
                  className="flex-1"
                >
                  <Button className="w-full" variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Call {request.requesterPhone}
                  </Button>
                </a>
                
                {request.hospitalData?.phone && (
                  <a 
                    href={`tel:${request.hospitalData.phone}`}
                    className="flex-1"
                  >
                    <Button className="w-full" variant="outline">
                      <Hospital className="h-4 w-4 mr-2" />
                      Call Hospital
                    </Button>
                  </a>
                )}
              </div>

              {user && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-3">
                    Respond to this blood request notification:
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => handleResponse('accepted')}
                      disabled={responding}
                      className="flex-1"
                    >
                      {responding ? 'Responding...' : 'I Can Help'}
                    </Button>
                    <Button 
                      onClick={() => handleResponse('declined')}
                      disabled={responding}
                      variant="outline"
                      className="flex-1"
                    >
                      {responding ? 'Responding...' : 'Cannot Help'}
                    </Button>
                  </div>
                </div>
              )}
              
              {!user && (
                <div className="border-t pt-4 text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    Want to receive notifications for blood requests like this?
                  </p>
                  <Link href="/auth/login">
                    <Button>Register as Donor</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
