'use client';

import { useState } from 'react';
import axios from 'axios';
import { ShieldCheck, User, Package, Building2 } from 'lucide-react';

export default function HomePage() {
  const [code, setCode] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setVerificationResult(null);
    setLoading(true);

    try {
      const res = await axios.get(`/api/codes/verify/${code}`);
      setVerificationResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. This code may be invalid or counterfeit.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <div className="hero-section text-center mb-2" style={{ padding: '3rem 0 4rem 0' }}>
        <h1 className="text-gradient" style={{ fontSize: '4.5rem', marginBottom: '1.5rem', lineHeight: '1.1' }}>TrueOrigin</h1>
        <p style={{ fontSize: '1.25rem', maxWidth: '650px', margin: '0 auto', color: 'var(--text-secondary)' }}>
          Verify the originality of your products instantly. Enter the unique product code provided by the manufacturer to ensure absolute authenticity.
        </p>
      </div>

      <div className="flex justify-center items-center">
        <div className="glass-panel" style={{ width: '100%', maxWidth: '650px' }}>
          <h2 className="text-center mb-2" style={{ letterSpacing: '0.5px' }}>Verify Product Code</h2>
          <form onSubmit={handleVerify} className="flex" style={{ gap: '1rem' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Enter your unique product code..."
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ whiteSpace: 'nowrap' }}>
              {loading ? 'Verifying...' : 'Verify Now'}
            </button>
          </form>

          {error && (
            <div className="mt-2 glass-panel" style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
              <p style={{ color: '#f87171', margin: 0, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>⚠️</span> {error}
              </p>
            </div>
          )}

          {verificationResult && (
            <div className="mt-2 glass-panel" style={{ background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
              <div className="flex justify-between items-center mb-2">
                <h3 style={{ margin: 0, color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={24} /> Code Verified
                </h3>
                <span className={`badge ${verificationResult.isLocked ? 'badge-warning' : 'badge-success'}`}>
                  {verificationResult.isLocked ? 'Already Sold' : 'Available for Purchase'}
                </span>
              </div>
              <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.25)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <Package className="text-indigo-400 shrink-0 mt-1" size={18} />
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted font-bold mb-1">Product</p>
                      <p className="text-white font-medium">{verificationResult.product.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building2 className="text-indigo-400 shrink-0 mt-1" size={18} />
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted font-bold mb-1">Manufacturer</p>
                      <p className="text-white font-medium">{verificationResult.product.manufacturer.name}</p>
                    </div>
                  </div>

                  {verificationResult.isLocked && verificationResult.firstBuyer && (
                    <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20 mt-2">
                      <User className="text-green-400 shrink-0" size={18} />
                      <div>
                        <p className="text-xs uppercase tracking-wider text-green-400/70 font-bold mb-1">Current Owner (First Buyer)</p>
                        <p className="text-white font-medium">{verificationResult.firstBuyer.name}</p>
                        <p className="text-xs text-green-400/60">{verificationResult.firstBuyer.email}</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-2 pt-2 border-t border-white/5">
                    <p className="text-xs text-muted leading-relaxed">
                      <strong>Description:</strong> {verificationResult.product.description}
                    </p>
                  </div>
                </div>
              </div>
              
              <p className="mt-2 text-center" style={{ color: '#34d399', fontSize: '0.95rem', fontWeight: '500' }}>
                {verificationResult.message}
              </p>
              
              {!verificationResult.isLocked && (
                <div className="text-center mt-2" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Login or Sign up to securely purchase and lock this product code to your account.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
