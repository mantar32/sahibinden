import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAdminListings, getAdminUsers, approveListing, rejectListing, banUser, unbanUser, recalculateBalances, recalculateUserBalance } from '../utils/api';
import './AdminPage.css';

const AdminPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();

    const [activeTab, setActiveTab] = useState('listings');
    const [listings, setListings] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) {
                navigate('/giris?redirect=/admin');
            } else if (!isAdmin) {
                navigate('/');
            }
        }
    }, [isAuthenticated, isAdmin, authLoading, navigate]);

    useEffect(() => {
        if (isAdmin) {
            fetchData();
        }
    }, [isAdmin]);

    const fetchData = async () => {
        try {
            const [listingsRes, usersRes] = await Promise.all([
                getAdminListings(),
                getAdminUsers()
            ]);
            setListings(listingsRes.data);
            setUsers(usersRes.data);
        } catch (error) {
            console.error('Veri yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveListing = async (id) => {
        try {
            await approveListing(id);
            setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'approved' } : l));
        } catch (error) {
            console.error('İlan onaylanırken hata:', error);
        }
    };

    const handleRejectListing = async (id) => {
        try {
            await rejectListing(id);
            setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'rejected' } : l));
        } catch (error) {
            console.error('İlan reddedilirken hata:', error);
        }
    };

    const handleBanUser = async (id) => {
        if (window.confirm('Bu kullanıcıyı banlamak istediğinizden emin misiniz?')) {
            try {
                await banUser(id);
                setUsers(prev => prev.map(u => u.id === id ? { ...u, isBanned: true } : u));
            } catch (error) {
                console.error('Kullanıcı banlanırken hata:', error);
            }
        }
    };

    const handleUnbanUser = async (id) => {
        try {
            await unbanUser(id);
            setUsers(prev => prev.map(u => u.id === id ? { ...u, isBanned: false } : u));
        } catch (error) {
            console.error('Ban kaldırılırken hata:', error);
        }
    };





    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('tr-TR');
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0
        }).format(price);
    };

    const pendingListings = listings.filter(l => l.status === 'pending');
    const approvedListings = listings.filter(l => l.status === 'approved');
    const rejectedListings = listings.filter(l => l.status === 'rejected');

    if (authLoading || loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="container">
                <div className="admin-header">
                    <div>
                        <h1>⚙️ Admin Paneli</h1>
                        <p>İlan ve kullanıcı yönetimi</p>
                    </div>

                </div>

                {/* Stats */}
                <div className="admin-stats">
                    <div className="stat-card">
                        <span className="stat-icon">📋</span>
                        <div className="stat-info">
                            <span className="stat-number">{pendingListings.length}</span>
                            <span className="stat-label">Bekleyen İlan</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon">✅</span>
                        <div className="stat-info">
                            <span className="stat-number">{approvedListings.length}</span>
                            <span className="stat-label">Onaylı İlan</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon">👥</span>
                        <div className="stat-info">
                            <span className="stat-number">{users.length}</span>
                            <span className="stat-label">Toplam Kullanıcı</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon">🚫</span>
                        <div className="stat-info">
                            <span className="stat-number">{users.filter(u => u.isBanned).length}</span>
                            <span className="stat-label">Banlı Kullanıcı</span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="admin-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'listings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('listings')}
                    >
                        📋 İlanlar ({listings.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        ⏳ Bekleyenler ({pendingListings.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        👥 Kullanıcılar ({users.length})
                    </button>
                </div>

                {/* Content */}
                <div className="admin-content">
                    {/* Listings Tab */}
                    {(activeTab === 'listings' || activeTab === 'pending') && (
                        <div className="table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Başlık</th>
                                        <th>Kategori</th>
                                        <th>Fiyat</th>
                                        <th>Satıcı</th>
                                        <th>Durum</th>
                                        <th>Tarih</th>
                                        <th>İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(activeTab === 'pending' ? pendingListings : listings).map(listing => (
                                        <tr key={listing.id}>
                                            <td>#{listing.id}</td>
                                            <td className="title-cell">
                                                <img src={listing.images?.[0]} alt="" className="listing-thumb" />
                                                <span>{listing.title}</span>
                                            </td>
                                            <td>{listing.category}</td>
                                            <td>{formatPrice(listing.price)}</td>
                                            <td>{listing.seller?.name}</td>
                                            <td>
                                                <span className={`status-badge status-${listing.status}`}>
                                                    {listing.status === 'pending' && '⏳ Beklemede'}
                                                    {listing.status === 'approved' && '✅ Onaylı'}
                                                    {listing.status === 'rejected' && '❌ Reddedildi'}
                                                </span>
                                            </td>
                                            <td>{formatDate(listing.createdAt)}</td>
                                            <td className="actions-cell">
                                                {listing.status === 'pending' && (
                                                    <>
                                                        <button
                                                            className="action-btn approve"
                                                            onClick={() => handleApproveListing(listing.id)}
                                                        >
                                                            ✓
                                                        </button>
                                                        <button
                                                            className="action-btn reject"
                                                            onClick={() => handleRejectListing(listing.id)}
                                                        >
                                                            ✕
                                                        </button>
                                                    </>
                                                )}
                                                {listing.status === 'approved' && (
                                                    <button
                                                        className="action-btn reject"
                                                        onClick={() => handleRejectListing(listing.id)}
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                                {listing.status === 'rejected' && (
                                                    <button
                                                        className="action-btn approve"
                                                        onClick={() => handleApproveListing(listing.id)}
                                                    >
                                                        ✓
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div className="table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>İsim</th>
                                        <th>E-posta</th>
                                        <th>Rol</th>
                                        <th>İlan Sayısı</th>
                                        <th>Durum</th>
                                        <th>Kayıt Tarihi</th>
                                        <th>İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id} className={user.isBanned ? 'banned-row' : ''}>
                                            <td>#{user.id}</td>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className={`role-badge role-${user.role}`}>
                                                    {user.role === 'admin' ? '👑 Admin' : '👤 Kullanıcı'}
                                                </span>
                                            </td>
                                            <td>{user.listingCount}</td>
                                            <td>
                                                <span className={`status-badge ${user.isBanned ? 'status-banned' : 'status-active'}`}>
                                                    {user.isBanned ? '🚫 Banlı' : '✅ Aktif'}
                                                </span>
                                            </td>
                                            <td>{formatDate(user.createdAt)}</td>
                                            <td className="actions-cell">

                                                {user.role !== 'admin' && (
                                                    user.isBanned ? (
                                                        <button
                                                            className="action-btn approve"
                                                            onClick={() => handleUnbanUser(user.id)}
                                                        >
                                                            🔓
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="action-btn reject"
                                                            onClick={() => handleBanUser(user.id)}
                                                        >
                                                            🚫
                                                        </button>
                                                    )
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
