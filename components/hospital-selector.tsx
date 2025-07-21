'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dhaka_zones, getHospitalsByZone, getHospitalsByZones, Hospital, searchHospitalsByName } from '@/lib/hospitals';
import { MapPin, Navigation, Search } from 'lucide-react';
import { useState } from 'react';

interface HospitalSelectorProps {
  selectedHospital?: Hospital;
  onHospitalSelect: (hospital: Hospital | undefined) => void;
  multiple?: boolean;
  selectedHospitals?: Hospital[];
  onHospitalsSelect?: (hospitals: Hospital[]) => void;
}

export function HospitalSelector({ 
  selectedHospital, 
  onHospitalSelect, 
  multiple = false,
  selectedHospitals = [],
  onHospitalsSelect 
}: HospitalSelectorProps) {
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Get hospitals to display
  const getDisplayHospitals = (): Hospital[] => {
    if (searchQuery.trim()) {
      return searchHospitalsByName(searchQuery);
    }
    
    if (selectedZones.length > 0) {
      return getHospitalsByZones(selectedZones);
    }
    
    return [];
  };

  const displayHospitals = getDisplayHospitals();

  const handleZoneToggle = (zone: string) => {
    setSelectedZones(prev => {
      if (prev.includes(zone)) {
        return prev.filter(z => z !== zone);
      } else {
        return [...prev, zone];
      }
    });
    setSearchQuery(''); // Clear search when selecting zones
  };

  const handleHospitalSelect = (hospital: Hospital) => {
    if (multiple && onHospitalsSelect) {
      const isSelected = selectedHospitals.some(h => h.id === hospital.id);
      if (isSelected) {
        onHospitalsSelect(selectedHospitals.filter(h => h.id !== hospital.id));
      } else {
        onHospitalsSelect([...selectedHospitals, hospital]);
      }
    } else {
      onHospitalSelect(selectedHospital?.id === hospital.id ? undefined : hospital);
    }
  };

  const isHospitalSelected = (hospital: Hospital) => {
    if (multiple) {
      return selectedHospitals.some(h => h.id === hospital.id);
    }
    return selectedHospital?.id === hospital.id;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-red-600" />
          <span>Select Hospital in Dhaka</span>
        </CardTitle>
        <CardDescription>
          Choose hospital(s) by zone or search by name. Donors can get directions directly from the app.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="hospital-search">Search Hospitals</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="hospital-search"
              placeholder="Search hospitals by name or address..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim()) {
                  setSelectedZones([]); // Clear zone selection when searching
                }
              }}
              className="pl-10"
            />
          </div>
        </div>

        {/* Zone Selection */}
        {!searchQuery.trim() && (
          <div className="space-y-2">
            <Label>Select Zones in Dhaka</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {dhaka_zones.map((zone) => {
                const hospitalCount = getHospitalsByZone(zone).length;
                const isSelected = selectedZones.includes(zone);
                
                return (
                  <Button
                    key={zone}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleZoneToggle(zone)}
                    className="justify-between text-xs"
                  >
                    <span>{zone}</span>
                    <span className="text-xs opacity-70">({hospitalCount})</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Summary */}
        {multiple && selectedHospitals.length > 0 && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900">
              Selected: {selectedHospitals.length} hospital{selectedHospitals.length > 1 ? 's' : ''}
            </p>
            <div className="mt-1 space-y-1">
              {selectedHospitals.map(hospital => (
                <div key={hospital.id} className="text-xs text-blue-700">
                  {hospital.name} ({hospital.zone})
                </div>
              ))}
            </div>
          </div>
        )}

        {!multiple && selectedHospital && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900">Selected Hospital:</p>
            <p className="text-sm text-blue-700">{selectedHospital.name}</p>
            <p className="text-xs text-blue-600">{selectedHospital.zone} • {selectedHospital.address}</p>
          </div>
        )}

        {/* Hospital List */}
        {displayHospitals.length > 0 && (
          <div className="space-y-2">
            <Label>
              {searchQuery.trim() 
                ? `Search Results (${displayHospitals.length})`
                : `Hospitals in Selected Zones (${displayHospitals.length})`
              }
            </Label>
            <div className="max-h-64 overflow-y-auto space-y-2 border rounded-md p-2">
              {displayHospitals.map((hospital) => (
                <div
                  key={hospital.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    isHospitalSelected(hospital)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleHospitalSelect(hospital)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{hospital.name}</h4>
                      <p className="text-xs text-gray-600 mt-1">{hospital.address}</p>
                      <p className="text-xs text-blue-600 mt-1">Zone: {hospital.zone}</p>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(hospital.map_url, '_blank');
                        }}
                        title="Open in Google Maps"
                      >
                        <Navigation className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(selectedZones.length > 0 || searchQuery.trim()) && displayHospitals.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No hospitals found</p>
            <p className="text-sm">Try different zones or search terms</p>
          </div>
        )}

        {selectedZones.length === 0 && !searchQuery.trim() && (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Select zones or search to see hospitals</p>
            <p className="text-sm">Choose from {dhaka_zones.length} zones in Dhaka</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
