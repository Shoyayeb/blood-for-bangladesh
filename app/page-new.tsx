import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🩸</span>
              <h1 className="text-xl font-bold text-gray-900">Blood Donor App</h1>
            </div>
            <div className="space-x-2">
              <Link href="/search">
                <Button variant="outline">Find Donors</Button>
              </Link>
              <Link href="/auth/login">
                <Button>Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Save Lives, Donate Blood
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with blood donors in your area. Help others find life-saving blood donations 
            when they need them most.
          </p>
          <div className="space-x-4">
            <Link href="/auth/login">
              <Button size="lg" className="text-lg px-8 py-3">
                Become a Donor
              </Button>
            </Link>
            <Link href="/search">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                Find Blood
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">📱</span>
                <span>Easy Registration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Simple phone-based registration with OTP verification. 
                No complicated forms or lengthy processes.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">🔍</span>
                <span>Smart Search</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Find compatible donors based on blood group and location. 
                Only shows available donors (3+ months since last donation).
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">⏰</span>
                <span>Smart Tracking</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Automatic 3-month cooldown tracking. Donors are hidden 
                from search until they&apos;re eligible to donate again.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white rounded-xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Make a Difference?
          </h3>
          <p className="text-gray-600 mb-6">
            Join our community of life-savers. Register as a donor today and help 
            those in emergency need of blood transfusions.
          </p>
          <Link href="/auth/login">
            <Button size="lg" className="bg-red-600 hover:bg-red-700">
              Get Started Now
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2025 Blood Donor App. Connecting donors with those in need.
          </p>
        </div>
      </footer>
    </div>
  );
}
