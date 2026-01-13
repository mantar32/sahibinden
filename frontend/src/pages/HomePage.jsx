import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, getListings } from '../utils/api';
import './HomePage.css';

const HomePage = () => {
    const [categories, setCategories] = useState([]);
    const [featuredListings, setFeaturedListings] = useState([]);
    const [recentListings, setRecentListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [catRes, listingsRes] = await Promise.all([
                getCategories(),
                getListings({ status: 'approved', limit: 50 })
            ]);
            setCategories(catRes.data);

            const allListings = listingsRes.data.listings || listingsRes.data;
            setFeaturedListings(allListings.filter(l => l.isFeatured).slice(0, 12));
            setRecentListings(allListings.slice(0, 20));
        } catch (error) {
            console.error('Veri yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('tr-TR').format(price) + ' TL';
    };

    const formatCount = (count) => {
        return new Intl.NumberFormat('tr-TR').format(count);
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

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="home-page sahibinden-style">
            {/* Top Banner */}
            <div className="top-banner">
                <div className="container banner-content">
                    <div className="banner-text">
                        <h2>Yeni İlan Fırsatları!</h2>
                        <p>Binlerce ilan arasından size en uygun olanı bulun</p>
                    </div>
                    <Link to="/ilan-ver" className="banner-btn">
                        Hemen İlan Ver
                    </Link>
                </div>
            </div>

            <div className="container main-layout">
                {/* Left Sidebar - Categories */}
                <aside className="sidebar">
                    {categories.map(category => (
                        <div key={category.id} className="sidebar-category">
                            {/* Main Category Header */}
                            <div className="category-header">
                                <span className="category-icon">{category.icon}</span>
                                <Link
                                    to={`/kategori/${category.slug}`}
                                    className="category-name main-category"
                                >
                                    {category.name}
                                </Link>
                                <span className="category-count">
                                    ({formatCount(category.count || 0)})
                                </span>
                            </div>

                            {/* Subcategories - Always visible as flat list */}
                            {category.subCategories && category.subCategories.length > 0 && (
                                <ul className="subcategory-list">
                                    {category.subCategories.map((sub, idx) => (
                                        <li key={idx}>
                                            <Link to={`/kategori/${category.slug}?sub=${encodeURIComponent(sub.name || sub)}`}>
                                                {sub.name || sub}
                                            </Link>
                                            {sub.count !== undefined && (
                                                <span className="sub-count">({formatCount(sub.count)})</span>
                                            )}
                                        </li>
                                    ))}
                                    {category.subCategories.length > 8 && (
                                        <li className="show-all">
                                            <Link to={`/kategori/${category.slug}`}>
                                                Tümünü Göster ▼
                                            </Link>
                                        </li>
                                    )}
                                </ul>
                            )}
                        </div>
                    ))}
                </aside>

                {/* Main Content */}
                <main className="main-content">
                    {/* Vitrin Section */}
                    <section className="vitrin-section">
                        <div className="section-header">
                            <h2>Anasayfa Vitrini</h2>
                            <Link to="/kategori/tum-ilanlar" className="view-all">
                                Tüm vitrin ilanlarını göster
                            </Link>
                        </div>

                        <div className="vitrin-grid">
                            {featuredListings.length > 0 ? (
                                featuredListings.map(listing => (
                                    <Link
                                        key={listing.id}
                                        to={`/ilan/${listing.id}/${createSlug(listing.title)}`}
                                        className="vitrin-item"
                                    >
                                        <div className="vitrin-image">
                                            <img
                                                src={listing.images?.[0] || 'https://via.placeholder.com/120x90?text=Görsel'}
                                                alt={listing.title}
                                                loading="lazy"
                                            />
                                        </div>
                                        <div className="vitrin-info">
                                            <span className="vitrin-title">{listing.title}</span>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                recentListings.slice(0, 12).map(listing => (
                                    <Link
                                        key={listing.id}
                                        to={`/ilan/${listing.id}/${createSlug(listing.title)}`}
                                        className="vitrin-item"
                                    >
                                        <div className="vitrin-image">
                                            <img
                                                src={listing.images?.[0] || 'https://via.placeholder.com/120x90?text=Görsel'}
                                                alt={listing.title}
                                                loading="lazy"
                                            />
                                        </div>
                                        <div className="vitrin-info">
                                            <span className="vitrin-title">{listing.title}</span>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </section>

                    {/* Recent Listings Table */}
                    <section className="recent-section">
                        <div className="section-header">
                            <h2>Son Eklenen İlanlar</h2>
                        </div>

                        <div className="listings-table">
                            {recentListings.map(listing => (
                                <Link
                                    key={listing.id}
                                    to={`/ilan/${listing.id}/${createSlug(listing.title)}`}
                                    className="listing-row"
                                >
                                    <div className="listing-thumb">
                                        <img
                                            src={listing.images?.[0] || 'https://via.placeholder.com/60x45?text=İlan'}
                                            alt={listing.title}
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="listing-details">
                                        <span className="listing-title">{listing.title}</span>
                                        <span className="listing-location">
                                            {listing.city}{listing.district && ` / ${listing.district}`}
                                        </span>
                                    </div>
                                    <div className="listing-price">
                                        {formatPrice(listing.price)}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default HomePage;
