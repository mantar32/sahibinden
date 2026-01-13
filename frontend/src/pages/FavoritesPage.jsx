import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFavorites } from '../utils/api';
import ListingCard from '../components/ListingCard';
import './FavoritesPage.css';

const FavoritesPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, loading: authLoading } = useAuth();

    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/giris?redirect=/favorilerim');
        }
    }, [isAuthenticated, authLoading, navigate]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchFavorites();
        }
    }, [isAuthenticated]);

    const fetchFavorites = async () => {
        try {
            const response = await getFavorites();
            setFavorites(response.data);
        } catch (error) {
            console.error('Favoriler yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFavoriteToggle = (listingId) => {
        setFavorites(prev => prev.filter(l => l.id !== listingId));
    };

    if (authLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="favorites-page">
            <div className="container">
                <div className="page-header">
                    <h1>❤️ Favorilerim</h1>
                    <p>Beğendiğiniz ilanları burada görebilirsiniz</p>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                    </div>
                ) : favorites.length > 0 ? (
                    <div className="favorites-grid">
                        {favorites.map(listing => (
                            <ListingCard
                                key={listing.id}
                                listing={listing}
                                onFavoriteToggle={handleFavoriteToggle}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <span className="empty-icon">💔</span>
                        <h3>Henüz favoriniz yok</h3>
                        <p>İlanları incelerken beğendiklerinizi kalp ikonuna tıklayarak favorilere ekleyebilirsiniz.</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/kategori/tum-ilanlar')}
                        >
                            📋 İlanları İncele
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FavoritesPage;
