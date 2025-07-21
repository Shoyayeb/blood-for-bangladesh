'use client';

import { BloodRequestCard } from '@/components/blood-request-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dhaka_zones } from '@/lib/hospitals';
import { BLOOD_GROUP_DISPLAY } from '@/lib/types';
import { Clock, Filter, RefreshCw, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface BloodRequest {
  id: string;
  requesterName: string;
  requesterPhone: string;
  bloodGroup: keyof typeof BLOOD_GROUP_DISPLAY;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  hospital?: {
    id: string;
    name: string;
    address: string;
    zone: string;
    map_url: string;
  } | null;
  message?: string;
  createdAt: string;
  requesterCity: string;
  requesterState: string;
}

interface FiltersState {
  bloodGroup: string;
  urgency: string;
  zone: string;
  city: string;
  searchQuery: string;
}

export function ActiveBloodRequests() {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<FiltersState>({
    bloodGroup: '',
    urgency: '',
    zone: '',
    city: '',
    searchQuery: '',
  });

  const fetchActiveRequests = async () => {
    try {
      const response = await fetch('/api/blood-requests/active');
      
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests);
        setFilteredRequests(data.requests);
      } else {
        setError('Failed to load active blood requests');
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to load active blood requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...requests];

    // Blood group filter
    if (filters.bloodGroup) {
      filtered = filtered.filter(req => req.bloodGroup === filters.bloodGroup);
    }

    // Urgency filter
    if (filters.urgency) {
      filtered = filtered.filter(req => req.urgency === filters.urgency);
    }

    // Zone filter (if hospital has zone info)
    if (filters.zone) {
      filtered = filtered.filter(req => req.hospital?.zone === filters.zone);
    }

    // City filter
    if (filters.city) {
      filtered = filtered.filter(req => 
        req.requesterCity.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(req =>
        req.requesterName.toLowerCase().includes(query) ||
        req.location.toLowerCase().includes(query) ||
        req.hospital?.name.toLowerCase().includes(query) ||
        req.message?.toLowerCase().includes(query)
      );
    }

    setFilteredRequests(filtered);
  }, [requests, filters]);

  const clearFilters = () => {
    setFilters({
      bloodGroup: '',
      urgency: '',
      zone: '',
      city: '',
      searchQuery: '',
    });
  };

  const refresh = () => {
    setRefreshing(true);
    fetchActiveRequests();
  };

  useEffect(() => {
    fetchActiveRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, requests, applyFilters]);

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-red-600" />
                <span>Active Blood Requests</span>
                <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded">
                  {filteredRequests.length}
                </span>
              </CardTitle>
              <CardDescription>
                Current blood donation requests in Bangladesh
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-1" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 bg-blue-500 text-white text-xs px-1 rounded-full">
                    !
                  </span>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={refresh}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Filters */}
        {showFilters && (
          <CardContent className="border-t bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search */}
              <div className="space-y-2 lg:col-span-3">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Search by name, location, hospital..."
                    value={filters.searchQuery}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Blood Group */}
              <div className="space-y-2">
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <select
                  id="bloodGroup"
                  title="Filter by blood group"
                  value={filters.bloodGroup}
                  onChange={(e) => setFilters(prev => ({ ...prev, bloodGroup: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">All Blood Groups</option>
                  {Object.entries(BLOOD_GROUP_DISPLAY).map(([key, display]) => (
                    <option key={key} value={key}>
                      {display}
                    </option>
                  ))}
                </select>
              </div>

              {/* Urgency */}
              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency</Label>
                <select
                  id="urgency"
                  title="Filter by urgency level"
                  value={filters.urgency}
                  onChange={(e) => setFilters(prev => ({ ...prev, urgency: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">All Urgency Levels</option>
                  <option value="critical">Critical - Immediate</option>
                  <option value="high">High - Within 24 hours</option>
                  <option value="medium">Medium - Within 2-3 days</option>
                  <option value="low">Low - Within a week</option>
                </select>
              </div>

              {/* Zone */}
              <div className="space-y-2">
                <Label htmlFor="zone">Hospital Zone</Label>
                <select
                  id="zone"
                  title="Filter by hospital zone"
                  value={filters.zone}
                  onChange={(e) => setFilters(prev => ({ ...prev, zone: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">All Zones</option>
                  {dhaka_zones.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Enter city name"
                  value={filters.city}
                  onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Results */}
      {loading ? (
        <Card>
          <CardContent className="text-center py-8">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-2 text-gray-400" />
            <p>Loading blood requests...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="text-center py-8 text-red-600">
            <p>{error}</p>
            <Button onClick={refresh} className="mt-2">
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
            {hasActiveFilters ? (
              <>
                <p>No requests match your filters</p>
                <Button onClick={clearFilters} className="mt-2" variant="outline">
                  Clear Filters
                </Button>
              </>
            ) : (
              <>
                <p>No active blood requests</p>
                <p className="text-sm">Check back later for new requests</p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <BloodRequestCard
              key={request.id}
              request={request}
              showContactInfo={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
