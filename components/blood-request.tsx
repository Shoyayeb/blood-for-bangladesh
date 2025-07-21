'use client';

import { HospitalSelector } from '@/components/hospital-selector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth-context';
import { Hospital } from '@/lib/hospitals';
import { BLOOD_GROUP_DISPLAY, BloodGroup } from '@/lib/types';
import { MapPin, Phone, Users } from 'lucide-react';
import { useState } from 'react';

interface BloodRequestForm {
  bloodGroup: BloodGroup | '';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  hospital?: Hospital;
  location: string;
  contactPhone: string;
  message: string;
  notifyRadius: number; // km
  notifyAll: boolean; // If true, notify all users with compatible blood type
}

const URGENCY_LEVELS = {
  low: { label: 'Low - Within a week', color: 'bg-blue-100 text-blue-800' },
  medium: { label: 'Medium - Within 2-3 days', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'High - Within 24 hours', color: 'bg-orange-100 text-orange-800' },
  critical: { label: 'Critical - Immediate', color: 'bg-red-100 text-red-800' }
};

export function BloodRequest() {
  const { user, firebaseUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | undefined>();
  
  const [formData, setFormData] = useState<BloodRequestForm>({
    bloodGroup: '',
    urgency: 'medium',
    hospital: undefined,
    location: user?.area + ', ' + user?.city || '',
    contactPhone: user?.phoneNumber || '',
    message: '',
    notifyRadius: 10,
    notifyAll: false,
  });

  const updateField = (field: keyof BloodRequestForm, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handleHospitalSelect = (hospital: Hospital | undefined) => {
    setSelectedHospital(hospital);
    setFormData(prev => ({ 
      ...prev, 
      hospital,
      location: hospital ? `${hospital.name}, ${hospital.address}` : prev.location
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !firebaseUser) {
      setError('Please login to send blood requests');
      return;
    }

    if (!formData.bloodGroup) {
      setError('Please select a blood group');
      return;
    }

    if (!formData.location.trim()) {
      setError('Please enter a location');
      return;
    }

    if (!formData.contactPhone.trim()) {
      setError('Please enter a contact phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = await firebaseUser.getIdToken();
      
      const response = await fetch('/api/blood-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          requesterName: user.name,
          requesterPhone: formData.contactPhone,
          bloodGroup: formData.bloodGroup,
          urgency: formData.urgency,
          location: formData.location,
          hospital: formData.hospital ? {
            id: formData.hospital.id,
            name: formData.hospital.name,
            address: formData.hospital.address,
            zone: formData.hospital.zone,
            map_url: formData.hospital.map_url
          } : null,
          message: formData.message,
          notifyRadius: formData.notifyRadius,
          notifyAll: formData.notifyAll,
          requesterCity: user.city,
          requesterState: user.state,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Blood request sent successfully! ${data.notifiedCount} donors have been notified.`);
        // Reset form
        setFormData(prev => ({
          ...prev,
          message: '',
          urgency: 'medium',
        }));
      } else {
        setError(data.error || 'Failed to send blood request');
      }
    } catch (error: unknown) {
      console.error('Blood request error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send blood request';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-red-600" />
            <span>Request Blood Donation in Bangladesh</span>
          </CardTitle>
          <CardDescription>
            Send a request notification to available blood donors in Bangladesh
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Blood Group */}
            <div className="space-y-2">
              <Label htmlFor="bloodGroup">Required Blood Group *</Label>
              <select
                id="bloodGroup"
                title="Select required blood group"
                value={formData.bloodGroup}
                onChange={(e) => updateField('bloodGroup', e.target.value as BloodGroup)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
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

            {/* Urgency Level */}
            <div className="space-y-2">
              <Label>Urgency Level *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(URGENCY_LEVELS).map(([key, { label, color }]) => (
                  <label key={key} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="urgency"
                      value={key}
                      checked={formData.urgency === key}
                      onChange={(e) => updateField('urgency', e.target.value)}
                      className="text-red-600"
                    />
                    <span className={`px-3 py-1 rounded text-sm font-medium ${color}`}>
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Hospital Selection */}
            <HospitalSelector
              selectedHospital={selectedHospital}
              onHospitalSelect={handleHospitalSelect}
            />

            {/* Location - Auto-filled when hospital is selected */}
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>Location Details (Auto-filled from hospital or enter manually) *</span>
              </Label>
              <Input
                id="location"
                type="text"
                placeholder="e.g., Emergency Ward, ICU, specific department..."
                value={formData.location}
                onChange={(e) => updateField('location', e.target.value)}
                required
              />
              {selectedHospital && (
                <p className="text-xs text-blue-600">
                  Hospital selected: {selectedHospital.name} ({selectedHospital.zone})
                </p>
              )}
            </div>

            {/* Contact Phone */}
            <div className="space-y-2">
              <Label htmlFor="contactPhone" className="flex items-center space-x-1">
                <Phone className="w-4 h-4" />
                <span>Contact Phone Number *</span>
              </Label>
              <Input
                id="contactPhone"
                type="tel"
                placeholder="Enter contact number for donors"
                value={formData.contactPhone}
                onChange={(e) => updateField('contactPhone', e.target.value)}
                required
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Additional Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="e.g., Patient details, special requirements, best time to contact..."
                value={formData.message}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField('message', e.target.value)}
                rows={4}
              />
            </div>

            {/* Notification Settings */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">Notification Settings</h3>
              
              {/* Notify Radius */}
              <div className="space-y-2">
                <Label htmlFor="notifyRadius">Notification Radius (km)</Label>
                <select
                  id="notifyRadius"
                  title="Select notification radius"
                  value={formData.notifyRadius}
                  onChange={(e) => updateField('notifyRadius', parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value={5}>5 km - Same area</option>
                  <option value={10}>10 km - Nearby areas</option>
                  <option value={25}>25 km - Same city</option>
                  <option value={50}>50 km - Extended region</option>
                </select>
              </div>

              {/* Notify All */}
              <div className="flex items-center space-x-2">
                <input
                  id="notifyAll"
                  type="checkbox"
                  title="Notify all compatible donors"
                  checked={formData.notifyAll}
                  onChange={(e) => updateField('notifyAll', e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <Label htmlFor="notifyAll" className="text-sm">
                  Notify all compatible donors regardless of location (emergency only)
                </Label>
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

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-red-600 hover:bg-red-700"
              size="lg"
            >
              {loading ? 'Sending Request...' : 'Send Blood Request'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
