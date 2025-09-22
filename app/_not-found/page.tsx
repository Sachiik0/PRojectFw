'use client';

export const dynamic = 'force-dynamic';

export default function NotFoundPage() {
  return (
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
      <p className="text-gray-600">Sorry, we couldn’t find that page.</p>
    </div>
  );
}
