'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BLOOD_GROUP_DISPLAY } from '@/lib/types';
import { Clock, MapPin, Navigation, Phone, User } from 'lucide-react';

interface Hospital {
  id: string;
  name: string;
  address: string;
  zone: string;
  map_url: string;
}

interface BloodRequestData {
  id: string;
  requesterName: string;
  requesterPhone: string;
  bloodGroup: keyof typeof BLOOD_GROUP_DISPLAY;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  hospital?: Hospital | null;
  message?: string;
  createdAt: string;
  requesterCity: string;
  requesterState: string;
}

interface BloodRequestCardProps {
  request: BloodRequestData;
  showContactInfo?: boolean;
  onContactClick?: () => void;
}

const URGENCY_COLORS = {
  low: 'bg-blue-100 text-blue-800 border-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200'
};

const URGENCY_LABELS = {
  low: 'Low Priority',
  medium: 'Medium Priority', 
  high: 'High Priority',
  critical: 'Critical - Urgent'
};

export function BloodRequestCard({ 
  request, 
  showContactInfo = true, 
  onContactClick 
}: BloodRequestCardProps) {
  const timeAgo = new Date(request.createdAt).toLocaleString('en-BD', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const openInMaps = () => {
    if (request.hospital?.map_url) {
      window.open(request.hospital.map_url, '_blank');
    } else {
      // Fallback to Google Maps search
      const searchQuery = encodeURIComponent(request.location);
      window.open(`https://www.google.com/maps/search/${searchQuery}`, '_blank');
    }
  };

  return (
    <Card className="border-l-4 border-l-red-500">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <div className="flex items-center space-x-2">
                <span className="text-red-600 font-bold text-xl">
                  {BLOOD_GROUP_DISPLAY[request.bloodGroup]}
                </span>
                <span className="text-gray-600">needed</span>
              </div>
            </CardTitle>
            <CardDescription className="flex items-center space-x-1 mt-1">
              <Clock className="w-4 h-4" />
              <span>Requested {timeAgo}</span>
            </CardDescription>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${URGENCY_COLORS[request.urgency]}`}>
            {URGENCY_LABELS[request.urgency]}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Requester Info */}
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-500" />
          <span className="font-medium">{request.requesterName}</span>
          <span className="text-sm text-gray-500">
            from {request.requesterCity}, {request.requesterState}
          </span>
        </div>

        {/* Hospital Information */}
        {request.hospital ? (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">{request.hospital.name}</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    {request.hospital.zone}
                  </span>
                </div>
                <p className="text-sm text-blue-700 ml-6">{request.hospital.address}</p>
                {request.location !== `${request.hospital.name}, ${request.hospital.address}` && (
                  <p className="text-sm text-blue-600 ml-6 mt-1">
                    <strong>Details:</strong> {request.location}
                  </p>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={openInMaps}
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <Navigation className="w-4 h-4 mr-1" />
                Directions
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
            <div>
              <span className="font-medium">Location:</span>
              <p className="text-gray-700">{request.location}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={openInMaps}
                className="mt-2"
              >
                <Navigation className="w-4 h-4 mr-1" />
                Find on Maps
              </Button>
            </div>
          </div>
        )}

        {/* Message */}
        {request.message && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Additional Info:</strong> {request.message}
            </p>
          </div>
        )}

        {/* Contact Information */}
        {showContactInfo && (
          <div className="border-t pt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Contact:</span>
                <span className="text-blue-600">{request.requesterPhone}</span>
              </div>
              {onContactClick && (
                <Button size="sm" onClick={onContactClick}>
                  Contact Requester
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface BloodRequestListProps {
  requests: BloodRequestData[];
  showContactInfo?: boolean;
  emptyMessage?: string;
}

export function BloodRequestList({ 
  requests, 
  showContactInfo = true,
  emptyMessage = "No blood requests found"
}: BloodRequestListProps) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <MapPin className="w-8 h-8 text-gray-400" />
        </div>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <BloodRequestCard
          key={request.id}
          request={request}
          showContactInfo={showContactInfo}
        />
      ))}
    </div>
  );
}
