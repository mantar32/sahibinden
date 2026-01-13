import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserListings, deleteListing, updateProfile } from '../utils/api';
import ListingCard from '../components/ListingCard';
import './ProfilePage.css';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, isAuthenticated, loading: authLoading, logout } = useAuth();

    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'listings');
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [profileData, setProfileData] = useState({ name: '', phone: '' });
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/giris');
        }
    }, [isAuthenticated, authLoading, navigate]);

    useEffect(() => {
        if (user) {
            fetchUserListings();
            setProfileData({ name: user.name, phone: user.phone || '' });

            if (searchParams.get('success') === 'true') {
                setSuccessMessage('İlanınız başarıyla oluşturuldu ve incelemeye alındı.');
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        }
    }, [user, searchParams]);

    const fetchUserListings = async () => {
        try {
            const response = await getUserListings(user.id);
            setListings(response.data);
        } catch (error) {
            console.error('İlanlar yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteListing = async (listingId) => {
        if (window.confirm('Bu ilanı silmek istediğinizden emin misiniz?')) {
            try {
                await deleteListing(listingId);
                setListings(prev => prev.filter(l => l.id !== listingId));
            } catch (error) {
                console.error('İlan silinirken hata:', error);
            }
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateProfile(profileData);
            setEditMode(false);
            setSuccessMessage('Profil bilgileriniz güncellendi.');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Profil güncellenirken hata:', error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (authLoading || !user) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    const approvedListings = listings.filter(l => l.status === 'approved');
    const pendingListings = listings.filter(l => l.status === 'pending');
    const rejectedListings = listings.filter(l => l.status === 'rejected');

    return (
        <div className="profile-page">
            <div className="container">
                {/* Success Message */}
                {successMessage && (
                    <div className="success-message animate-slideUp">
                        ✓ {successMessage}
                    </div>
                )}

                <div className="profile-layout">
                    {/* Sidebar */}
                    <aside className="profile-sidebar">
                        <div className="profile-card">
                            <img src={user.avatar} alt={user.name} className="profile-avatar" />
                            <h2 className="profile-name">{user.name}</h2>
                            <p className="profile-email">{user.email}</p>
                            {user.phone && <p className="profile-phone">📞 {user.phone}</p>}

                            <div className="profile-stats">
                                <div className="stat">
                                    <span className="stat-value">{listings.length}</span>
                                    <span className="stat-label">İlan</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-value">{user.favorites?.length || 0}</span>
                                    <span className="stat-label">Favori</span>
                                </div>
                            </div>

                            <button className="btn btn-secondary btn-block" onClick={handleLogout}>
                                🚪 Çıkış Yap
                            </button>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="profile-content">
                        {/* Tabs */}
                        <div className="profile-tabs">
                            <button
                                className={`tab-btn ${activeTab === 'listings' ? 'active' : ''}`}
                                onClick={() => setActiveTab('listings')}
                            >
                                📋 İlanlarım
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                                onClick={() => setActiveTab('settings')}
                            >
                                ⚙️ Ayarlar
                            </button>
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'listings' && (
                            <div className="tab-content">
                                {/* Pending Listings */}
                                {pendingListings.length > 0 && (
                                    <div className="listing-section">
                                        <h3 className="section-title">
                                            <span className="badge badge-warning">Beklemede</span>
                                            {pendingListings.length} ilan onay bekliyor
                                        </h3>
                                        <div className="listings-grid">
                                            {pendingListings.map(listing => (
                                                <div key={listing.id} className="listing-item pending">
                                                    <ListingCard listing={listing} />
                                                    <div className="listing-actions">
                                                        <button
                                                            className="btn btn-sm btn-edit"
                                                            onClick={() => navigate(`/ilan-duzenle/${listing.id}`)}
                                                        >
                                                            ✏️ Düzenle
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-secondary"
                                                            onClick={() => handleDeleteListing(listing.id)}
                                                        >
                                                            🗑️ Sil
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Approved Listings */}
                                {approvedListings.length > 0 && (
                                    <div className="listing-section">
                                        <h3 className="section-title">
                                            <span className="badge badge-success">Yayında</span>
                                            {approvedListings.length} aktif ilan
                                        </h3>
                                        <div className="listings-grid">
                                            {approvedListings.map(listing => (
                                                <div key={listing.id} className="listing-item">
                                                    <ListingCard listing={listing} />
                                                    <div className="listing-actions">
                                                        {!listing.isFeatured && (
                                                            <button
                                                                className="btn btn-sm btn-promote"
                                                                onClick={() => navigate(`/vitrin/${listing.id}`)}
                                                            >
                                                                ⭐ Vitrine Çıkar
                                                            </button>
                                                        )}
                                                        {listing.isFeatured && (
                                                            <span className="featured-tag">⭐ Vitrinde</span>
                                                        )}
                                                        {!listing.isSold && (
                                                            <button
                                                                className="btn btn-sm btn-edit"
                                                                onClick={() => navigate(`/ilan-duzenle/${listing.id}`)}
                                                            >
                                                                ✏️ Düzenle
                                                            </button>
                                                        )}
                                                        <button
                                                            className="btn btn-sm btn-secondary"
                                                            onClick={() => handleDeleteListing(listing.id)}
                                                        >
                                                            🗑️ Sil
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Rejected Listings */}
                                {rejectedListings.length > 0 && (
                                    <div className="listing-section">
                                        <h3 className="section-title">
                                            <span className="badge badge-error">Reddedildi</span>
                                            {rejectedListings.length} ilan
                                        </h3>
                                        <div className="listings-grid">
                                            {rejectedListings.map(listing => (
                                                <div key={listing.id} className="listing-item rejected">
                                                    <ListingCard listing={listing} />
                                                    <div className="listing-actions">
                                                        <button
                                                            className="btn btn-sm btn-secondary"
                                                            onClick={() => handleDeleteListing(listing.id)}
                                                        >
                                                            🗑️ Sil
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {listings.length === 0 && !loading && (
                                    <div className="empty-state">
                                        <span className="empty-icon">📦</span>
                                        <h3>Henüz ilanınız yok</h3>
                                        <p>Hemen ilk ilanınızı oluşturun ve satışa başlayın!</p>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => navigate('/ilan-ver')}
                                        >
                                            📝 İlan Ver
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="tab-content">
                                <div className="settings-section">
                                    <h3>Profil Bilgileri</h3>

                                    <form onSubmit={handleProfileUpdate}>
                                        <div className="form-group">
                                            <label className="form-label">Ad Soyad</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={profileData.name}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                                                disabled={!editMode}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">E-posta</label>
                                            <input
                                                type="email"
                                                className="form-input"
                                                value={user.email}
                                                disabled
                                            />
                                            <span className="form-hint">E-posta değiştirilemez</span>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Telefon</label>
                                            <input
                                                type="tel"
                                                className="form-input"
                                                value={profileData.phone}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                                                disabled={!editMode}
                                                placeholder="05XX XXX XX XX"
                                            />
                                        </div>

                                        <div className="form-actions">
                                            {editMode ? (
                                                <>
                                                    <button type="submit" className="btn btn-primary">
                                                        💾 Kaydet
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary"
                                                        onClick={() => {
                                                            setEditMode(false);
                                                            setProfileData({ name: user.name, phone: user.phone || '' });
                                                        }}
                                                    >
                                                        İptal
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary"
                                                    onClick={() => setEditMode(true)}
                                                >
                                                    ✏️ Düzenle
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
