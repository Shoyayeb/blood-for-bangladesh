import hospitalsData from '../hospitals.json';

export interface Hospital {
  id: string;
  name: string;
  address: string;
  map_url: string;
  zone: string;
}

// All hospitals from the JSON file
export const hospitals: Hospital[] = hospitalsData;

// Get all unique zones
export const dhaka_zones = [
  'Azimpur',
  'Badda', 
  'Banani',
  'Baridhara',
  'Bashundhara',
  'Demra',
  'Dhanmondi',
  'Jatrabari',
  'Khilgaon',
  'Lalbagh',
  'Malibagh',
  'Mirpur',
  'Mohakhali',
  'Mohammadpur',
  'Motijheel',
  'Old Dhaka',
  'Shahbagh',
  'Tejgaon',
  'Uttara'
].sort();

// Get hospitals by zone
export function getHospitalsByZone(zone: string): Hospital[] {
  return hospitals.filter(hospital => hospital.zone === zone);
}

// Get all hospitals for multiple zones
export function getHospitalsByZones(zones: string[]): Hospital[] {
  return hospitals.filter(hospital => zones.includes(hospital.zone));
}

// Find hospital by ID
export function getHospitalById(id: string): Hospital | undefined {
  return hospitals.find(hospital => hospital.id === id);
}

// Search hospitals by name
export function searchHospitalsByName(query: string): Hospital[] {
  const searchTerm = query.toLowerCase();
  return hospitals.filter(hospital => 
    hospital.name.toLowerCase().includes(searchTerm) ||
    hospital.address.toLowerCase().includes(searchTerm)
  );
}

// Get zone statistics
export function getZoneStats() {
  const zoneStats = dhaka_zones.map(zone => ({
    zone,
    hospitalCount: getHospitalsByZone(zone).length
  }));
  
  return zoneStats.sort((a, b) => b.hospitalCount - a.hospitalCount);
}

// Format Google Maps URL for directions
export function getDirectionsUrl(hospital: Hospital, userLocation?: { lat: number, lng: number }) {
  if (userLocation) {
    return `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${encodeURIComponent(hospital.address)}`;
  }
  return hospital.map_url;
}
