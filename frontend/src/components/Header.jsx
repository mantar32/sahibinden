import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import { getUnreadCount } from '../utils/api';
import './Header.css';

const Header = () => {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const { compareList } = useCompare();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();

    // Fetch unread message count
    useEffect(() => {
        if (isAuthenticated) {
            fetchUnreadCount();

            // Listen for message read events
            window.addEventListener('messagesRead', fetchUnreadCount);

            // Poll every 30 seconds
            const interval = setInterval(fetchUnreadCount, 30000);

            return () => {
                clearInterval(interval);
                window.removeEventListener('messagesRead', fetchUnreadCount);
            };
        }
    }, [isAuthenticated]);

    const fetchUnreadCount = async () => {
        try {
            const response = await getUnreadCount();
            setUnreadCount(response.data.unreadCount || 0);
        } catch (error) {
            console.error('Okunmamış mesaj sayısı alınamadı:', error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/kategori/tum-ilanlar?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
        navigate('/');
    };

    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    {/* Logo - Matches sahibinden.com style (Yellow box, black text) */}
                    <Link to="/" className="logo">
                        <span className="logo-text">sahibinden.com</span>
                    </Link>

                    {/* Search Bar */}
                    <form className="search-bar" onSubmit={handleSearch}>
                        <div className="search-input-wrapper">
                            <input
                                type="text"
                                placeholder="Kelime, ilan no veya mağaza adı ile ara"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                            <span className="search-icon" onClick={handleSearch}>🔍</span>
                        </div>
                        <Link to="/detayli-arama" className="detailed-search-link">
                            Detaylı Arama
                        </Link>
                    </form>

                    {/* Right Actions */}
                    <div className="header-actions">
                        {isAuthenticated ? (
                            <>
                                <div className="user-menu-wrapper">
                                    <button
                                        className="user-menu-trigger"
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                    >
                                        <img
                                            src={user?.avatar || 'https://ui-avatars.com/api/?name=User'}
                                            alt={user?.name}
                                            className="user-avatar"
                                        />
                                        <span className="user-name">{user?.name?.split(' ')[0]}</span>
                                        <span className="dropdown-arrow">▼</span>
                                    </button>

                                    {showUserMenu && (
                                        <div className="user-dropdown">
                                            <div className="dropdown-header">
                                                <img src={user?.avatar} alt={user?.name} className="dropdown-avatar" />
                                                <div>
                                                    <p className="dropdown-name">{user?.name}</p>
                                                    <p className="dropdown-email">{user?.email}</p>
                                                </div>
                                            </div>
                                            <div className="dropdown-divider"></div>
                                            <Link to="/profil" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                                                <span>👤</span> Profilim
                                            </Link>
                                            <Link to="/ilan-ver" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                                                <span>➕</span> İlan Ver
                                            </Link>
                                            <Link to="/favorilerim" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                                                <span>❤️</span> Favorilerim
                                            </Link>
                                            <Link to="/mesajlar" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                                                <span>💬</span> Mesajlarım
                                                {unreadCount > 0 && (
                                                    <span className="menu-badge">{unreadCount}</span>
                                                )}
                                            </Link>
                                            <Link to="/guvenli-islemlerim" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                                                <span>🛡️</span> Güvenli İşlemlerim
                                            </Link>
                                            <Link to="/cuzdanim" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                                                <span>💰</span> Cüzdanım
                                            </Link>
                                            <Link to="/odeme" className="dropdown-item premium-item" onClick={() => setShowUserMenu(false)}>
                                                <span>⭐</span> Premium Paketler
                                            </Link>
                                            {isAdmin && (
                                                <>
                                                    <div className="dropdown-divider"></div>
                                                    <Link to="/admin" className="dropdown-item admin-item" onClick={() => setShowUserMenu(false)}>
                                                        <span>⚙️</span> Admin Paneli
                                                    </Link>
                                                </>
                                            )}
                                            <div className="dropdown-divider"></div>
                                            <button className="dropdown-item logout-item" onClick={handleLogout}>
                                                <span>🚪</span> Çıkış Yap
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Messages Link with Badge */}
                                <Link to="/mesajlar" className="header-link messages-link">
                                    <span className="link-icon">💬</span>
                                    <span className="link-text">Mesajlar</span>
                                    {unreadCount > 0 && (
                                        <span className="unread-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                                    )}
                                </Link>

                                <Link to="/favorilerim" className="header-link favorites-link">
                                    <span className="link-icon">❤️</span>
                                    <span className="link-text">Favorilerim</span>
                                </Link>

                                {compareList.length > 0 && (
                                    <Link to="/karsilastir" className="header-link compare-link">
                                        <span className="link-icon">⚖️</span>
                                        <span className="link-text">Karşılaştır</span>
                                        <span className="unread-badge compare-badge">{compareList.length}</span>
                                    </Link>
                                )}
                            </>
                        ) : (
                            <div className="auth-links">
                                <Link to="/giris" className="header-link login-link">
                                    <span className="link-text">Giriş Yap</span>
                                </Link>
                                <Link to="/kayit" className="header-link register-link">
                                    <span className="link-text">Hesap Aç</span>
                                </Link>
                            </div>
                        )}

                        <Link to="/ilan-ver" className="btn post-ad-btn">
                            <span className="desktop-only">Ücretsiz* </span>İlan Ver
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
