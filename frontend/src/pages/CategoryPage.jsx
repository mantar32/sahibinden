import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { getListings, getCategories, getCities } from '../utils/api';
import ListingCard from '../components/ListingCard';
import FilterPanel from '../components/FilterPanel';
import SEO from '../components/SEO';
import './CategoryPage.css';

const CategoryPage = () => {
    const { slug } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    const [listings, setListings] = useState([]);
    const [categories, setCategories] = useState([]);
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [isReady, setIsReady] = useState(false);

    // Use ref to track if initial data is loaded
    const initialLoadDone = useRef(false);

    const [filters, setFilters] = useState({
        category: '',
        subCategory: '',
        city: searchParams.get('city') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        sort: searchParams.get('sort') || 'date_desc',
        search: searchParams.get('search') || ''
    });

    // Fetch initial data (categories, cities)
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [catRes, citiesRes] = await Promise.all([
                    getCategories(),
                    getCities()
                ]);
                setCategories(catRes.data);
                setCities(citiesRes.data);
                initialLoadDone.current = true;
            } catch (error) {
                console.error('Veri yüklenirken hata:', error);
            }
        };
        fetchInitialData();
    }, []);

    // Update filters when slug or URL params change (only after categories loaded)
    useEffect(() => {
        if (categories.length === 0) return;

        const category = categories.find(c => c.slug === slug);
        const subFromUrl = searchParams.get('sub') || '';

        const newCategory = category ? category.name : (slug === 'tum-ilanlar' ? '' : '');

        setFilters(prev => {
            // Only update if values actually changed
            if (prev.category === newCategory && prev.subCategory === subFromUrl) {
                return prev;
            }
            return { ...prev, category: newCategory, subCategory: subFromUrl };
        });

        setIsReady(true);
    }, [slug, categories, searchParams]);

    // Fetch listings when filters change (only when ready)
    useEffect(() => {
        if (!isReady) return;

        const fetchListings = async () => {
            setLoading(true);
            try {
                const params = {};
                if (filters.category) params.category = filters.category;
                if (filters.subCategory) params.subCategory = filters.subCategory;
                if (filters.city) params.city = filters.city;
                if (filters.minPrice) params.minPrice = filters.minPrice;
                if (filters.maxPrice) params.maxPrice = filters.maxPrice;
                if (filters.sort) params.sort = filters.sort;
                if (filters.search) params.search = filters.search;

                const response = await getListings(params);
                setListings(response.data);
            } catch (error) {
                console.error('İlanlar yüklenirken hata:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, [filters, isReady]);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);

        // Update URL params
        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value && key !== 'category') {
                if (key === 'subCategory') {
                    params.set('sub', value);
                } else {
                    params.set(key, value);
                }
            }
        });
        setSearchParams(params);
    };

    const handleResetFilters = () => {
        setFilters(prev => ({
            ...prev,
            subCategory: '',
            city: '',
            minPrice: '',
            maxPrice: '',
            sort: 'date_desc',
            search: ''
        }));
        setSearchParams({});
    };

    const currentCategory = categories.find(c => c.slug === slug);
    const pageTitle = currentCategory ? currentCategory.name : 'Tüm İlanlar';

    return (
        <div className="category-page">
            <SEO
                title={`${pageTitle}${filters.subCategory ? ` - ${filters.subCategory}` : ''}`}
                description={`${pageTitle} kategorisindeki en yeni ilanları, fiyatları ve fırsatları inceleyin. Sahibinden satılık, kiralık seçenekler.`}
            />
            <div className="container">
                {/* Breadcrumb */}
                <nav className="breadcrumb">
                    <Link to="/">Ana Sayfa</Link>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-current">{pageTitle}</span>
                    {filters.subCategory && (
                        <>
                            <span className="breadcrumb-separator">/</span>
                            <span className="breadcrumb-current">{filters.subCategory}</span>
                        </>
                    )}
                </nav>

                {/* Page Header */}
                <div className="page-header">
                    <div className="header-info">
                        <h1 className="page-title">
                            {currentCategory?.icon} {pageTitle}
                            {filters.subCategory && ` - ${filters.subCategory}`}
                        </h1>
                        <p className="results-count">
                            {listings.length} ilan bulundu
                        </p>
                    </div>

                    <button
                        className="filter-toggle-btn"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        🔍 Filtreler {showFilters ? '▲' : '▼'}
                    </button>
                </div>

                {/* Content */}
                <div className="page-content">
                    {/* Filters - Desktop & Mobile */}
                    <div className={`filters-wrapper ${showFilters ? 'show' : ''}`}>
                        <FilterPanel
                            categories={categories}
                            cities={cities}
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onReset={handleResetFilters}
                            currentCategory={filters.category}
                        />
                    </div>

                    {/* Listings */}
                    <div className="listings-wrapper">
                        {/* Sort Bar (Desktop) */}
                        <div className="sort-bar">
                            <span className="sort-label">Sırala:</span>
                            <select
                                className="sort-select"
                                value={filters.sort}
                                onChange={(e) => handleFilterChange({ ...filters, sort: e.target.value })}
                            >
                                <option value="date_desc">En Yeni</option>
                                <option value="date_asc">En Eski</option>
                                <option value="price_asc">Fiyat: Düşükten Yükseğe</option>
                                <option value="price_desc">Fiyat: Yüksekten Düşüğe</option>
                            </select>
                        </div>

                        {loading ? (
                            <div className="loading-container">
                                <div className="loading-spinner"></div>
                                <p>İlanlar yükleniyor...</p>
                            </div>
                        ) : listings.length > 0 ? (
                            <div className="listings-grid">
                                {listings.map(listing => (
                                    <ListingCard key={listing.id} listing={listing} />
                                ))}
                            </div>
                        ) : (
                            <div className="no-results">
                                <span className="no-results-icon">🔍</span>
                                <h3>İlan Bulunamadı</h3>
                                <p>
                                    {filters.subCategory
                                        ? `"${filters.subCategory}" alt kategorisinde ilan bulunamadı.`
                                        : 'Arama kriterlerinize uygun ilan bulunamadı.'
                                    }
                                </p>
                                <button className="btn btn-secondary" onClick={handleResetFilters}>
                                    Filtreleri Temizle
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryPage;
