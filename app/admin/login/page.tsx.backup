"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }
      router.push("/admin/dashboard");
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="card p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold text-center mb-1">BuyNexa Admin</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Sign in to manage your store</p>
        <div className="space-y-4">
          <input required type="email" placeholder="Email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input required type="password" placeholder="Password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full mt-6">
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
