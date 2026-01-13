import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCategories, getCities, getListing, updateListing } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './CreateListingPage.css';

const EditListingPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, loading: authLoading } = useAuth();

    const [categories, setCategories] = useState([]);
    const [cities, setCities] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        subCategory: '',
        city: '',
        district: '',
        images: []
    });

    const [imageUrls, setImageUrls] = useState(['', '', '', '', '']);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/giris');
        }
    }, [isAuthenticated, authLoading, navigate]);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [catRes, citiesRes, listingRes] = await Promise.all([
                getCategories(),
                getCities(),
                getListing(id)
            ]);

            setCategories(catRes.data);
            setCities(citiesRes.data);

            const listing = listingRes.data;

            // Check if user owns this listing
            if (String(listing.sellerId) !== String(user?.id)) {
                setError('Bu ilanı düzenleme yetkiniz yok');
                return;
            }

            if (listing.isSold) {
                setError('Satılmış ilanlar düzenlenemez');
                return;
            }

            setFormData({
                title: listing.title || '',
                description: listing.description || '',
                price: listing.price || '',
                category: listing.category || '',
                subCategory: listing.subCategory || '',
                city: listing.city || '',
                district: listing.district || '',
                images: listing.images || []
            });

            // Set image URLs
            const imgs = listing.images || [];
            setImageUrls([
                imgs[0] || '',
                imgs[1] || '',
                imgs[2] || '',
                imgs[3] || '',
                imgs[4] || ''
            ]);

        } catch (error) {
            console.error('Veri yüklenirken hata:', error);
            setError('İlan yüklenemedi');
        } finally {
            setLoading(false);
        }
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
    };

    const getSelectedCategory = () => {
        return categories.find(c => c.name === formData.category);
    };

    const getDistricts = () => {
        const city = cities.find(c => c.name === formData.city);
        return city?.districts || [];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (!formData.title || !formData.description || !formData.price ||
            !formData.category || !formData.city) {
            setError('Lütfen tüm zorunlu alanları doldurun');
            return;
        }

        setSubmitting(true);

        try {
            const validImages = imageUrls.filter(url => url.trim() !== '');

            await updateListing(id, {
                ...formData,
                price: parseFloat(formData.price),
                images: validImages
            });

            setSuccess('İlan başarıyla güncellendi!');
            setTimeout(() => {
                navigate('/profilim');
            }, 1500);
        } catch (error) {
            setError(error.response?.data?.message || 'İlan güncellenirken hata oluştu');
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="create-listing-page">
                <div className="container">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Yükleniyor...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !formData.title) {
        return (
            <div className="create-listing-page">
                <div className="container">
                    <div className="error-container">
                        <h2>❌ Hata</h2>
                        <p>{error}</p>
                        <button className="btn btn-primary" onClick={() => navigate('/profilim')}>
                            Profilime Dön
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="create-listing-page">
            <div className="container">
                <div className="page-header">
                    <h1>✏️ İlan Düzenle</h1>
                    <p>İlanınızın bilgilerini güncelleyin</p>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleSubmit} className="listing-form">
                    {/* Basic Info */}
                    <div className="form-section">
                        <h2>📝 Temel Bilgiler</h2>

                        <div className="form-group">
                            <label>İlan Başlığı *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Örn: 2020 Model BMW 320i"
                                maxLength={100}
                            />
                        </div>

                        <div className="form-group">
                            <label>Açıklama *</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Ürün veya hizmetinizi detaylı açıklayın..."
                                rows={6}
                            />
                        </div>

                        <div className="form-group">
                            <label>Fiyat (TL) *</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="0"
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div className="form-section">
                        <h2>📁 Kategori</h2>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Kategori *</label>
                                <select name="category" value={formData.category} onChange={handleChange}>
                                    <option value="">Seçiniz</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Alt Kategori</label>
                                <select
                                    name="subCategory"
                                    value={formData.subCategory}
                                    onChange={handleChange}
                                    disabled={!formData.category}
                                >
                                    <option value="">Seçiniz</option>
                                    {getSelectedCategory()?.subCategories?.map(sub => (
                                        <option key={sub} value={sub}>{sub}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="form-section">
                        <h2>📍 Konum</h2>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Şehir *</label>
                                <select name="city" value={formData.city} onChange={handleChange}>
                                    <option value="">Seçiniz</option>
                                    {cities.map(city => (
                                        <option key={city.name} value={city.name}>{city.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>İlçe</label>
                                <select
                                    name="district"
                                    value={formData.district}
                                    onChange={handleChange}
                                    disabled={!formData.city}
                                >
                                    <option value="">Seçiniz</option>
                                    {getDistricts().map(district => (
                                        <option key={district} value={district}>{district}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Images */}
                    <div className="form-section">
                        <h2>📷 Fotoğraflar</h2>
                        <p className="section-hint">Fotoğraf URL'lerini girin (en fazla 5 adet)</p>

                        <div className="image-inputs">
                            {imageUrls.map((url, index) => (
                                <div key={index} className="image-input-row">
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={(e) => handleImageUrlChange(index, e.target.value)}
                                        placeholder={`Fotoğraf ${index + 1} URL`}
                                    />
                                    {url && (
                                        <img
                                            src={url}
                                            alt={`Preview ${index + 1}`}
                                            className="image-preview"
                                            onError={(e) => e.target.style.display = 'none'}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate('/profilim')}
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting}
                        >
                            {submitting ? 'Güncelleniyor...' : '💾 Değişiklikleri Kaydet'}
                        </button>
                    </div>

                    <p className="form-note">
                        ⚠️ Not: İçerik değişiklikleri yaptığınızda ilanınız yeniden onaya gönderilecektir.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default EditListingPage;
