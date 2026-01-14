import React from 'react';
import './FilterPanel.css';

const FilterPanel = ({
    categories,
    cities,
    filters,
    onFilterChange,
    onReset,
    currentCategory
}) => {
    // Find current active category object
    const currentCatObj = categories?.find(c => c.name === currentCategory);

    const handleChange = (key, value) => {
        onFilterChange({ ...filters, [key]: value });
    };

    return (
        <aside className="filter-panel">
            <div className="filter-header">
                <h3>Detaylı Arama</h3>
                <button className="filter-reset" onClick={onReset}>
                    Temizle
                </button>
            </div>

            {/* Category Navigation (Tree Structure) */}
            <div className="filter-section category-section">
                <h4 className="filter-title">Kategoriler</h4>
                <ul className="category-tree">
                    {/* Show "All Categories" link if a specific category is selected */}
                    {currentCategory && (
                        <li className="category-item parent-link">
                            <a href="#" onClick={(e) => { e.preventDefault(); handleChange('category', ''); }}>
                                ◀ Tüm Kategoriler
                            </a>
                        </li>
                    )}

                    {/* If inside a category, show its name and subcategories */}
                    {currentCatObj ? (
                        <>
                            <li className="category-item current-category-title">
                                <span className="cat-icon">{currentCatObj.icon}</span>
                                <strong>{currentCatObj.name}</strong>
                            </li>
                            {currentCatObj.subCategories?.map(sub => (
                                <li key={sub} className={`category-item sub-item ${filters.subCategory === sub ? 'active' : ''}`}>
                                    <a href="#" onClick={(e) => { e.preventDefault(); handleChange('subCategory', sub); }}>
                                        {sub}
                                    </a>
                                </li>
                            ))}
                        </>
                    ) : (
                        // If no category selected, show all main categories
                        categories?.map(cat => (
                            <li key={cat.id} className="category-item main-item">
                                <a href="#" onClick={(e) => { e.preventDefault(); handleChange('category', cat.name); }}>
                                    {cat.icon} {cat.name}
                                </a>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            <div className="filter-divider"></div>

            {/* Search within results */}
            <div className="filter-section">
                <h4 className="filter-title">Kelime ile Ara</h4>
                <div className="search-in-results">
                    <input
                        type="text"
                        placeholder="Sonuçlarda ara..."
                        className="filter-input-text"
                        value={filters.search || ''}
                        onChange={(e) => handleChange('search', e.target.value)}
                    />
                    <span className="search-icon-small">🔍</span>
                </div>
            </div>

            <div className="filter-divider"></div>

            {/* Price Range */}
            <div className="filter-section">
                <h4 className="filter-title">Fiyat (TL)</h4>
                <div className="price-inputs">
                    <input
                        type="number"
                        placeholder="Min"
                        className="filter-input-price"
                        value={filters.minPrice || ''}
                        onChange={(e) => handleChange('minPrice', e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Max"
                        className="filter-input-price"
                        value={filters.maxPrice || ''}
                        onChange={(e) => handleChange('maxPrice', e.target.value)}
                    />
                </div>
                <button className="price-apply-btn" onClick={() => onFilterChange(filters)}>
                    Ara
                </button>
                <button className="price-apply-btn" onClick={() => onFilterChange(filters)}>
                    Ara
                </button>
            </div>

            <div className="filter-divider"></div>

            {/* Year Range - Only for Vasıta */}
            {(currentCategory === 'Vasıta' || !currentCategory) && (
                <>
                    <div className="filter-section">
                        <h4 className="filter-title">Yıl</h4>
                        <div className="price-inputs">
                            <input
                                type="number"
                                placeholder="Min"
                                className="filter-input-price"
                                value={filters.minYear || ''}
                                onChange={(e) => handleChange('minYear', e.target.value)}
                            />
                            <input
                                type="number"
                                placeholder="Max"
                                className="filter-input-price"
                                value={filters.maxYear || ''}
                                onChange={(e) => handleChange('maxYear', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="filter-divider"></div>
                </>
            )}

            {/* KM Range - Only for Vasıta */}
            {(currentCategory === 'Vasıta' || !currentCategory) && (
                <>
                    <div className="filter-section">
                        <h4 className="filter-title">KM</h4>
                        <div className="price-inputs">
                            <input
                                type="number"
                                placeholder="Min"
                                className="filter-input-price"
                                value={filters.minKm || ''}
                                onChange={(e) => handleChange('minKm', e.target.value)}
                            />
                            <input
                                type="number"
                                placeholder="Max"
                                className="filter-input-price"
                                value={filters.maxKm || ''}
                                onChange={(e) => handleChange('maxKm', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="filter-divider"></div>
                </>
            )}

            {/* Color Filter */}
            <div className="filter-section">
                <h4 className="filter-title">Renk</h4>
                <select
                    className="filter-select-native"
                    value={filters.color || ''}
                    onChange={(e) => handleChange('color', e.target.value)}
                >
                    <option value="">Tüm Renkler</option>
                    <option value="Beyaz">Beyaz</option>
                    <option value="Siyah">Siyah</option>
                    <option value="Gri">Gri</option>
                    <option value="Kırmızı">Kırmızı</option>
                    <option value="Mavi">Mavi</option>
                    <option value="Yeşil">Yeşil</option>
                    <option value="Sarı">Sarı</option>
                    <option value="Turuncu">Turuncu</option>
                    <option value="Kahverengi">Kahverengi</option>
                    <option value="Diğer">Diğer</option>
                </select>
            </div>

            <div className="filter-divider"></div>

            {/* Address / City */}
            <div className="filter-section">
                <h4 className="filter-title">Adres</h4>
                <div className="filter-list-container">
                    <div className="filter-list-header">Şehir</div>
                    <select
                        className="filter-select-native"
                        value={filters.city || ''}
                        onChange={(e) => handleChange('city', e.target.value)}
                    >
                        <option value="">Tüm Türkiye</option>
                        {cities?.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="filter-divider"></div>

            {/* Sort */}
            <div className="filter-section">
                <h4 className="filter-title">Sıralama</h4>
                <select
                    className="filter-select-native"
                    value={filters.sort || 'date_desc'}
                    onChange={(e) => handleChange('sort', e.target.value)}
                >
                    <option value="date_desc">Tarihe Göre (Yeni)</option>
                    <option value="date_asc">Tarihe Göre (Eski)</option>
                    <option value="price_asc">Fiyat (Önce En Düşük)</option>
                    <option value="price_desc">Fiyat (Önce En Yüksek)</option>
                </select>
            </div>

            <button className="filter-apply-sticky" onClick={() => onFilterChange(filters)}>
                Sonuçları Göster
            </button>
        </aside>
    );
};

export default FilterPanel;
