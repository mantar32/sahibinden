import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getListing, createEscrow, payEscrow, getEscrow, getWallet } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './EscrowPage.css';

const EscrowPage = () => {
    const { id: listingId, escrowId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const [listing, setListing] = useState(null);
    const [escrow, setEscrow] = useState(null);
    const [step, setStep] = useState(1); // 1: Info, 2: Payment, 3: Success
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    const [cardData, setCardData] = useState({
        cardNumber: '',
        cardName: '',
        expiry: '',
        cvv: ''
    });

    const [walletBalance, setWalletBalance] = useState(0);
    const [savedCards, setSavedCards] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('card');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/giris');
            return;
        }

        if (escrowId) {
            fetchEscrow();
        } else if (listingId) {
            fetchListing();
        }

        if (isAuthenticated) {
            fetchWalletInfo();
        }
    }, [listingId, escrowId, isAuthenticated]);

    const fetchWalletInfo = async () => {
        try {
            const response = await getWallet();
            setWalletBalance(response.data.balance);
            setSavedCards(response.data.savedCards || []);
        } catch (error) {
            console.error('Cüzdan bilgisi alınamadı:', error);
        }
    };

    const fetchListing = async () => {
        try {
            const response = await getListing(listingId);
            setListing(response.data);

            if (response.data.seller?.id === user?.id) {
                setError('Kendi ilanınızı satın alamazsınız.');
            }
        } catch (error) {
            setError('İlan bulunamadı.');
        } finally {
            setLoading(false);
        }
    };

    const fetchEscrow = async () => {
        try {
            const response = await getEscrow(escrowId);
            setEscrow(response.data);
            setListing({
                id: response.data.listingId,
                title: response.data.listingTitle,
                images: [response.data.listingImage],
                price: response.data.amount
            });

            if (response.data.status === 'pending_payment') {
                setStep(2);
            } else {
                setStep(3);
            }
        } catch (error) {
            setError('İşlem bulunamadı.');
        } finally {
            setLoading(false);
        }
    };

    const handleStartEscrow = async () => {
        setProcessing(true);
        setError('');

        try {
            const response = await createEscrow(listingId);
            setEscrow(response.data);
            setStep(2);
        } catch (error) {
            if (error.response?.data?.escrowId) {
                // Already has an escrow, fetch it
                navigate(`/param-guvende/islem/${error.response.data.escrowId}`);
            } else {
                setError(error.response?.data?.message || 'İşlem başlatılamadı.');
            }
        } finally {
            setProcessing(false);
        }
    };

    const handleCardChange = (e) => {
        let { name, value } = e.target;

        if (name === 'cardNumber') {
            value = value.replace(/\D/g, '').slice(0, 16);
            value = value.replace(/(.{4})/g, '$1 ').trim();
        }
        if (name === 'expiry') {
            value = value.replace(/\D/g, '').slice(0, 4);
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2);
            }
        }
        if (name === 'cvv') {
            value = value.replace(/\D/g, '').slice(0, 4);
        }

        setCardData(prev => ({ ...prev, [name]: value }));
    };

    const handlePayment = async (e) => {
        if (e) e.preventDefault();
        setProcessing(true);
        setError('');

        if (paymentMethod === 'card' && cardData.cardNumber.replace(/\s/g, '').length < 16) {
            setError('Geçerli bir kart numarası girin.');
            setProcessing(false);
            return;
        }

        try {
            let paymentData = { paymentMethod };

            if (paymentMethod === 'savedCard' && selectedCard !== null) {
                const card = savedCards[selectedCard];
                paymentData = {
                    paymentMethod: 'card',
                    cardNumber: card.cardNumberMasked.replace(/\*/g, '0'), // Masked number placeholder
                    cardName: card.holderName,
                    expiry: '12/99', // Placeholder
                    cvv: '000', // Placeholder
                    useSavedCard: true,
                    savedCardIndex: selectedCard
                };
            } else if (paymentMethod === 'card') {
                paymentData = {
                    paymentMethod: 'card',
                    cardNumber: cardData.cardNumber.replace(/\s/g, ''),
                    cardName: cardData.cardName,
                    expiry: cardData.expiry,
                    cvv: cardData.cvv
                };
            }

            await payEscrow(escrow.id, paymentData);
            setStep(3);
        } catch (error) {
            setError(error.response?.data?.message || 'Ödeme işlemi başarısız.');
        } finally {
            setProcessing(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('tr-TR').format(price) + ' TL';
    };

    if (loading) {
        return (
            <div className="escrow-page">
                <div className="container">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Yükleniyor...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !listing) {
        return (
            <div className="escrow-page">
                <div className="container">
                    <div className="error-container">
                        <span className="error-icon">⚠️</span>
                        <h2>{error}</h2>
                        <Link to="/" className="btn btn-primary">Ana Sayfaya Dön</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="escrow-page">
            <div className="container">
                <div className="escrow-header">
                    <h1>🛡️ Param Güvende</h1>
                    <p>Güvenli ve kolay alışveriş</p>
                </div>

                {/* Progress Steps */}
                <div className="progress-steps">
                    <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                        <span className="step-number">1</span>
                        <span className="step-label">Bilgi</span>
                    </div>
                    <div className="progress-line"></div>
                    <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                        <span className="step-number">2</span>
                        <span className="step-label">Ödeme</span>
                    </div>
                    <div className="progress-line"></div>
                    <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
                        <span className="step-number">3</span>
                        <span className="step-label">Tamamlandı</span>
                    </div>
                </div>

                <div className="escrow-content">
                    {/* Listing Summary */}
                    <div className="listing-summary">
                        {listing?.images?.[0] && (
                            <img
                                src={listing.images[0]}
                                alt={listing.title}
                                className="summary-image"
                            />
                        )}
                        <div className="summary-info">
                            <h3>{listing?.title}</h3>
                            <div className="summary-price">{formatPrice(listing?.price)}</div>
                        </div>
                    </div>

                    {/* Step 1: Info */}
                    {step === 1 && (
                        <div className="step-content">
                            <div className="info-card">
                                <h2>Param Güvende Nasıl Çalışır?</h2>

                                <div className="info-steps">
                                    <div className="info-step">
                                        <span className="info-icon">💳</span>
                                        <div>
                                            <h4>1. Ödeme Yapın</h4>
                                            <p>Güvenli ödeme yapın, paranız platformda güvende tutulur.</p>
                                        </div>
                                    </div>
                                    <div className="info-step">
                                        <span className="info-icon">📦</span>
                                        <div>
                                            <h4>2. Ürün Kargoya Verilir</h4>
                                            <p>Satıcı ürünü kargoya verir, takip numarası size iletilir.</p>
                                        </div>
                                    </div>
                                    <div className="info-step">
                                        <span className="info-icon">✅</span>
                                        <div>
                                            <h4>3. Teslim Onayı</h4>
                                            <p>Ürünü aldığınızda onaylayın, para satıcıya aktarılır.</p>
                                        </div>
                                    </div>
                                    <div className="info-step">
                                        <span className="info-icon">🔄</span>
                                        <div>
                                            <h4>Sorun Olursa?</h4>
                                            <p>Problem yaşarsanız paranız size iade edilir.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="price-breakdown">
                                    <div className="price-row">
                                        <span>Ürün Fiyatı</span>
                                        <span>{formatPrice(listing?.price)}</span>
                                    </div>
                                    <div className="price-row">
                                        <span>Hizmet Bedeli (%3)</span>
                                        <span>{formatPrice(Math.round(listing?.price * 0.03))}</span>
                                    </div>
                                    <div className="price-row total">
                                        <span>Toplam</span>
                                        <span>{formatPrice(listing?.price + Math.round(listing?.price * 0.03))}</span>
                                    </div>
                                </div>

                                {error && <div className="error-message">{error}</div>}

                                <button
                                    className="btn btn-escrow-start"
                                    onClick={handleStartEscrow}
                                    disabled={processing || listing?.seller?.id === user?.id}
                                >
                                    {processing ? 'İşleniyor...' : '🛡️ Param Güvende ile Devam Et'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Payment */}
                    {step === 2 && escrow && (
                        <div className="step-content">
                            <div className="payment-card">
                                <h2>💳 Ödeme Bilgileri</h2>

                                <div className="payment-summary">
                                    <div className="payment-row">
                                        <span>Ödenecek Tutar</span>
                                        <span className="payment-amount">{formatPrice(escrow.totalAmount)}</span>
                                    </div>
                                </div>

                                <div className="payment-methods">
                                    {/* Saved Cards */}
                                    {savedCards.length > 0 && (
                                        <>
                                            <div className="saved-cards-header">
                                                <h4>💳 Kayıtlı Kartlarınız</h4>
                                            </div>
                                            {savedCards.map((card, index) => (
                                                <label
                                                    key={index}
                                                    className={`method-option saved-card ${paymentMethod === 'savedCard' && selectedCard === index ? 'selected' : ''}`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="method"
                                                        value="savedCard"
                                                        checked={paymentMethod === 'savedCard' && selectedCard === index}
                                                        onChange={() => {
                                                            setPaymentMethod('savedCard');
                                                            setSelectedCard(index);
                                                        }}
                                                    />
                                                    <div className="saved-card-info">
                                                        <span className="card-icon">💳</span>
                                                        <div>
                                                            <span className="card-number">{card.cardNumberMasked}</span>
                                                            <small className="card-name">{card.holderName}</small>
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                            <div className="divider-or">
                                                <span>veya</span>
                                            </div>
                                        </>
                                    )}

                                    <label className={`method-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="method"
                                            value="card"
                                            checked={paymentMethod === 'card'}
                                            onChange={() => {
                                                setPaymentMethod('card');
                                                setSelectedCard(null);
                                            }}
                                        />
                                        <span>💳 Yeni Kart ile Öde</span>
                                    </label>

                                    <label className={`method-option ${paymentMethod === 'wallet' ? 'selected' : ''} ${walletBalance < escrow.totalAmount ? 'disabled' : ''}`}>
                                        <input
                                            type="radio"
                                            name="method"
                                            value="wallet"
                                            checked={paymentMethod === 'wallet'}
                                            onChange={() => {
                                                setPaymentMethod('wallet');
                                                setSelectedCard(null);
                                            }}
                                            disabled={walletBalance < escrow.totalAmount}
                                        />
                                        <div className="wallet-option-content">
                                            <span>💰 Cüzdan Bakiyesi ile Öde</span>
                                            <small>Mevcut Bakiyeniz: {formatPrice(walletBalance)}</small>
                                        </div>
                                    </label>
                                    {walletBalance < escrow.totalAmount && (
                                        <small style={{ color: '#ef4444', textAlign: 'center' }}>Bakiye yetersiz. Lütfen önce cüzdanınıza para yükleyin.</small>
                                    )}
                                </div>

                                {paymentMethod === 'card' ? (
                                    <form onSubmit={handlePayment} className="payment-form">
                                        <div className="form-group">
                                            <label>Kart Numarası</label>
                                            <input
                                                type="text"
                                                name="cardNumber"
                                                value={cardData.cardNumber}
                                                onChange={handleCardChange}
                                                placeholder="1234 5678 9012 3456"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Kart Üzerindeki İsim</label>
                                            <input
                                                type="text"
                                                name="cardName"
                                                value={cardData.cardName}
                                                onChange={handleCardChange}
                                                placeholder="AD SOYAD"
                                                required
                                            />
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Son Kullanma</label>
                                                <input
                                                    type="text"
                                                    name="expiry"
                                                    value={cardData.expiry}
                                                    onChange={handleCardChange}
                                                    placeholder="AA/YY"
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>CVV</label>
                                                <input
                                                    type="text"
                                                    name="cvv"
                                                    value={cardData.cvv}
                                                    onChange={handleCardChange}
                                                    placeholder="123"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {error && <div className="error-message">{error}</div>}

                                        <div className="security-note">
                                            <span>🔒</span> Ödemeniz güvende. SSL ile şifrelenir.
                                        </div>

                                        <button
                                            type="submit"
                                            className="btn btn-pay"
                                            disabled={processing}
                                        >
                                            {processing ? 'Ödeme Yapılıyor...' : `${formatPrice(escrow.totalAmount)} Öde`}
                                        </button>
                                    </form>
                                ) : paymentMethod === 'savedCard' && selectedCard !== null ? (
                                    <div className="saved-card-payment-confirm">
                                        <div className="selected-card-display">
                                            <span className="card-icon-large">💳</span>
                                            <div>
                                                <p><strong>{savedCards[selectedCard]?.cardNumberMasked}</strong></p>
                                                <small>{savedCards[selectedCard]?.holderName}</small>
                                            </div>
                                        </div>
                                        <p style={{ textAlign: 'center', marginBottom: '16px', color: '#374151' }}>
                                            Kayıtlı kartınızdan <b>{formatPrice(escrow.totalAmount)}</b> tahsil edilecektir.
                                        </p>
                                        {error && <div className="error-message" style={{ marginBottom: '16px' }}>{error}</div>}
                                        <button
                                            onClick={handlePayment}
                                            className="btn btn-pay"
                                            disabled={processing}
                                        >
                                            {processing ? 'Ödeme Yapılıyor...' : 'Kayıtlı Kart ile Öde'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="wallet-payment-confirm">
                                        <p style={{ textAlign: 'center', marginBottom: '16px', color: '#374151' }}>
                                            Cüzdan bakiyenizden <b>{formatPrice(escrow.totalAmount)}</b> tahsil edilecektir.
                                        </p>
                                        {error && <div className="error-message" style={{ marginBottom: '16px' }}>{error}</div>}
                                        <button
                                            onClick={handlePayment}
                                            className="btn btn-pay"
                                            disabled={processing}
                                        >
                                            {processing ? 'Ödeme Yapılıyor...' : 'Cüzdan ile Öde ve Tamamla'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Success */}
                    {step === 3 && (
                        <div className="step-content">
                            <div className="success-card">
                                <span className="success-icon">✅</span>
                                <h2>Ödeme Başarılı!</h2>
                                <p>Paranız güvende tutulacak. Satıcı bilgilendirildi ve ürünü kargoya vermesi bekleniyor.</p>

                                <div className="next-steps">
                                    <h3>Sonraki Adımlar</h3>
                                    <div className="next-step">
                                        <span>1️⃣</span>
                                        <span>Satıcı ürünü kargoya verecek</span>
                                    </div>
                                    <div className="next-step">
                                        <span>2️⃣</span>
                                        <span>Kargo takip numarası size mesaj olarak gelecek</span>
                                    </div>
                                    <div className="next-step">
                                        <span>3️⃣</span>
                                        <span>Ürünü aldığınızda onaylayın</span>
                                    </div>
                                </div>

                                <div className="success-actions">
                                    <Link to="/mesajlar" className="btn btn-primary">
                                        📬 Mesajlarıma Git
                                    </Link>
                                    <Link to="/" className="btn btn-secondary">
                                        Ana Sayfaya Dön
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EscrowPage;
