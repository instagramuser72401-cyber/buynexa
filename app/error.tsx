"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-bold mb-2">Something Went Wrong</h1>
      <p className="text-gray-500 mb-6">We hit an unexpected error on our end. Please try again.</p>
      <button onClick={() => reset()} className="btn-primary">Try Again</button>
    </div>
  );
}
