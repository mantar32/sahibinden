import React from 'react';
import { Link } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import './ComparePage.css';

const ComparePage = () => {
    const { compareList, removeFromCompare, clearCompare } = useCompare();

    if (compareList.length === 0) {
        return (
            <div className="compare-empty">
                <h2>Karşılaştırma Listesi Boş</h2>
                <p>İlanları karşılaştırmak için ilan detay sayfasından veya listelerden "Karşılaştır" butonunu kullanabilirsiniz.</p>
                <Link to="/" className="btn btn-primary">Anasayfaya Dön</Link>
            </div>
        );
    }

    // Prepare content for rendering rows
    const renderRow = (label, renderFn) => (
        <tr key={label}>
            <td className="compare-label">{label}</td>
            {compareList.map(item => (
                <td key={item.id} className="compare-value">
                    {renderFn(item)}
                </td>
            ))}
            {/* Fill empty slots if less than 3 */}
            {[...Array(3 - compareList.length)].map((_, i) => (
                <td key={`empty-${i}`} className="compare-empty-cell"></td>
            ))}
        </tr>
    );

    const formatPrice = (price) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(price);
    };

    return (
        <div className="container compare-page">
            <div className="compare-header">
                <h1>İlan Karşılaştırma</h1>
                <button className="btn btn-danger" onClick={clearCompare}>Listeyi Temizle</button>
            </div>

            <div className="compare-table-wrapper">
                <table className="compare-table">
                    <thead>
                        <tr>
                            <th className="compare-label-head">Özellikler</th>
                            {compareList.map(item => (
                                <th key={item.id} className="compare-item-head">
                                    <div className="compare-curr-item">
                                        <button className="remove-compare" onClick={() => removeFromCompare(item.id)}>✕</button>
                                        <Link to={`/ilan/${item.id}/${item.title}`}>
                                            <img src={item.images?.[0]} alt={item.title} className="compare-img" />
                                            <div className="compare-title">{item.title}</div>
                                        </Link>
                                    </div>
                                </th>
                            ))}
                            {[...Array(3 - compareList.length)].map((_, i) => (
                                <th key={`empty-head-${i}`} className="compare-empty-head">
                                    <div className="empty-slot">Boş Slot</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {renderRow('Fiyat', item => <span className="price-tag">{formatPrice(item.price)}</span>)}
                        {renderRow('Kategori', item => item.category)}
                        {renderRow('Alt Kategori', item => item.subCategory)}
                        {renderRow('İl / İlçe', item => `${item.city} / ${item.district}`)}
                        {renderRow('İlan Tarihi', item => new Date(item.createdAt).toLocaleDateString('tr-TR'))}
                        {renderRow('Satıcı', item => (
                            <div className="compare-seller">
                                <img src={item.seller?.avatar} alt={item.seller?.name} className="seller-avatar-sm" />
                                <span>{item.seller?.name}</span>
                            </div>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ComparePage;
