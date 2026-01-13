import React from 'react';
import { NavLink } from 'react-router-dom';
import './MobileBottomNav.css';

const MobileBottomNav = () => {
    return (
        <div className="mobile-bottom-nav">
            <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">👁️</span>
                <span className="nav-label">Vitrin</span>
            </NavLink>
            <NavLink to="/arama" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">🔍</span>
                <span className="nav-label">Arama</span>
            </NavLink>
            <NavLink to="/ilan-ver" className="nav-item center-item">
                <div className="plus-circle">
                    <span>+</span>
                </div>
                <span className="nav-label">İlan Ver</span>
            </NavLink>
            <NavLink to="/servisler" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">🛠️</span>
                <span className="nav-label">Servisler</span>
            </NavLink>
            <NavLink to="/bana-ozel" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">👤</span>
                <span className="nav-label">Bana Özel</span>
            </NavLink>
        </div>
    );
};

export default MobileBottomNav;
