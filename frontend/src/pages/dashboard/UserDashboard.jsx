import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000';

const UserDashboard = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('shop');
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        if (!localStorage.getItem('token')) navigate('/login');
        fetchData();
    }, []);

    const authConfig = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    const fetchData = async () => {
        try {
            const [prodRes, ordersRes] = await Promise.all([
                axios.get(`${API}/api/products`),
                axios.get(`${API}/api/orders/myorders`, authConfig())
            ]);
            setProducts(prodRes.data);
            setOrders(ordersRes.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center mt-2">Loading...</div>;

    const tabStyle = (tab) => ({
        padding: '10px 24px',
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        borderBottom: activeTab === tab ? '2px solid #6366f1' : '2px solid transparent',
        color: activeTab === tab ? '#6366f1' : 'inherit',
        fontSize: '1rem',
        fontWeight: activeTab === tab ? '600' : '400',
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h2>🛍️ TrueOrigin Store</h2>
                <div className="badge badge-primary" style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}>
                    {user?.name}
                </div>
            </div>

            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.5rem' }}>
                <button style={tabStyle('shop')} onClick={() => setActiveTab('shop')}>Shop</button>
                <button style={tabStyle('orders')} onClick={() => setActiveTab('orders')}>My Orders ({orders.length})</button>
            </div>

            {/* Shop Tab */}
            {activeTab === 'shop' && (
                <div>
                    {products.length === 0 ? (
                        <div className="glass-panel text-center"><p>No products available yet.</p></div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
                            {products.map(p => (
                                <div key={p._id} className="glass-panel" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column' }}>
                                    {p.image
                                        ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.8rem' }} />
                                        : <div style={{ width: '100%', height: '160px', background: 'rgba(99,102,241,0.15)', borderRadius: '8px', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🛒</div>
                                    }
                                    <h4 style={{ marginBottom: '4px' }}>{p.name}</h4>
                                    <p style={{ fontSize: '0.85rem', opacity: 0.7, flex: 1 }}>{p.description}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                                        <strong style={{ color: '#6366f1', fontSize: '1.2rem' }}>₹{p.price}</strong>
                                        <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>by {p.manufacturer?.name}</span>
                                    </div>
                                    <div style={{ marginTop: '8px', fontSize: '0.78rem', opacity: 0.5 }}>
                                        Each unit comes with a unique authenticity code
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
                <div className="glass-panel" style={{ overflowX: 'auto' }}>
                    <h3>My Purchased Products</h3>
                    {orders.length === 0 ? (
                        <p className="mt-2">No purchased products found.</p>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Manufacturer</th>
                                    <th>Unique Code</th>
                                    <th>Purchase Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order._id}>
                                        <td><strong>{order.uniqueCode?.productId?.name || 'Unknown'}</strong></td>
                                        <td>{order.uniqueCode?.productId?.manufacturer?.name || 'Unknown'}</td>
                                        <td><code style={{ letterSpacing: '1px' }}>{order.uniqueCode?.code}</code></td>
                                        <td>{new Date(order.purchaseDate).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`badge ${order.isResale ? 'badge-warning' : 'badge-success'}`}>
                                                {order.isResale ? 'Resale' : 'Original Owner'}
                                            </span>
                                        </td>
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

export default UserDashboard;
