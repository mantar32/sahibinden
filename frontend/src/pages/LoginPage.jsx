import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const LoginPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login, isAuthenticated } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [rememberMe, setRememberMe] = useState(true);

    const redirect = searchParams.get('redirect') || '/';

    React.useEffect(() => {
        if (isAuthenticated) {
            navigate(redirect);
        }
    }, [isAuthenticated, navigate, redirect]);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(formData.email, formData.password, rememberMe);
            navigate(redirect);
        } catch (err) {
            setError(err.response?.data?.message || 'Giriş yapılırken bir hata oluştu.');
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
                        <h1>Giriş Yap</h1>
                        <p>Hesabınıza giriş yapın ve ilanlara göz atın</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {error && (
                            <div className="auth-error">
                                ⚠️ {error}
                            </div>
                        )}

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
                                autoComplete="username"
                            />
                        </div>

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
                                autoComplete="current-password"
                            />
                        </div>

                        <div className="form-footer">
                            <label className="remember-me">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span>Beni hatırla</span>
                            </label>
                            <a href="#" className="forgot-link">Şifremi unuttum</a>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={loading}
                        >
                            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                        </button>
                    </form>



                    <div className="auth-switch">
                        Hesabınız yok mu? <Link to="/kayit">Kayıt Ol</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
