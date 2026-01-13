import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { register, loginWithGoogle, isAuthenticated } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    // Google Login Hook
    const startGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setLoading(true);
                // For register, we behave same as login: backend will create account if new
                await loginWithGoogle(tokenResponse.access_token);
                navigate('/');
            } catch (error) {
                console.error(error);
                setError('Google ile kayıt başarısız.');
            } finally {
                setLoading(false);
            }
        },
        onError: () => setError('Google ile kayıt penceresi kapandı veya hata oluştu.')
    });

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Şifreler eşleşmiyor.');
            return;
        }

        if (formData.password.length < 6) {
            setError('Şifre en az 6 karakter olmalıdır.');
            return;
        }

        setLoading(true);

        try {
            await register(formData.name, formData.email, formData.password, formData.phone);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Kayıt olurken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <Link to="/" className="auth-logo">
                            <span className="logo-icon">📦</span>
                            <span className="logo-text">İlanBul</span>
                        </Link>
                        <h1>Kayıt Ol</h1>
                        <p>Hemen ücretsiz hesap oluşturun</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {error && (
                            <div className="auth-error">
                                ⚠️ {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Ad Soyad</label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                placeholder="Ad Soyad"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">E-posta</label>
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                placeholder="ornek@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Telefon (Opsiyonel)</label>
                            <input
                                type="tel"
                                name="phone"
                                className="form-input"
                                placeholder="05XX XXX XX XX"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Şifre</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Şifre Tekrar</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="terms-check">
                            <label>
                                <input type="checkbox" required />
                                <span>
                                    <a href="#">Kullanım Koşulları</a> ve <a href="#">Gizlilik Politikası</a>'nı kabul ediyorum.
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={loading}
                        >
                            {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
                        </button>
                    </form>

                    <div className="auth-divider">
                        <span>veya</span>
                    </div>

                    <div className="social-buttons">
                        <button className="google-btn" type="button" onClick={() => startGoogleLogin()}>
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                            Google ile Kayıt Ol
                        </button>
                    </div>

                    <div className="auth-switch">
                        Zaten hesabınız var mı? <Link to="/giris">Giriş Yap</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
