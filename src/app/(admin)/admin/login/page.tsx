'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AdminLoginRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const callbackUrl = searchParams.get('callbackUrl') || '/admin';
    router.replace(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center py-12">
      <div className="w-8 h-8 border-2 border-[#076E46] border-t-transparent rounded-full animate-spin" />
      <p className="mt-3 text-xs text-slate-500">Redirecting to secure login...</p>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginRedirect />
    </Suspense>
  );
}
