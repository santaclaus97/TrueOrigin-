import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import api from '../lib/api';

const getAuthErrorMessage = (err, fallbackMessage) => {
    if (err.response?.status === 503) {
        return 'Database unavailable. Start MongoDB locally or configure MONGODB_URI in backend/.env.';
    }

    return err.response?.data?.message || fallbackMessage;
};

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/auth/login', formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data));

            if (res.data.role === 'admin') {
                navigate('/admin-dashboard');
            } else {
                navigate('/user-dashboard');
            }
        } catch (err) {
            setError(getAuthErrorMessage(err, 'Login failed'));
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const res = await api.post('/api/auth/google', {
                credential: credentialResponse.credential
            });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data));

            if (res.data.role === 'admin') {
                navigate('/admin-dashboard');
            } else {
                navigate('/user-dashboard');
            }
        } catch (err) {
            setError(getAuthErrorMessage(err, 'Google Login failed'));
        }
    };

    return (
        <div className="flex justify-center items-center" style={{ minHeight: '80vh' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 className="text-center mb-2">Welcome Back</h2>
                {error && <div className="badge badge-danger text-center mb-2" style={{ display: 'block', padding: '10px' }}>{error}</div>}
                
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Google Login Failed')}
                    />
                </div>
                
                <div style={{ textAlign: 'center', margin: '15px 0', color: 'var(--text-color)', opacity: 0.7 }}>or login with email</div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        Login to TrueOrigin
                    </button>
                </form>
                <p className="text-center mt-2" style={{ fontSize: '0.9rem' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--primary-color)' }}>Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
