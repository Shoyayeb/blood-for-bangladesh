'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import {
    BLOOD_GROUP_DISPLAY,
    BloodGroup,
    CONTACT_VISIBILITY_DISPLAY,
    ContactVisibility,
    PROFILE_VISIBILITY_DISPLAY,
    ProfileVisibility,
    UserRegistrationSchema
} from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function UserRegistrationForm() {
  const { firebaseUser, refreshUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    bloodGroup: '' as BloodGroup | '',
    area: '',
    city: '',
    state: '',
    contactVisibility: 'RESTRICTED' as ContactVisibility,
    profileVisibility: 'PUBLIC' as ProfileVisibility,
  });

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
        // Registration successful, refresh user data and redirect to profile
        await refreshUser();
        router.push('/profile');
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
            <Label htmlFor="area">Area/Locality *</Label>
            <Input
              id="area"
              type="text"
              placeholder="e.g., Dhanmondi, Gulshan, Uttara, Wari"
              value={formData.area}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('area', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              type="text"
              placeholder="e.g., Dhaka, Chittagong, Sylhet, Rajshahi"
              value={formData.city}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('city', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State/Division *</Label>
            <Input
              id="state"
              type="text"
              placeholder="e.g., Dhaka Division, Chittagong Division, Sylhet Division"
              value={formData.state}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('state', e.target.value)}
              required
            />
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
