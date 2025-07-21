'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { dhaka_zones } from '@/lib/hospitals';
import { isPushNotificationSupported, requestNotificationPermission } from '@/lib/push-notifications';
import {
  BLOOD_GROUP_DISPLAY,
  BloodGroup,
  CONTACT_VISIBILITY_DISPLAY,
  ContactVisibility,
  PROFILE_VISIBILITY_DISPLAY,
  ProfileVisibility,
  UserRegistrationSchema
} from '@/lib/types';
import { Bell, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function UserRegistrationForm() {
  const { firebaseUser, refreshUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [formData, setFormData] = useState({
    name: '',
    bloodGroup: '' as BloodGroup | '',
    area: '', // This will now be the zone
    city: 'Dhaka', // Fixed to Dhaka
    state: 'Dhaka Division', // Fixed to Dhaka Division for consistency
    contactVisibility: 'RESTRICTED' as ContactVisibility,
    profileVisibility: 'PUBLIC' as ProfileVisibility,
  });

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Check initial notification permission
  useEffect(() => {
    if (isPushNotificationSupported()) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) {
      setError('Please login first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Validate form data
      const validationData = {
        ...formData,
        phoneNumber: firebaseUser.phoneNumber || '',
        zone: formData.area, // Map area (which contains zone) to zone field
        area: `${formData.area}, Dhaka`, // Create proper area description
      };

      const validatedData = UserRegistrationSchema.parse(validationData);

      // Submit registration
      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(validatedData),
      });

      const data = await response.json();

      if (response.ok) {
        // Registration successful
        await refreshUser();
        
        // Setup push notifications after successful registration
        if (isPushNotificationSupported() && notificationPermission === 'granted') {
          try {
            const subscription = await requestNotificationPermission();
            if (subscription) {
              // Save push subscription to server
              const token = await firebaseUser.getIdToken();
              await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(subscription),
              });
              // Push notifications setup completed
            }
          } catch (pushError) {
            // Don't fail registration if push setup fails
          }
        }
        
        router.push('/dashboard');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error && typeof error === 'object' && 'issues' in error) {
        // Zod validation errors
        const errorMessages = (error.issues as Array<{ message: string }>).map((issue) => issue.message).join(', ');
        setError(errorMessages);
      } else {
        setError((error as Error).message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!firebaseUser) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <p className="text-center text-gray-600">Please login first to register as a donor.</p>
          <Button 
            onClick={() => router.push('/auth/login')} 
            className="w-full mt-4"
          >
            Go to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Join Blood for Bangladesh</CardTitle>
        <CardDescription>
          Provide your details to become a blood donor
        </CardDescription>
        <div className="text-sm text-gray-600">
          Phone: {firebaseUser.phoneNumber}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bloodGroup">Blood Group *</Label>
            <select
              id="bloodGroup"
              title="Select your blood group"
              value={formData.bloodGroup}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField('bloodGroup', e.target.value as BloodGroup)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Blood Group</option>
              {Object.entries(BLOOD_GROUP_DISPLAY).map(([key, display]) => (
                <option key={key} value={key}>
                  {display}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="area">Zone *</Label>
            <select
              id="area"
              title="Select your zone in Dhaka"
              value={formData.area}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField('area', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Zone</option>
              {dhaka_zones.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">
              Select the zone in Dhaka where you live
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Division *</Label>
            <Input
              id="city"
              type="text"
              value="Dhaka"
              disabled
              className="bg-gray-50 cursor-not-allowed"
              title="Currently only available in Dhaka"
            />
            <p className="text-xs text-gray-500">
              Currently available only in Dhaka Division
            </p>
          </div>

          {/* Privacy Controls Section */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-medium text-gray-900">Privacy Settings</h3>
            
            <div className="space-y-2">
              <Label htmlFor="contactVisibility">Contact Visibility</Label>
              <select
                id="contactVisibility"
                title="Choose who can see your contact details"
                value={formData.contactVisibility}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField('contactVisibility', e.target.value as ContactVisibility)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(CONTACT_VISIBILITY_DISPLAY).map(([key, display]) => (
                  <option key={key} value={key}>
                    {display}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">
                Controls who can see your phone number when they search for donors
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profileVisibility">Profile Visibility</Label>
              <select
                id="profileVisibility"
                title="Choose who can find your profile"
                value={formData.profileVisibility}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField('profileVisibility', e.target.value as ProfileVisibility)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(PROFILE_VISIBILITY_DISPLAY).map(([key, display]) => (
                  <option key={key} value={key}>
                    {display}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">
                Controls whether anonymous users can find you in donor searches
              </p>
            </div>
          </div>

          {/* Notification Permissions Section */}
          {isPushNotificationSupported() && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Blood Request Notifications
              </h3>
              
              <div className="bg-blue-50 p-3 rounded-md">
                <div className="flex items-start gap-3">
                  {notificationPermission === 'granted' ? (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Bell className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">
                      {notificationPermission === 'granted' 
                        ? 'Notifications Enabled' 
                        : 'Enable Notifications'}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      {notificationPermission === 'granted'
                        ? 'You\'ll receive instant alerts when someone needs your blood type in your area.'
                        : 'Get instant alerts when someone needs your blood type in your area. Click below to enable notifications.'}
                    </p>
                    
                    {notificationPermission !== 'granted' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2 bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
                        onClick={async () => {
                          try {
                            const permission = await Notification.requestPermission();
                            setNotificationPermission(permission);
                          } catch (error) {
                            console.error('Error requesting notification permission:', error);
                          }
                        }}
                      >
                        <Bell className="h-3 w-3 mr-1" />
                        Enable Notifications
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Registering...' : 'Complete Registration'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
