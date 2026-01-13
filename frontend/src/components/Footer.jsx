import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    {/* Brand & Description */}
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo">
                            <span className="footer-logo-text">sahibinden.com</span>
                        </Link>
                        <p className="footer-description">
                            Sarı sitede aradığınız her şeyi bulabilirsiniz. Emlaktan vasıtaya, elektronikten modaya binlerce ilan.
                        </p>
                    </div>

                    {/* Corporate */}
                    <div className="footer-links">
                        <h4 className="footer-title">Kurumsal</h4>
                        <ul>
                            <li><a href="#">Hakkımızda</a></li>
                            <li><a href="#">İnsan Kaynakları</a></li>
                            <li><a href="#">Haberler</a></li>
                            <li><a href="#">İletişim</a></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div className="footer-links">
                        <h4 className="footer-title">Hizmetlerimiz</h4>
                        <ul>
                            <li><a href="#">Doping</a></li>
                            <li><a href="#">Güvenli E-Ticaret (GeT)</a></li>
                            <li><a href="#">Toplu Ürün Girişi</a></li>
                            <li><a href="#">Reklam</a></li>
                            <li><a href="#">Mobil</a></li>
                        </ul>
                    </div>

                    {/* Stores */}
                    <div className="footer-links">
                        <h4 className="footer-title">Mağazalar</h4>
                        <ul>
                            <li><a href="#">Mağazamı Açmak İstiyorum</a></li>
                            <li><a href="#">Neden Mağaza?</a></li>
                            <li><a href="#">Mağaza Fiyatları</a></li>
                        </ul>
                    </div>

                    {/* Privacy */}
                    <div className="footer-links">
                        <h4 className="footer-title">Gizlilik</h4>
                        <ul>
                            <li><a href="#">Kullanım Koşulları</a></li>
                            <li><a href="#">Gizlilik Politikası</a></li>
                            <li><a href="#">Çerez Yönetimi</a></li>
                            <li><a href="#">Yardım / SSS</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-middle">
                    <div className="footer-apps">
                        <span className="app-text">Mobil Uygulamamızı İndirin</span>
                        <div className="app-buttons">
                            <a href="#" className="app-btn apple">
                                <span className="app-icon"></span>
                                <div className="app-btn-text">
                                    <small>App Store'dan</small>
                                    <span>İndirin</span>
                                </div>
                            </a>
                            <a href="#" className="app-btn google">
                                <span className="app-icon">▶</span>
                                <div className="app-btn-text">
                                    <small>Google Play'den</small>
                                    <span>Edinin</span>
                                </div>
                            </a>
                            <a href="#" className="app-btn huawei">
                                <span className="app-icon">👜</span>
                                <div className="app-btn-text">
                                    <small>AppGallery ile</small>
                                    <span>Keşfedin</span>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© 2000-2024 sahibinden.com - Tüm hakları saklıdır.</p>
                    <div className="footer-social">
                        <a href="#" className="social-link">Facebook</a>
                        <a href="#" className="social-link">Twitter</a>
                        <a href="#" className="social-link">Instagram</a>
                        <a href="#" className="social-link">YouTube</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
