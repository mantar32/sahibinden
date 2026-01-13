import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getListing, getFeaturedPrices, promoteListing, completeFeaturedPayment } from '../utils/api';
import './PromoteListingPage.css';

const PromoteListingPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, loading: authLoading } = useAuth();

    const [listing, setListing] = useState(null);
    const [prices, setPrices] = useState([]);
    const [selectedDays, setSelectedDays] = useState(null);
    const [paymentId, setPaymentId] = useState(null);
    const [step, setStep] = useState(1); // 1: select, 2: payment
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [cardData, setCardData] = useState({
        cardNumber: '',
        cardName: '',
        expiry: '',
        cvv: ''
    });

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/giris');
        }
    }, [isAuthenticated, authLoading, navigate]);

    useEffect(() => {
        if (id && isAuthenticated) {
            fetchData();
        }
    }, [id, isAuthenticated]);

    const fetchData = async () => {
        try {
            const [listingRes, pricesRes] = await Promise.all([
                getListing(id),
                getFeaturedPrices()
            ]);
            setListing(listingRes.data);
            setPrices(pricesRes.data);
        } catch (error) {
            console.error('Veri yüklenirken hata:', error);
            setError('İlan bulunamadı.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlan = async (days) => {
        setSelectedDays(days);
        setError('');
        setProcessing(true);

        try {
            const response = await promoteListing(id, days);
            setPaymentId(response.data.paymentId);
            setStep(2);
        } catch (error) {
            setError(error.response?.data?.message || 'Bir hata oluştu.');
        } finally {
            setProcessing(false);
        }
    };

    const handleCardChange = (e) => {
        let { name, value } = e.target;

        if (name === 'cardNumber') {
            value = value.replace(/\D/g, '').substring(0, 16);
            value = value.replace(/(\d{4})/g, '$1 ').trim();
        }

        if (name === 'expiry') {
            value = value.replace(/\D/g, '').substring(0, 4);
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2);
            }
        }

        if (name === 'cvv') {
            value = value.replace(/\D/g, '').substring(0, 3);
        }

        setCardData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitPayment = async (e) => {
        e.preventDefault();
        setError('');
        setProcessing(true);

        if (cardData.cardNumber.replace(/\s/g, '').length < 16) {
            setError('Geçerli bir kart numarası girin.');
            setProcessing(false);
            return;
        }

        try {
            await completeFeaturedPayment(paymentId, {
                cardNumber: cardData.cardNumber.replace(/\s/g, ''),
                cardName: cardData.cardName,
                expiry: cardData.expiry,
                cvv: cardData.cvv
            });
            setSuccess(true);
        } catch (error) {
            setError(error.response?.data?.message || 'Ödeme işlemi başarısız.');
        } finally {
            setProcessing(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0
        }).format(price);
    };

    if (authLoading || loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="promote-page">
                <div className="container">
                    <div className="success-card">
                        <div className="success-icon">⭐</div>
                        <h2>İlanınız Vitrine Çıkarıldı!</h2>
                        <p><strong>{listing?.title}</strong></p>
                        <p>İlanınız {selectedDays} gün boyunca vitrin bölümünde gösterilecek.</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/profil?tab=listings')}
                        >
                            İlanlarıma Dön
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="promote-page">
            <div className="container">
                <div className="promote-header">
                    <h1>⭐ İlanı Vitrine Çıkar</h1>
                    <p>İlanınızı öne çıkararak daha fazla görüntülenme alın</p>
                </div>

                {listing && (
                    <div className="listing-preview">
                        <img
                            src={listing.images?.[0] || 'https://via.placeholder.com/100'}
                            alt={listing.title}
                        />
                        <div className="preview-info">
                            <h3>{listing.title}</h3>
                            <p>{listing.city} • {formatPrice(listing.price)}</p>
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <div className="plans-section">
                        <h2>Vitrin Süresini Seçin</h2>
                        <div className="plans-grid">
                            {prices.map(plan => (
                                <div
                                    key={plan.days}
                                    className={`plan-card ${plan.popular ? 'popular' : ''}`}
                                >
                                    {plan.popular && <span className="popular-badge">En Popüler</span>}
                                    <h3>{plan.description}</h3>
                                    <div className="plan-price">{formatPrice(plan.price)}</div>
                                    <div className="plan-per-day">
                                        Günlük {formatPrice(plan.price / plan.days)}
                                    </div>
                                    <ul className="plan-features">
                                        <li>✓ Ana sayfada vitrin bölümü</li>
                                        <li>✓ Arama sonuçlarında öncelik</li>
                                        <li>✓ Özel vitrin rozeti</li>
                                        <li>✓ {plan.days} gün geçerlilik</li>
                                    </ul>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleSelectPlan(plan.days)}
                                        disabled={processing}
                                    >
                                        {processing ? 'Yükleniyor...' : 'Seç ve Öde'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="payment-section">
                        <div className="payment-summary">
                            <h3>Sipariş Özeti</h3>
                            <div className="summary-row">
                                <span>Vitrin İlanı ({selectedDays} gün)</span>
                                <span>{formatPrice(prices.find(p => p.days === selectedDays)?.price || 0)}</span>
                            </div>
                        </div>

                        <form className="payment-form" onSubmit={handleSubmitPayment}>
                            <h3>💳 Kart Bilgileri</h3>

                            <div className="form-group">
                                <label>Kart Numarası</label>
                                <input
                                    type="text"
                                    name="cardNumber"
                                    placeholder="1234 5678 9012 3456"
                                    value={cardData.cardNumber}
                                    onChange={handleCardChange}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Kart Üzerindeki İsim</label>
                                <input
                                    type="text"
                                    name="cardName"
                                    placeholder="AHMET YILMAZ"
                                    value={cardData.cardName}
                                    onChange={handleCardChange}
                                    className="form-input"
                                    style={{ textTransform: 'uppercase' }}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Son Kullanma</label>
                                    <input
                                        type="text"
                                        name="expiry"
                                        placeholder="MM/YY"
                                        value={cardData.expiry}
                                        onChange={handleCardChange}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>CVV</label>
                                    <input
                                        type="text"
                                        name="cvv"
                                        placeholder="123"
                                        value={cardData.cvv}
                                        onChange={handleCardChange}
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            {error && <div className="error-message">⚠️ {error}</div>}

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setStep(1)}
                                >
                                    ← Geri
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={processing}
                                >
                                    {processing ? 'İşleniyor...' : 'Ödemeyi Tamamla'}
                                </button>
                            </div>

                            <p className="secure-notice">
                                🔒 Güvenli ödeme. Bilgileriniz şifrelenerek korunur.
                            </p>
                        </form>
                    </div>
                )}

                {error && step === 1 && (
                    <div className="error-message">⚠️ {error}</div>
                )}
            </div>
        </div>
    );
};

export default PromoteListingPage;
