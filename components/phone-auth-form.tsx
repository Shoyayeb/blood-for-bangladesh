'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth } from '@/lib/firebase';
import { ConfirmationResult, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function PhoneAuthForm() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  const setupRecaptcha = () => {
    if (!(window as unknown as { recaptchaVerifier?: RecaptchaVerifier }).recaptchaVerifier) {
      (window as unknown as { recaptchaVerifier: RecaptchaVerifier }).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA solved');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
          setError('reCAPTCHA expired. Please try again.');
        }
      });
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;

    setLoading(true);
    setError('');

    try {
      setupRecaptcha();
      const appVerifier = (window as unknown as { recaptchaVerifier: RecaptchaVerifier }).recaptchaVerifier;
      
      // Format phone number to include country code if not present
      let formattedPhone = phoneNumber;
      if (!phoneNumber.startsWith('+')) {
        formattedPhone = '+1' + phoneNumber.replace(/\D/g, '');
      }
      
      console.log('Attempting to send OTP to:', formattedPhone);
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmation(confirmation);
      setStep('otp');
    } catch (error: unknown) {
      console.error('Error sending OTP:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to send OTP';
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string; message: string };
        if (firebaseError.code === 'auth/invalid-app-credential') {
          errorMessage = 'Firebase app credentials are invalid. Please check your Firebase configuration.';
        } else if (firebaseError.code === 'auth/too-many-requests') {
          errorMessage = 'Too many requests. Please try again later.';
        } else if (firebaseError.code === 'auth/invalid-phone-number') {
          errorMessage = 'Invalid phone number format.';
        } else if (firebaseError.message) {
          errorMessage = firebaseError.message;
        }
      }
      
      setError(errorMessage);
      
      // Reset reCAPTCHA on error
      const windowWithRecaptcha = window as unknown as { recaptchaVerifier?: RecaptchaVerifier };
      if (windowWithRecaptcha.recaptchaVerifier) {
        windowWithRecaptcha.recaptchaVerifier.clear();
        windowWithRecaptcha.recaptchaVerifier = undefined;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !confirmation) return;

    setLoading(true);
    setError('');

    try {
      const result = await confirmation.confirm(otp);
      // User is signed in
      console.log('User signed in:', result.user);
      
      // Check if user exists in our database
      const response = await fetch(`/api/users/profile?phoneNumber=${result.user.phoneNumber}`);
      
      if (response.ok) {
        // User exists, redirect to dashboard
        router.push('/dashboard');
      } else {
        // New user, redirect to registration
        router.push('/auth/register');
      }
    } catch (error: unknown) {
      console.error('Error verifying OTP:', error);
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Blood for Bangladesh - Login</CardTitle>
        <CardDescription>
          {step === 'phone' 
            ? 'Enter your phone number to receive an OTP' 
            : 'Enter the OTP sent to your phone'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Sending...' : 'Send OTP'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOtp(e.target.value)}
                required
                maxLength={6}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setStep('phone')}
              className="w-full"
            >
              Change Phone Number
            </Button>
          </form>
        )}
        <div id="recaptcha-container"></div>
      </CardContent>
    </Card>
  );
}
