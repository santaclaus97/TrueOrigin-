import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [codes, setCodes] = useState([]);
    const [activeTab, setActiveTab] = useState('products');
    const [loading, setLoading] = useState(true);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [newProduct, setNewProduct] = useState({
        name: '', description: '', price: '', quantity: '', image: ''
    });

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || user.role !== 'admin') navigate('/login');
        fetchData();
    }, []);

    const authConfig = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    const fetchData = async () => {
        try {
            const [prodRes, codesRes] = await Promise.all([
                axios.get(`${API}/api/products`),
                axios.get(`${API}/api/codes/admin`, authConfig())
            ]);
            setProducts(prodRes.data.filter(p => p.manufacturer._id === user._id));
            setCodes(codesRes.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        setErrorMsg(''); setSuccessMsg('');
        try {
            const res = await axios.post(`${API}/api/products`, newProduct, authConfig());
            setSuccessMsg(`✅ "${res.data.name}" added with ${res.data.codesGenerated} unique codes generated.`);
            setNewProduct({ name: '', description: '', price: '', quantity: '', image: '' });
            fetchData();
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Failed to add product');
        }
    };

    if (loading) return <div className="text-center mt-2">Loading...</div>;

    const tabStyle = (tab) => ({
        padding: '10px 24px',
        cursor: 'pointer',
        borderBottom: activeTab === tab ? '2px solid var(--primary-color)' : '2px solid transparent',
        color: activeTab === tab ? 'var(--primary-color)' : 'inherit',
        background: 'none',
        border: 'none',
        borderBottom: activeTab === tab ? '2px solid #6366f1' : '2px solid transparent',
        fontSize: '1rem',
        fontWeight: activeTab === tab ? '600' : '400',
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h2>🏪 Admin Panel</h2>
                <div className="badge badge-success">Admin: {user?.name}</div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.5rem' }}>
                <button style={tabStyle('products')} onClick={() => setActiveTab('products')}>My Products</button>
                <button style={tabStyle('add')} onClick={() => setActiveTab('add')}>+ Add Product</button>
                <button style={tabStyle('codes')} onClick={() => setActiveTab('codes')}>Unique Codes</button>
            </div>

            {/* Add Product Tab */}
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
                            <textarea className="form-control" rows="3" placeholder="Product description..."
                                value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} required />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Price (₹)</label>
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

            {/* Products Tab */}
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
                                        {p.image && <img src={p.image} alt={p.name} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.8rem' }} />}
                                        <h4 style={{ marginBottom: '4px' }}>{p.name}</h4>
                                        <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '8px' }}>{p.description}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <strong style={{ color: '#6366f1', fontSize: '1.1rem' }}>₹{p.price}</strong>
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

            {/* Codes Tab */}
            {activeTab === 'codes' && (
                <div className="glass-panel" style={{ overflowX: 'auto' }}>
                    <h3>All Unique Codes</h3>
                    {codes.length === 0 ? (
                        <p className="mt-2">No codes yet.</p>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Product</th>
                                    <th>Status</th>
                                    <th>First Buyer</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {codes.map(code => (
                                    <tr key={code._id}>
                                        <td><code style={{ letterSpacing: '2px' }}>{code.code}</code></td>
                                        <td>{code.productId?.name}</td>
                                        <td>
                                            <span className={`badge ${code.isLocked ? 'badge-danger' : 'badge-success'}`}>
                                                {code.isLocked ? 'Sold' : 'Available'}
                                            </span>
                                        </td>
                                        <td>{code.firstBuyer ? code.firstBuyer.email : '-'}</td>
                                        <td>{new Date(code.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
