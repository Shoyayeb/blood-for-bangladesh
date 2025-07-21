'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import {
  CONTACT_VISIBILITY_DISPLAY,
  ContactVisibility,
  PROFILE_VISIBILITY_DISPLAY,
  ProfileVisibility,
  UserUpdateSchema
} from '@/lib/types';
import { formatBloodGroup } from '@/lib/utils-donation';
import { Activity, ArrowLeft, MapPin, Phone, Save, Shield, User } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function ProfileManagement() {
  const { user, refreshUser, firebaseUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    area: '',
    city: '',
    state: '',
    isActive: true,
    contactVisibility: 'RESTRICTED' as ContactVisibility,
    profileVisibility: 'PUBLIC' as ProfileVisibility,
  });

  // Initialize form data when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        area: user.area || '',
        city: user.city || '',
        state: user.state || '',
        isActive: user.isActive ?? true,
        contactVisibility: ((user as { contactVisibility?: string }).contactVisibility as 'RESTRICTED' | 'PUBLIC' | 'PRIVATE') || 'RESTRICTED',
        profileVisibility: ((user as { profileVisibility?: string }).profileVisibility as 'PUBLIC' | 'PRIVATE') || 'PUBLIC',
      });
    }
  }, [user]);

  const updateField = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    if (!user || !firebaseUser) {
      setError('Please login to update your profile');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate form data
      const validatedData = UserUpdateSchema.parse(formData);

      // Submit update
      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          ...validatedData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        await refreshUser(); // Refresh user data
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (error: unknown) {
      console.error('Profile update error:', error);
      if (error && typeof error === 'object' && 'issues' in error) {
        // Zod validation errors
        const zodError = error as { issues: Array<{ message: string }> };
        const errorMessages = zodError.issues.map((issue) => issue.message).join(', ');
        setError(errorMessages);
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        area: user.area || '',
        city: user.city || '',
        state: user.state || '',
        isActive: user.isActive ?? true,
        contactVisibility: (user.contactVisibility as ContactVisibility) || 'RESTRICTED',
        profileVisibility: (user.profileVisibility as ProfileVisibility) || 'PUBLIC',
      });
    }
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600 mb-4">Please login to manage your profile.</p>
            <Link href="/auth/login">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <User className="w-5 h-5 text-gray-600" />
              <h1 className="text-xl font-bold text-gray-900">Profile Management</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Profile Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Profile Information</span>
                </span>
                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)} size="sm">
                    Edit Profile
                  </Button>
                )}
              </CardTitle>
              <CardDescription>
                Manage your blood donor profile information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('name', e.target.value)}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border">
                        {user.name}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>Phone Number</span>
                    </Label>
                    <div className="p-2 bg-gray-100 rounded border text-gray-600">
                      {user.phoneNumber} (Cannot be changed)
                    </div>
                  </div>
                </div>

                {/* Blood Group (Read-only) */}
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Activity className="w-4 h-4" />
                    <span>Blood Group</span>
                  </Label>
                  <div className="p-2 bg-red-50 border border-red-200 rounded">
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded font-medium">
                      {formatBloodGroup(user.bloodGroup)}
                    </span>
                    <span className="text-sm text-gray-600 ml-3">
                      (Contact support to change blood group)
                    </span>
                  </div>
                </div>

                {/* Location Information */}
                <div className="space-y-4">
                  <Label className="flex items-center space-x-2 text-lg font-medium">
                    <MapPin className="w-5 h-5" />
                    <span>Location Details</span>
                  </Label>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="area">Area/Locality</Label>
                      {isEditing ? (
                        <Input
                          id="area"
                          type="text"
                          value={formData.area}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('area', e.target.value)}
                          placeholder="e.g., Dhanmondi"
                        />
                      ) : (
                        <div className="p-2 bg-gray-50 rounded border">
                          {user.area}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      {isEditing ? (
                        <Input
                          id="city"
                          type="text"
                          value={formData.city}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('city', e.target.value)}
                          placeholder="e.g., Dhaka"
                        />
                      ) : (
                        <div className="p-2 bg-gray-50 rounded border">
                          {user.city}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State/Division</Label>
                      {isEditing ? (
                        <Input
                          id="state"
                          type="text"
                          value={formData.state}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('state', e.target.value)}
                          placeholder="e.g., Dhaka Division"
                        />
                      ) : (
                        <div className="p-2 bg-gray-50 rounded border">
                          {user.state}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Account Status */}
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Activity className="w-4 h-4" />
                    <span>Account Status</span>
                  </Label>
                  {isEditing ? (
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="isActive"
                          checked={formData.isActive === true}
                          onChange={() => updateField('isActive', true)}
                          className="text-green-600"
                        />
                        <span className="text-green-600">Active (Available for donations)</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="isActive"
                          checked={formData.isActive === false}
                          onChange={() => updateField('isActive', false)}
                          className="text-red-600"
                        />
                        <span className="text-red-600">Inactive (Temporarily unavailable)</span>
                      </label>
                    </div>
                  ) : (
                    <div className="p-2 rounded border">
                      <span className={`px-3 py-1 rounded font-medium ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Privacy Settings */}
                <div className="space-y-4 pt-4 border-t">
                  <Label className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Privacy Settings</span>
                  </Label>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactVisibility">Contact Visibility</Label>
                      {isEditing ? (
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
                      ) : (
                        <div className="p-2 bg-gray-50 rounded border">
                          {CONTACT_VISIBILITY_DISPLAY[(user.contactVisibility as ContactVisibility) || 'RESTRICTED']}
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        Controls who can see your phone number when they search for donors
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profileVisibility">Profile Visibility</Label>
                      {isEditing ? (
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
                      ) : (
                        <div className="p-2 bg-gray-50 rounded border">
                          {PROFILE_VISIBILITY_DISPLAY[(user.profileVisibility as ProfileVisibility) || 'PUBLIC']}
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        Controls whether anonymous users can find you in donor searches
                      </p>
                    </div>
                  </div>
                </div>

                {/* Error/Success Messages */}
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="text-sm text-green-600 bg-green-50 p-3 rounded border border-green-200">
                    {success}
                  </div>
                )}

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex space-x-3 pt-4">
                    <Button 
                      onClick={handleSave} 
                      disabled={loading}
                      className="flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Read-only account details and statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Member Since</Label>
                    <div className="text-sm text-gray-900">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                    <div className="text-sm text-gray-900">
                      {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Total Donations</Label>
                    <div className="text-2xl font-bold text-red-600">
                      {user.donations?.length || 0}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Last Donation</Label>
                    <div className="text-sm text-gray-900">
                      {user.lastDonation ? new Date(user.lastDonation).toLocaleDateString() : 'Never'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
