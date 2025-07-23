import { DonorSearch } from '@/components/donor-search';

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find Blood Donors in Dhaka
          </h1>
          <p className="text-gray-600">
            Search for available blood donors across different zones in Dhaka city
          </p>
        </div>
        <DonorSearch />
      </div>
    </div>
  );
}
