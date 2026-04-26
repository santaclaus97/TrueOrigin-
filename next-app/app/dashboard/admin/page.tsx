'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/authContext';
import * as productService from '@/features/products/productService';
import * as codeService from '@/features/codes/codeService';
import ConfirmationModal from '@/components/ConfirmationModal';
import { Trash2, Copy, CheckCircle2, XCircle, Search, Package, User } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [codes, setCodes] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'add' | 'codes'>('products');
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newProduct, setNewProduct] = useState({
    name: '', description: '', price: '', quantity: '', image: ''
  });

  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
    } else if (user) {
      fetchData();
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allProducts, allCodes] = await Promise.all([
        productService.getProducts(),
        codeService.getAdminCodes()
      ]);
      setProducts(allProducts.filter((p: any) => p.manufacturer?._id === user?._id));
      setCodes(allCodes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await productService.createProduct(newProduct);
      setSuccessMsg(`Added "${res.name}" with ${res.codesGenerated} unique codes generated.`);
      toast.success('Product created successfully');
      setNewProduct({ name: '', description: '', price: '', quantity: '', image: '' });
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to add product');
      toast.error('Failed to create product');
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      await productService.deleteProduct(productToDelete._id);
      toast.success('Product deleted successfully');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Code copied!');
  };

  const filteredCodes = codes.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.productId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.firstBuyer?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || loading) return <div className="text-center mt-2">Loading...</div>;

  const tabStyle = (tab: typeof activeTab) => ({
    padding: '10px 24px',
    cursor: 'pointer',
    color: activeTab === tab ? 'var(--primary-color)' : 'inherit',
    background: 'none',
    border: 'none',
    borderBottom: activeTab === tab ? '2px solid #6366f1' : '2px solid transparent',
    fontSize: '1rem',
    fontWeight: activeTab === tab ? '600' : '400',
    transition: 'all 0.3s ease',
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Admin Panel</h2>
          <p className="text-sm text-muted">Manage your products and authenticity codes</p>
        </div>
        <div className="badge badge-success" style={{ padding: '0.5rem 1.2rem' }}>
          Admin: {user?.name}
        </div>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', marginBottom: '2rem' }}>
        <button style={tabStyle('products')} onClick={() => setActiveTab('products')}>My Products</button>
        <button style={tabStyle('add')} onClick={() => setActiveTab('add')}>+ Add Product</button>
        <button style={tabStyle('codes')} onClick={() => setActiveTab('codes')}>Unique Codes</button>
      </div>

      {activeTab === 'add' && (
        <div className="glass-panel" style={{ maxWidth: '560px' }}>
          <h3>Add New Product</h3>
          {successMsg && <div className="badge badge-success mt-2 mb-2" style={{ display: 'block', padding: '10px' }}>{successMsg}</div>}
          {errorMsg && <div className="badge badge-danger mt-2 mb-2" style={{ display: 'block', padding: '10px' }}>{errorMsg}</div>}
          <form onSubmit={handleAddProduct} className="mt-2">
            <div className="form-group">
              <label className="form-label">Product Name</label>
              <input type="text" className="form-control" placeholder="e.g. SuperPen"
                value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={3} placeholder="Product description..."
                value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Price (INR)</label>
                <input type="number" className="form-control" placeholder="e.g. 49"
                  value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} required min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Total Quantity</label>
                <input type="number" className="form-control" placeholder="e.g. 10"
                  value={newProduct.quantity} onChange={e => setNewProduct({ ...newProduct, quantity: e.target.value })} required min="1" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Image URL (optional)</label>
              <input type="text" className="form-control" placeholder="https://..."
                value={newProduct.image} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })} />
            </div>
            <p style={{ fontSize: '0.82rem', opacity: 0.6, marginBottom: '1rem' }}>
              Unique codes will be auto-generated for each unit (e.g. XXXX000001, XXXX000002 ...)
            </p>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add Product & Generate Codes</button>
          </form>
        </div>
      )}

      {activeTab === 'products' && (
        <div>
          {products.length === 0 ? (
            <div className="glass-panel text-center">
              <p>No products yet. <button className="btn btn-primary" style={{ marginLeft: '10px' }} onClick={() => setActiveTab('add')}>Add your first product</button></p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {products.map(p => {
                const productCodes = codes.filter(c => c.productId?._id === p._id);
                const sold = productCodes.filter(c => c.isLocked).length;
                const available = productCodes.filter(c => !c.isLocked).length;
                return (
                  <div key={p._id} className="glass-panel" style={{ padding: '1.2rem' }}>
                    <div className="flex justify-between items-start">
                      {p.image && <img src={p.image} alt={p.name} style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.8rem' }} />}
                      <button 
                        onClick={() => {
                          setProductToDelete(p);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                    <h4 style={{ marginBottom: '4px' }}>{p.name}</h4>
                    <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '8px' }}>{p.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: '#6366f1', fontSize: '1.1rem' }}>INR {p.price}</strong>
                      <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Qty: {p.quantity}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>{available} available</span>
                      <span className="badge badge-danger" style={{ fontSize: '0.75rem' }}>{sold} sold</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'codes' && (
        <div>
          <div className="flex justify-between items-center mb-8 gap-4">
            <h3 style={{ margin: 0 }}>Unique Authenticity Codes</h3>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input 
                type="text" 
                placeholder="Search by code, product, or buyer..." 
                className="form-control"
                style={{ paddingLeft: '2.5rem', paddingRight: '1rem', height: '42px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table className="data-table" style={{ minWidth: '1000px' }}>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Product</th>
                    <th>Status</th>
                    <th>Owner</th>
                    <th>Generated</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCodes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-muted">No codes found matching your search.</td>
                    </tr>
                  ) : (
                    filteredCodes.map(code => (
                      <tr key={code._id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <code style={{ letterSpacing: '1px', fontWeight: 'bold', color: 'var(--primary-hover)', fontSize: '1rem' }}>{code.code}</code>
                            <button 
                              onClick={() => copyToClipboard(code.code)}
                              className="p-1.5 hover:bg-white/10 rounded text-muted hover:text-white transition-colors"
                            >
                              <Copy size={16} />
                            </button>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-3">
                            <Package size={16} className="text-muted" />
                            <span className="font-medium">{code.productId?.name}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            {code.isLocked ? (
                              <div className="flex items-center gap-2 text-red-400">
                                <XCircle size={16} />
                                <span className="text-xs font-black uppercase tracking-widest">Sold</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-green-400">
                                <CheckCircle2 size={16} />
                                <span className="text-xs font-black uppercase tracking-widest">Available</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          {code.firstBuyer ? (
                            <div className="flex items-center gap-3">
                              <User size={16} className="text-muted" />
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold">{code.firstBuyer.name}</span>
                                <span className="text-[11px] text-muted">{code.firstBuyer.email}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted text-xs italic">Unassigned</span>
                          )}
                        </td>
                        <td className="text-sm text-muted">
                          {new Date(code.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleDeleteProduct}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This will also delete all associated unique codes.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
}
