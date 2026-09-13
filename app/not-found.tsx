import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
      <p className="text-gray-500 mb-6">The product or page you're looking for doesn't exist or may have been removed.</p>
      <Link href="/" className="btn-primary inline-block">Back to Home</Link>
    </div>
  );
}
