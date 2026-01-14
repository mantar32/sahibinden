import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getListing, sendMessage, incrementView } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ImageGallery from '../components/ImageGallery';
import SEO from '../components/SEO';
import './ListingDetailPage.css';

const ListingDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, toggleFavorite } = useAuth();
    const viewIncremented = useRef(false); // Prevent double increment

    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPhone, setShowPhone] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [messageSending, setMessageSending] = useState(false);
    const [messageSent, setMessageSent] = useState(false);

    const isFavorite = user?.favorites?.includes(id);

    useEffect(() => {
        fetchListing();
    }, [id]);

    // Separate effect for view increment - runs only once
    useEffect(() => {
        if (id && !viewIncremented.current) {
            viewIncremented.current = true;
            incrementView(id).catch(err => console.log('View increment failed'));
        }
    }, [id]);

    const fetchListing = async () => {
        try {
            const response = await getListing(id);
            setListing(response.data);
        } catch (error) {
            console.error('İlan yüklenirken hata:', error);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: listing.title,
                    url: url
                });
            } catch (err) {
                console.log('Paylaşım iptal edildi');
            }
        } else {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleFavorite = async () => {
        if (!isAuthenticated) {
            navigate('/giris');
            return;
        }
        await toggleFavorite(id);
    };

    const handleSendMessage = async () => {
        if (!isAuthenticated) {
            navigate('/giris');
            return;
        }
        if (!messageText.trim()) return;

        setMessageSending(true);
        try {
            await sendMessage({
                receiverId: listing.seller.id,
                listingId: listing.id,
                content: messageText
            });
            setMessageSent(true);
            setMessageText('');
            setTimeout(() => {
                setShowMessageModal(false);
                setMessageSent(false);
            }, 2000);
        } catch (error) {
            console.error('Mesaj gönderilirken hata:', error);
        } finally {
            setMessageSending(false);
        }
    };

    const openMessageModal = () => {
        if (!isAuthenticated) {
            navigate('/giris');
            return;
        }
        setShowMessageModal(true);
        setMessageText(`Merhaba, "${listing.title}" ilanınız hakkında bilgi almak istiyorum.`);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>İlan yükleniyor...</p>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="not-found">
                <h2>İlan Bulunamadı</h2>
                <Link to="/" className="btn btn-primary">Ana Sayfaya Dön</Link>
            </div>
        );
    }

    // Google Maps URL oluştur
    const getMapUrl = () => {
        if (listing.latitude && listing.longitude) {
            return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${listing.latitude},${listing.longitude}&zoom=15`;
        }
        // Şehir ve ilçe ile arama
        const location = encodeURIComponent(`${listing.city}${listing.district ? ', ' + listing.district : ''}, Turkey`);
        return `https://www.google.com/maps?q=${location}&output=embed`;
    };

    return (
        <div className="listing-detail-page">
            <SEO
                title={listing.title}
                description={`Sahibinden ${listing.category} - ${listing.title} ilanını inceleyin. Fiyat: ${formatPrice(listing.price)}`}
            />
            <div className="container">
                {/* Breadcrumb */}
                <nav className="breadcrumb">
                    <Link to="/">Ana Sayfa</Link>
                    <span className="breadcrumb-separator">/</span>
                    <Link to={`/kategori/${listing.category?.toLowerCase().replace(/\s+/g, '-')}`}>
                        {listing.category}
                    </Link>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-current">{listing.title}</span>
                </nav>

                <div className="detail-layout">
                    {/* Left Column - Images & Description */}
                    <div className="detail-main">
                        {/* Image Gallery */}
                        <div className="gallery-section">
                            <ImageGallery images={listing.images} />
                        </div>

                        {/* Title & Meta (Mobile) */}
                        <div className="mobile-header">
                            <h1 className="listing-title">{listing.title}</h1>
                            <div className="listing-price-mobile">{formatPrice(listing.price)}</div>
                        </div>

                        {/* Description */}
                        <div className="description-section">
                            <h2>İlan Açıklaması</h2>
                            <div className="description-content">
                                {listing.description}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="details-section">
                            <h2>İlan Detayları</h2>
                            <div className="details-grid">
                                <div className="detail-item">
                                    <span className="detail-label">İlan No</span>
                                    <span className="detail-value">{listing.id}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Kategori</span>
                                    <span className="detail-value">{listing.category}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Alt Kategori</span>
                                    <span className="detail-value">{listing.subCategory}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Şehir</span>
                                    <span className="detail-value">{listing.city}</span>
                                </div>
                                {listing.district && (
                                    <div className="detail-item">
                                        <span className="detail-label">İlçe</span>
                                        <span className="detail-value">{listing.district}</span>
                                    </div>
                                )}
                                <div className="detail-item">
                                    <span className="detail-label">İlan Tarihi</span>
                                    <span className="detail-value">{formatDate(listing.createdAt)}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Görüntülenme</span>
                                    <span className="detail-value">{listing.views} kez</span>
                                </div>
                            </div>
                        </div>

                        {/* Location with Map */}
                        <div className="location-section">
                            <h2>📍 Konum</h2>
                            <div className="location-info">
                                <span className="location-icon">📍</span>
                                <span>{listing.city}{listing.district && `, ${listing.district}`}</span>
                            </div>
                            <div className="map-container">
                                <iframe
                                    title="Konum Haritası"
                                    src={getMapUrl()}
                                    width="100%"
                                    height="300"
                                    style={{ border: 0, borderRadius: '12px' }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Price & Seller */}
                    <div className="detail-sidebar">
                        {/* Price Card */}
                        <div className="price-card">
                            <div className="price-amount">{formatPrice(listing.price)}</div>

                            <div className="action-buttons">
                                <button
                                    className={`btn btn-favorite ${isFavorite ? 'is-favorite' : ''}`}
                                    onClick={handleFavorite}
                                >
                                    {isFavorite ? '❤️ Favorilerde' : '🤍 Favorilere Ekle'}
                                </button>
                                <button className="btn btn-share" onClick={handleShare}>
                                    {copied ? '✓ Kopyalandı' : '🔗 Paylaş'}
                                </button>
                            </div>
                        </div>

                        {/* Param Güvende Action */}
                        {listing.isSold ? (
                            <div className="escrow-action-area sold">
                                <div className="btn-buy-secure disabled">
                                    <span className="secure-icon">🚫</span>
                                    <div className="btn-content">
                                        <span className="btn-title">Bu Ürün Satıldı</span>
                                        <span className="btn-subtitle">Artık satın alınamaz</span>
                                    </div>
                                </div>
                            </div>
                        ) : isAuthenticated && listing.seller?.id !== user?.id && (
                            <div className="escrow-action-area">
                                <Link to={`/param-guvende/${listing.id}`} className="btn-buy-secure">
                                    <span className="secure-icon">🛡️</span>
                                    <div className="btn-content">
                                        <span className="btn-title">Param Güvende ile Satın Al</span>
                                        <span className="btn-subtitle">Ücretsiz iade ve güvenli ödeme</span>
                                    </div>
                                    <span className="btn-arrow">➔</span>
                                </Link>
                            </div>
                        )}

                        {/* Seller Card */}
                        <div className="seller-card">
                            <h3>Satıcı Bilgileri</h3>

                            <div className="seller-info">
                                <img
                                    src={listing.seller?.avatar || 'https://ui-avatars.com/api/?name=User'}
                                    alt={listing.seller?.name}
                                    className="seller-avatar"
                                />
                                <div className="seller-details">
                                    <span className="seller-name">{listing.seller?.name}</span>
                                    <span className="seller-since">
                                        Üyelik: {formatDate(listing.seller?.createdAt)}
                                    </span>
                                </div>
                            </div>

                            <div className="contact-buttons">
                                <button
                                    className="btn btn-primary btn-call"
                                    onClick={() => setShowPhone(!showPhone)}
                                >
                                    📞 {showPhone ? listing.seller?.phone : 'Telefonu Göster'}
                                </button>
                                <button
                                    className="btn btn-secondary btn-message"
                                    onClick={openMessageModal}
                                >
                                    💬 Mesaj Gönder
                                </button>
                            </div>

                            <div className="seller-warning">
                                <span>⚠️</span>
                                <p>Güvenliğiniz için ödemeyi yüz yüze yapın ve ürünü teslim almadan ödeme yapmayın.</p>
                            </div>
                        </div>

                        {/* Report */}
                        <button className="report-btn">
                            🚩 İlanı Şikayet Et
                        </button>
                    </div>
                </div>
            </div>

            {/* Message Modal */}
            {showMessageModal && (
                <div className="modal-overlay" onClick={() => setShowMessageModal(false)}>
                    <div className="message-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>💬 Satıcıya Mesaj Gönder</h3>
                            <button className="modal-close" onClick={() => setShowMessageModal(false)}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="message-listing-info">
                                <img src={listing.images?.[0]} alt="" />
                                <div>
                                    <strong>{listing.title}</strong>
                                    <span>{formatPrice(listing.price)}</span>
                                </div>
                            </div>

                            <div className="message-to">
                                <span>Alıcı:</span>
                                <img src={listing.seller?.avatar} alt="" />
                                <span>{listing.seller?.name}</span>
                            </div>

                            {messageSent ? (
                                <div className="message-success">
                                    ✅ Mesajınız başarıyla gönderildi!
                                </div>
                            ) : (
                                <>
                                    <textarea
                                        className="message-textarea"
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        placeholder="Mesajınızı yazın..."
                                        rows={5}
                                    />
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleSendMessage}
                                        disabled={messageSending || !messageText.trim()}
                                    >
                                        {messageSending ? 'Gönderiliyor...' : '📤 Mesaj Gönder'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListingDetailPage;
