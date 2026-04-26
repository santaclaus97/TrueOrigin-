'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/authContext';
import * as productService from '@/features/products/productService';
import * as orderService from '@/features/orders/orderService';
import ConfirmationModal from '@/components/ConfirmationModal';
import { ShoppingCart, CheckCircle, Package, Copy, Calendar, ShieldCheck, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';

export default function UserDashboard() {
  const router = useRouter();
  const { user, authLoading }: any = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'shop' | 'orders'>('shop');
  const [loading, setLoading] = useState(true);

  // Purchase state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchData();
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allProducts, myOrders] = await Promise.all([
        productService.getProducts(),
        orderService.getMyOrders()
      ]);
      setProducts(allProducts);
      setOrders(myOrders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedProduct) return;

    try {
      await orderService.createOrder(selectedProduct._id);
      toast.success('Product purchased successfully!');
      setIsConfirmModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Purchase failed.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Code copied to clipboard!');
  };

  if (authLoading || loading) return <div className="text-center mt-2">Loading...</div>;

  const tabStyle = (tab: typeof activeTab) => ({
    padding: '10px 24px',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    borderBottom: activeTab === tab ? '2px solid #6366f1' : '2px solid transparent',
    color: activeTab === tab ? '#6366f1' : 'inherit',
    fontSize: '1rem',
    fontWeight: activeTab === tab ? '600' : '400',
    transition: 'all 0.3s ease',
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">TrueOrigin Store</h2>
          <p className="text-sm text-muted">Securely purchase and verify original products</p>
        </div>
        <div className="badge badge-primary" style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8', padding: '0.5rem 1.2rem' }}>
          {user?.name}
        </div>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', marginBottom: '2rem' }}>
        <button style={tabStyle('shop')} onClick={() => setActiveTab('shop')}>Shop</button>
        <button style={tabStyle('orders')} onClick={() => setActiveTab('orders')}>My Orders ({orders.length})</button>
      </div>

      {activeTab === 'shop' && (
        <div>
          {products.length === 0 ? (
            <div className="glass-panel text-center"><p>No products available yet.</p></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {products.map(p => {
                const isSoldOut = p.availableCount <= 0;
                const hasBoughtBefore = orders.some(order => order.uniqueCode?.productId?._id === p._id);
                
                return (
                  <div key={p._id} className="glass-panel" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column' }}>
                    <div className="product-image-container">
                      {p.image ? (
                        <img 
                          src={p.image} 
                          alt={p.name} 
                          className={`product-image ${isSoldOut ? 'sold-out-image' : ''}`}
                        />
                      ) : (
                        <div className={`product-image flex items-center justify-center bg-indigo-500/10 ${isSoldOut ? 'grayscale' : ''}`}>
                          <Package size={48} className="text-indigo-500/40" />
                        </div>
                      )}
                      {isSoldOut && (
                        <div className="sold-out-overlay">
                          <span className="sold-out-badge">Sold Out</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-start mb-1">
                      <h4 style={{ margin: 0 }}>{p.name}</h4>
                      <span className={`text-xs font-bold ${isSoldOut ? 'text-red-400' : 'text-green-400'}`}>
                        {isSoldOut ? 'Out of Stock' : `${p.availableCount} left`}
                      </span>
                    </div>
                    
                    <p style={{ fontSize: '0.85rem', opacity: 0.7, flex: 1 }}>{p.description}</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                      <strong style={{ color: '#6366f1', fontSize: '1.2rem' }}>INR {p.price}</strong>
                      <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>by {p.manufacturer?.name}</span>
                    </div>
                    
                    <button 
                      onClick={() => {
                        setSelectedProduct(p);
                        setIsConfirmModalOpen(true);
                      }}
                      className={`btn mt-3 ${isSoldOut ? 'bg-gray-500/10 text-gray-500 cursor-not-allowed' : 'btn-primary'}`} 
                      style={{ width: '100%', gap: '8px' }}
                      disabled={isSoldOut}
                    >
                      {isSoldOut ? (
                        'Unavailable'
                      ) : hasBoughtBefore ? (
                        <><RefreshCcw size={18} /> Buy Again</>
                      ) : (
                        <><ShoppingCart size={18} /> Buy Now</>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          <h3 className="flex items-center gap-2 mb-4">
            <CheckCircle className="text-green-400" size={24} /> My Purchased Products
          </h3>
          {orders.length === 0 ? (
            <div className="glass-panel text-center">
              <p>No purchased products found. Go to the shop to buy your first authentic product!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
              {orders.map(order => (
                <div key={order._id} className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-white/5 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      {order.uniqueCode?.productId?.image ? (
                        <img src={order.uniqueCode.productId.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Package className="text-white/20" size={32} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 style={{ margin: 0, fontSize: '1.2rem' }}>{order.uniqueCode?.productId?.name || 'Unknown Product'}</h4>
                        <span className={`badge ${order.isResale ? 'badge-warning' : 'badge-success'}`}>
                          {order.isResale ? 'Resale' : 'Original Owner'}
                        </span>
                      </div>
                      <p className="text-xs text-muted mb-3">from {order.uniqueCode?.productId?.manufacturer?.name || 'Unknown Manufacturer'}</p>
                      
                      <div className="bg-black/20 rounded-lg p-3 border border-white/5 mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] uppercase tracking-wider text-muted font-bold">Unique Authenticity Code</span>
                          <button 
                            onClick={() => copyToClipboard(order.uniqueCode?.code)}
                            className="p-1 hover:bg-white/10 rounded transition-colors text-indigo-400"
                            title="Copy Code"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                        <code className="text-lg font-mono text-white tracking-widest block">{order.uniqueCode?.code}</code>
                      </div>

                      <div className="flex gap-4 text-xs text-muted">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(order.purchaseDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-1 text-green-400">
                          <ShieldCheck size={12} />
                          Verified Authentic
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handlePurchase}
        title="Confirm Purchase"
        message={`Are you sure you want to purchase "${selectedProduct?.name}"? This will generate a new unique ownership record for you.`}
        confirmText="Confirm Purchase"
      />
    </div>
  );
}
