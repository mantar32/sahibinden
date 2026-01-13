import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPackages, createPayment, completePayment } from '../utils/api';
import './PaymentPage.css';

const PaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, loading: authLoading } = useAuth();

    const [step, setStep] = useState(1); // 1: packages, 2: payment form
    const [packages, setPackages] = useState([]);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [paymentId, setPaymentId] = useState(null);
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
            navigate('/giris?redirect=/odeme');
        }
    }, [isAuthenticated, authLoading, navigate]);

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const response = await getPackages();
            setPackages(response.data);

            // Check if package was pre-selected
            const params = new URLSearchParams(location.search);
            const preselected = params.get('package');
            if (preselected) {
                const pkg = response.data.find(p => p.id === preselected);
                if (pkg) {
                    setSelectedPackage(pkg);
                }
            }
        } catch (error) {
            console.error('Paketler yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPackage = async (pkg) => {
        setSelectedPackage(pkg);
        setError('');

        try {
            const response = await createPayment(pkg.id);
            setPaymentId(response.data.paymentId);
            setStep(2);
        } catch (error) {
            setError('Ödeme başlatılırken bir hata oluştu.');
        }
    };

    const handleCardChange = (e) => {
        let { name, value } = e.target;

        // Format card number with spaces
        if (name === 'cardNumber') {
            value = value.replace(/\D/g, '').substring(0, 16);
            value = value.replace(/(\d{4})/g, '$1 ').trim();
        }

        // Format expiry
        if (name === 'expiry') {
            value = value.replace(/\D/g, '').substring(0, 4);
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2);
            }
        }

        // Format CVV
        if (name === 'cvv') {
            value = value.replace(/\D/g, '').substring(0, 3);
        }

        setCardData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitPayment = async (e) => {
        e.preventDefault();
        setError('');
        setProcessing(true);

        // Validate
        if (cardData.cardNumber.replace(/\s/g, '').length < 16) {
            setError('Geçerli bir kart numarası girin.');
            setProcessing(false);
            return;
        }

        try {
            await completePayment(paymentId, {
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
            <div className="payment-page">
                <div className="container">
                    <div className="success-card">
                        <div className="success-icon">✅</div>
                        <h2>Ödeme Başarılı!</h2>
                        <p>
                            <strong>{selectedPackage.name}</strong> aboneliğiniz aktifleştirildi.
                        </p>
                        <p>Artık sınırsız ilan verebilirsiniz.</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/ilan-ver')}
                        >
                            📝 İlan Ver
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-page">
            <div className="container">
                <div className="payment-header">
                    <h1>💳 Paket Satın Al</h1>
                    <p>Sınırsız ilan vermek için bir paket seçin</p>
                </div>

                {step === 1 && (
                    <div className="packages-grid">
                        {packages.map(pkg => (
                            <div
                                key={pkg.id}
                                className={`package-card ${selectedPackage?.id === pkg.id ? 'selected' : ''} ${pkg.id === 'quarterly' ? 'popular' : ''}`}
                            >
                                {pkg.id === 'quarterly' && (
                                    <div className="popular-badge">En Popüler</div>
                                )}
                                <h3>{pkg.name}</h3>
                                <div className="package-price">{formatPrice(pkg.price)}</div>
                                <p className="package-desc">{pkg.description}</p>

                                <ul className="package-features">
                                    {pkg.features.map((feature, i) => (
                                        <li key={i}>✓ {feature}</li>
                                    ))}
                                </ul>

                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleSelectPackage(pkg)}
                                >
                                    Seçin
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {step === 2 && selectedPackage && (
                    <div className="payment-form-container">
                        <div className="order-summary">
                            <h3>Sipariş Özeti</h3>
                            <div className="summary-item">
                                <span>{selectedPackage.name}</span>
                                <span>{formatPrice(selectedPackage.price)}</span>
                            </div>
                            <div className="summary-total">
                                <span>Toplam</span>
                                <span>{formatPrice(selectedPackage.price)}</span>
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
                                    {processing ? 'İşleniyor...' : `${formatPrice(selectedPackage.price)} Öde`}
                                </button>
                            </div>

                            <p className="secure-notice">
                                🔒 Güvenli ödeme. Bilgileriniz şifrelenerek korunur.
                            </p>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentPage;
