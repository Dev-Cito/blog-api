'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import LoginPage from '@/components/ui/gaming-login';

export default function RegisterPageRoute() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (name: string, email: string, password: string) => {
    setError(null);
    try {
      await api.post('/auth/register', { name, email, password });
      const meRes = await api.get('/auth/me');
      setAuth(meRes.data.data);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Something went wrong');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-12">
      <LoginPage.VideoBackground videoUrl="/assets/bg video.mp4" />

      <div className="relative z-20 w-full max-w-md">
        <LoginPage.RegisterForm onSubmit={handleRegister} error={error} />
      </div>

      <footer className="absolute bottom-4 left-0 right-0 text-center text-white/60 text-sm z-20">
        © 2026 Blog. All rights reserved.
      </footer>
    </div>
  );
}
