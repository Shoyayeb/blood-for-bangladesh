import { PhoneAuthForm } from '@/components/phone-auth-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🩸 Blood Donor App
          </h1>
          <p className="text-gray-600">
            Connecting donors with those in need
          </p>
        </div>
        <PhoneAuthForm />
      </div>
    </div>
  );
}
