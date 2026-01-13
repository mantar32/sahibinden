import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ListingCard.css';

const ListingCard = ({ listing, onFavoriteToggle }) => {
    const { user, isAuthenticated, toggleFavorite } = useAuth();
    const isFavorite = user?.favorites?.includes(listing.id);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    const formatDate = (date) => {
        const now = new Date();
        const listingDate = new Date(date);
        const diffTime = Math.abs(now - listingDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Bugün';
        if (diffDays === 2) return 'Dün';
        if (diffDays < 7) return `${diffDays} gün önce`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
        return listingDate.toLocaleDateString('tr-TR');
    };

    const handleFavoriteClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            window.location.href = '/giris';
            return;
        }
        await toggleFavorite(listing.id);
        if (onFavoriteToggle) onFavoriteToggle(listing.id);
    };

    const createSlug = (title) => {
        return title
            .toLowerCase()
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ı/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    };

    return (
        <Link
            to={`/ilan/${listing.id}/${createSlug(listing.title)}`}
            className="listing-card"
        >
            <div className="listing-image-wrapper">
                <img
                    src={listing.images?.[0] || 'https://via.placeholder.com/300x200?text=Görsel+Yok'}
                    alt={listing.title}
                    className="listing-image"
                    loading="lazy"
                />
                {listing.isSold && (
                    <span className="sold-badge">SATILDI</span>
                )}
                {listing.isFeatured && !listing.isSold && (
                    <span className="featured-badge">⭐ Vitrin</span>
                )}
                <button
                    className={`favorite-btn ${isFavorite ? 'is-favorite' : ''}`}
                    onClick={handleFavoriteClick}
                    aria-label={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                >
                    {isFavorite ? '❤️' : '🤍'}
                </button>
                <span className="image-count">
                    📷 {listing.images?.length || 0}
                </span>
            </div>

            <div className="listing-content">
                <h3 className="listing-title">{listing.title}</h3>

                <div className="listing-meta">
                    <span className="listing-location">
                        📍 {listing.city}{listing.district && `, ${listing.district}`}
                    </span>
                    <span className="listing-date">{formatDate(listing.createdAt)}</span>
                </div>

                <div className="listing-footer">
                    <span className="listing-price">{formatPrice(listing.price)}</span>
                    <span className="listing-views">👁️ {listing.views}</span>
                </div>
            </div>
        </Link>
    );
};

export default ListingCard;
