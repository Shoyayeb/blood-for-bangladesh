'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { dhaka_zones } from '@/lib/hospitals';
import { BLOOD_GROUP_DISPLAY, BloodGroup } from '@/lib/types';
import { formatBloodGroup } from '@/lib/utils-donation';
import { MapPin, Phone, Shield } from 'lucide-react';
import { useState } from 'react';

interface Donor {
  id: string;
  name: string;
  phoneNumber?: string; // Optional based on privacy settings
  bloodGroup: BloodGroup;
  area: string;
  city: string;
  state: string;
  zone?: string; // Dhaka zone
  availableFrom: string | null;
  contactVisible: boolean; // Indicates if contact info is visible
  createdAt: string;
}

interface SearchFilters {
  bloodGroup: BloodGroup | '';
  zone: string;
  area: string;
}

export function DonorSearch() {
  const { firebaseUser } = useAuth();
  const [filters, setFilters] = useState<SearchFilters>({
    bloodGroup: '',
    zone: '',
    area: '',
  });
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const searchParams = new URLSearchParams();
      if (filters.bloodGroup) searchParams.append('bloodGroup', filters.bloodGroup);
      if (filters.zone) searchParams.append('zone', filters.zone);
      if (filters.area) searchParams.append('area', filters.area);
      
      // Always search within Dhaka
      searchParams.append('city', 'Dhaka');
      searchParams.append('state', 'Dhaka Division');

      // Prepare headers with authentication if user is logged in
      const headers: Record<string, string> = {};
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/users/search?${searchParams.toString()}`, {
        headers,
      });
      const data = await response.json();

      if (response.ok) {
        setDonors(data.users || []);
        setSearched(true);
      } else {
        console.error('Search failed:', data.error);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-600" />
            Find Blood Donors in Dhaka
          </CardTitle>
          <CardDescription>
            Search for available blood donors in different zones of Dhaka city
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <select
                  id="bloodGroup"
                  title="Select blood group"
                  value={filters.bloodGroup}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFilter('bloodGroup', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Blood Groups</option>
                  {Object.entries(BLOOD_GROUP_DISPLAY).map(([key, display]) => (
                    <option key={key} value={key}>
                      {display}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zone">Dhaka Zone</Label>
                <select
                  id="zone"
                  title="Select zone in Dhaka"
                  value={filters.zone}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFilter('zone', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Zones in Dhaka</option>
                  {dhaka_zones.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="area">Specific Area (Optional)</Label>
                <Input
                  id="area"
                  type="text"
                  placeholder="e.g., Dhanmondi Road 15, Gulshan Avenue, Uttara Sector 7"
                  value={filters.area}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFilter('area', e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Searching in Dhaka...' : 'Search Donors in Dhaka'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      {!firebaseUser && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800 mb-1">Enhanced Privacy Features</h4>
                <p className="text-sm text-blue-700">
                  Login to your account to access contact details of donors who have set their privacy to &quot;Restricted&quot;. 
                  This helps protect donor privacy while ensuring serious blood requests have access to contact information.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {searched && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>
              Found {donors.length} available donor{donors.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {donors.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No donors found matching your criteria. Try adjusting your search filters.
              </p>
            ) : (
              <div className="grid gap-4">
                {donors.map((donor) => (
                  <div key={donor.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <h3 className="font-semibold text-lg">{donor.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded font-medium">
                            {formatBloodGroup(donor.bloodGroup)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {donor.area && `${donor.area}, `}{donor.city}
                          </span>
                          {donor.zone && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {donor.zone}
                            </span>
                          )}
                          {!donor.zone && donor.city === 'Dhaka' && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              Dhaka
                            </span>
                          )}
                        </div>
                        
                        {/* Contact Information with Privacy Controls */}
                        <div className="flex items-center gap-2 text-sm">
                          {donor.contactVisible && donor.phoneNumber ? (
                            <div className="flex items-center gap-2 text-green-600">
                              <Phone className="w-4 h-4" />
                              <span className="font-medium">{donor.phoneNumber}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-gray-500">
                              <Shield className="w-4 h-4" />
                              <span className="text-xs">
                                {!firebaseUser 
                                  ? 'Login to view contact details' 
                                  : 'Contact details are private'}
                              </span>
                            </div>
                          )}
                        </div>

                        {donor.availableFrom && (
                          <p className="text-xs text-green-600">
                            Available to donate
                          </p>
                        )}
                      </div>
                      
                      {donor.contactVisible && donor.phoneNumber ? (
                        <Button size="sm" asChild>
                          <a href={`tel:${donor.phoneNumber}`}>
                            Call Now
                          </a>
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          {!firebaseUser ? 'Login Required' : 'Private'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
