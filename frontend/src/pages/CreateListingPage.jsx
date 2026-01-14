import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCategories, getCities, createListing, checkListingEligibility, getPackages } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import MapComponent from '../components/MapComponent';
import './CreateListingPage.css';

const CreateListingPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, loading: authLoading } = useAuth();

    const [step, setStep] = useState(1);
    const [categories, setCategories] = useState([]);
    const [cities, setCities] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Subscription check
    const [eligibility, setEligibility] = useState(null);
    const [showPackageModal, setShowPackageModal] = useState(false);
    const [packages, setPackages] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        subCategory: '',
        city: '',
        district: '',
        images: [],
        latitude: null,
        longitude: null
    });

    const [imageUrls, setImageUrls] = useState(['', '', '', '', '']);
    const [gettingLocation, setGettingLocation] = useState(false);
    const [locationError, setLocationError] = useState('');

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/giris?redirect=/ilan-ver');
        }
    }, [isAuthenticated, authLoading, navigate]);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            checkEligibility();
        }
    }, [isAuthenticated]);

    const fetchData = async () => {
        try {
            const [catRes, citiesRes] = await Promise.all([
                getCategories(),
                getCities()
            ]);
            setCategories(catRes.data);
            setCities(citiesRes.data);
        } catch (error) {
            console.error('Veri yüklenirken hata:', error);
        }
    };

    const checkEligibility = async () => {
        try {
            const response = await checkListingEligibility();
            setEligibility(response.data);

            // If user can't post, fetch packages
            if (!response.data.canPost) {
                const pkgRes = await getPackages();
                setPackages(pkgRes.data);
                setShowPackageModal(true);
            }
        } catch (error) {
            console.error('Eligibility check error:', error);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0
        }).format(price);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'category') {
            setFormData(prev => ({ ...prev, subCategory: '' }));
        }
    };

    const handleImageUrlChange = (index, value) => {
        const newUrls = [...imageUrls];
        newUrls[index] = value;
        setImageUrls(newUrls);
        setFormData(prev => ({
            ...prev,
            images: newUrls.filter(url => url.trim() !== '')
        }));
    };

    const validateStep = () => {
        switch (step) {
            case 1:
                if (!formData.category || !formData.subCategory) {
                    setError('Lütfen kategori ve alt kategori seçin.');
                    return false;
                }
                break;
            case 2:
                if (!formData.title || formData.title.length < 10) {
                    setError('Başlık en az 10 karakter olmalıdır.');
                    return false;
                }
                if (!formData.description || formData.description.length < 30) {
                    setError('Açıklama en az 30 karakter olmalıdır.');
                    return false;
                }
                break;
            case 3:
                if (!formData.price || parseInt(formData.price) <= 0) {
                    setError('Geçerli bir fiyat girin.');
                    return false;
                }
                if (!formData.city) {
                    setError('Lütfen şehir seçin.');
                    return false;
                }
                break;
            default:
                break;
        }
        setError('');
        return true;
    };

    const nextStep = () => {
        if (validateStep()) {
            setStep(prev => Math.min(prev + 1, 4));
        }
    };

    const prevStep = () => {
        setStep(prev => Math.max(prev - 1, 1));
        setError('');
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setError('');

        try {
            await createListing(formData);
            navigate('/profil?tab=listings&success=true');
        } catch (error) {
            // Check if subscription is required
            if (error.response?.data?.requiresSubscription) {
                // Fetch packages and show modal
                try {
                    const pkgRes = await getPackages();
                    setPackages(pkgRes.data);
                    setEligibility({
                        currentListings: error.response.data.currentListings,
                        freeLimit: error.response.data.freeLimit
                    });
                    setShowPackageModal(true);
                } catch (e) {
                    // Fallback: redirect to payment page
                    navigate('/odeme');
                }
            } else {
                setError(error.response?.data?.message || 'İlan oluşturulurken bir hata oluştu.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const getCurrentLocation = () => {
        setGettingLocation(true);
        setLocationError('');

        if (!navigator.geolocation) {
            setLocationError('Tarayıcınız konum özelliğini desteklemiyor.');
            setGettingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData(prev => ({
                    ...prev,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }));
                setGettingLocation(false);
            },
            (error) => {
                let msg = 'Konum alınamadı.';
                if (error.code === 1) msg = 'Konum izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.';
                else if (error.code === 2) msg = 'Konum bilgisi alınamadı.';
                else if (error.code === 3) msg = 'Konum alma zaman aşımına uğradı.';
                setLocationError(msg);
                setGettingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const selectedCategory = categories.find(c => c.name === formData.category);

    if (authLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="create-listing-page">
            <div className="container">
                <div className="wizard-container">
                    {/* Progress Steps */}
                    <div className="wizard-progress">
                        {[1, 2, 3, 4].map(num => (
                            <div
                                key={num}
                                className={`progress-step ${step >= num ? 'active' : ''} ${step > num ? 'completed' : ''}`}
                            >
                                <div className="step-number">
                                    {step > num ? '✓' : num}
                                </div>
                                <span className="step-label">
                                    {num === 1 && 'Kategori'}
                                    {num === 2 && 'Detaylar'}
                                    {num === 3 && 'Fiyat & Konum'}
                                    {num === 4 && 'Görseller'}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Step Content */}
                    <div className="wizard-content">
                        {/* Step 1: Category */}
                        {step === 1 && (
                            <div className="step-content animate-slideUp">
                                <h2>Kategori Seçin</h2>
                                <p className="step-description">İlanınız için uygun kategoriyi seçin</p>

                                <div className="category-selection">
                                    <div className="form-group">
                                        <label className="form-label">Kategori</label>
                                        <div className="category-grid">
                                            {categories.map(cat => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    className={`category-option ${formData.category === cat.name ? 'selected' : ''}`}
                                                    onClick={() => handleChange({ target: { name: 'category', value: cat.name } })}
                                                >
                                                    <span className="cat-icon">{cat.icon}</span>
                                                    <span className="cat-name">{cat.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {selectedCategory && (
                                        <div className="form-group">
                                            <label className="form-label">Alt Kategori</label>
                                            <div className="subcategory-list">
                                                {selectedCategory.subCategories.map(sub => (
                                                    <button
                                                        key={sub}
                                                        type="button"
                                                        className={`subcategory-option ${formData.subCategory === sub ? 'selected' : ''}`}
                                                        onClick={() => handleChange({ target: { name: 'subCategory', value: sub } })}
                                                    >
                                                        {sub}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Details */}
                        {step === 2 && (
                            <div className="step-content animate-slideUp">
                                <h2>İlan Detayları</h2>
                                <p className="step-description">İlanınızı tanımlayan bilgileri girin</p>

                                <div className="form-group">
                                    <label className="form-label">İlan Başlığı *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        className="form-input"
                                        placeholder="Örn: 2020 Model BMW 320i - Hatasız Boyasız"
                                        value={formData.title}
                                        onChange={handleChange}
                                        maxLength={100}
                                    />
                                    <span className="char-count">{formData.title.length}/100</span>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">İlan Açıklaması *</label>
                                    <textarea
                                        name="description"
                                        className="form-textarea"
                                        placeholder="İlanınız hakkında detaylı bilgi verin. Ne kadar detaylı yazarsanız, alıcılar o kadar kolay karar verir."
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={8}
                                        maxLength={5000}
                                    />
                                    <span className="char-count">{formData.description.length}/5000</span>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Price & Location */}
                        {step === 3 && (
                            <div className="step-content animate-slideUp">
                                <h2>Fiyat & Konum</h2>
                                <p className="step-description">Fiyat ve konum bilgilerini girin</p>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Fiyat (₺) *</label>
                                        <input
                                            type="number"
                                            name="price"
                                            className="form-input"
                                            placeholder="0"
                                            value={formData.price}
                                            onChange={handleChange}
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Şehir *</label>
                                        <select
                                            name="city"
                                            className="form-select"
                                            value={formData.city}
                                            onChange={handleChange}
                                        >
                                            <option value="">Şehir Seçin</option>
                                            {cities.map(city => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">İlçe</label>
                                        <input
                                            type="text"
                                            name="district"
                                            className="form-input"
                                            placeholder="İlçe adı"
                                            value={formData.district}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Location Picker */}
                                <div className="location-picker">
                                    <label className="form-label">📍 Konum (Opsiyonel)</label>
                                    <p className="location-hint">
                                        İlanınıza harita konumu ekleyerek alıcıların sizi bulmasını kolaylaştırın.
                                    </p>

                                    <button
                                        type="button"
                                        className={`btn btn-location ${formData.latitude ? 'has-location' : ''}`}
                                        onClick={getCurrentLocation}
                                        disabled={gettingLocation}
                                    >
                                        {gettingLocation ? (
                                            <>🔄 Konum alınıyor...</>
                                        ) : formData.latitude ? (
                                            <>✅ Konum Eklendi</>
                                        ) : (
                                            <>📍 Mevcut Konumumu Ekle</>
                                        )}
                                    </button>

                                    {locationError && (
                                        <p className="location-error">⚠️ {locationError}</p>
                                    )}

                                    <div className="location-preview" style={{ height: '300px', marginTop: '15px' }}>
                                        <MapComponent
                                            position={formData.latitude && formData.longitude ? [formData.latitude, formData.longitude] : null}
                                            onLocationSelect={(latlng) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    latitude: latlng.lat,
                                                    longitude: latlng.lng
                                                }));
                                            }}
                                        />
                                    </div>
                                    <p className="field-info" style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                                        * Harita üzerinde tıklayarak konumunuzu tam olarak işaretleyebilirsiniz.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Images */}
                        {step === 4 && (
                            <div className="step-content animate-slideUp">
                                <h2>Görseller Ekleyin</h2>
                                <p className="step-description">İlanınız için görsel URL'leri ekleyin (en fazla 5 adet)</p>

                                <div className="image-inputs">
                                    {imageUrls.map((url, index) => (
                                        <div key={index} className="image-input-group">
                                            <label className="form-label">Görsel {index + 1} URL</label>
                                            <input
                                                type="url"
                                                className="form-input"
                                                placeholder="https://example.com/image.jpg"
                                                value={url}
                                                onChange={(e) => handleImageUrlChange(index, e.target.value)}
                                            />
                                            {url && (
                                                <div className="image-preview">
                                                    <img src={url} alt={`Önizleme ${index + 1}`} onError={(e) => e.target.style.display = 'none'} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="submit-info">
                                    <p>📋 İlanınız yayınlanmadan önce incelemeye alınacaktır.</p>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="error-message">
                                ⚠️ {error}
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="wizard-actions">
                            {step > 1 && (
                                <button type="button" className="btn btn-secondary" onClick={prevStep}>
                                    ← Geri
                                </button>
                            )}

                            {step < 4 ? (
                                <button type="button" className="btn btn-primary" onClick={nextStep}>
                                    İleri →
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Yayınlanıyor...' : '📝 İlanı Yayınla'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Package Selection Modal */}
            {showPackageModal && (
                <div className="modal-overlay">
                    <div className="package-modal">
                        <div className="modal-header">
                            <h2>📦 Paket Satın Alın</h2>
                            <button className="modal-close" onClick={() => navigate('/')}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="limit-warning">
                                <span>⚠️</span>
                                <div>
                                    <strong>Ücretsiz ilan limitiniz doldu!</strong>
                                    <p>Şu ana kadar {eligibility?.currentListings} ilan verdiniz. Ücretsiz kullanıcılar en fazla {eligibility?.freeLimit} ilan verebilir.</p>
                                </div>
                            </div>

                            <p className="modal-subtitle">Sınırsız ilan vermek için bir paket seçin:</p>

                            <div className="modal-packages">
                                {packages.map(pkg => (
                                    <div key={pkg.id} className={`modal-package-card ${pkg.id === 'quarterly' ? 'popular' : ''}`}>
                                        {pkg.id === 'quarterly' && <span className="popular-tag">En Popüler</span>}
                                        <h4>{pkg.name}</h4>
                                        <div className="pkg-price">{formatPrice(pkg.price)}</div>
                                        <p>{pkg.description}</p>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => navigate(`/odeme?package=${pkg.id}`)}
                                        >
                                            Seç ve Öde
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateListingPage;

