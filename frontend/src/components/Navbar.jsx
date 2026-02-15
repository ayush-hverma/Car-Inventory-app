import { NavLink } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="nav-container">
                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
                    Analysis
                </NavLink>
                <NavLink to="/inventory" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    Vehicle Inventory
                </NavLink>
                <NavLink to="/performance" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    Model Performance
                </NavLink>
            </div>
        </nav>
    );
};

export default Navbar;
