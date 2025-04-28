'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the signup page immediately
    router.push('/signup');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Redirecting to registration page...</p>
    </div>
  );
} 