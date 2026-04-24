import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="nav-brand">
                <Link to="/">TrueOrigin</Link>
            </div>
            <div className="nav-links">
                {!token ? (
                    <>
                        <Link to="/login" className="btn btn-outline">Login</Link>
                        <Link to="/register" className="btn btn-primary">Sign Up</Link>
                    </>
                ) : (
                    <>
                        {user.role === 'admin' ? (
                            <Link to="/admin-dashboard" className="nav-link">Dashboard (Admin)</Link>
                        ) : (
                            <Link to="/user-dashboard" className="nav-link">My Products</Link>
                        )}
                        <button onClick={handleLogout} className="btn btn-outline">Logout</button>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
