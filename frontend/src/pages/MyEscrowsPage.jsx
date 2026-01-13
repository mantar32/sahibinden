import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyEscrows, shipEscrow, confirmEscrow, cancelEscrow } from '../utils/api';
import './MyEscrowsPage.css';

const MyEscrowsPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, loading: authLoading } = useAuth();

    const [escrows, setEscrows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all'); // all, buying, selling
    const [showShipModal, setShowShipModal] = useState(null);
    const [shipData, setShipData] = useState({ trackingNumber: '', cargoCompany: 'Yurtiçi Kargo' });
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/giris');
            return;
        }
        if (isAuthenticated) {
            fetchEscrows();
        }
    }, [isAuthenticated, authLoading]);

    const fetchEscrows = async () => {
        try {
            const response = await getMyEscrows();
            setEscrows(response.data);
        } catch (error) {
            console.error('İşlemler yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleShip = async (escrowId) => {
        setProcessing(true);
        try {
            await shipEscrow(escrowId, shipData);
            setShowShipModal(null);
            setShipData({ trackingNumber: '', cargoCompany: 'Yurtiçi Kargo' });
            fetchEscrows();
        } catch (error) {
            alert(error.response?.data?.message || 'Hata oluştu');
        } finally {
            setProcessing(false);
        }
    };

    const handleConfirm = async (escrowId) => {
        if (!window.confirm('Ürünü teslim aldığınızı onaylıyor musunuz? Para satıcıya aktarılacak.')) return;

        setProcessing(true);
        try {
            await confirmEscrow(escrowId);
            fetchEscrows();
            alert('Teslimat onaylandı! Para satıcıya aktarıldı.');
        } catch (error) {
            alert(error.response?.data?.message || 'Hata oluştu');
        } finally {
            setProcessing(false);
        }
    };

    const handleCancel = async (escrowId) => {
        if (!window.confirm('İşlemi iptal etmek istediğinize emin misiniz?')) return;

        setProcessing(true);
        try {
            await cancelEscrow(escrowId);
            fetchEscrows();
        } catch (error) {
            alert(error.response?.data?.message || 'Hata oluştu');
        } finally {
            setProcessing(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('tr-TR').format(price) + ' TL';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusInfo = (status) => {
        const statuses = {
            'pending_payment': { label: 'Ödeme Bekleniyor', color: '#f59e0b', icon: '⏳' },
            'paid': { label: 'Ödendi - Kargo Bekleniyor', color: '#3b82f6', icon: '💳' },
            'shipped': { label: 'Kargoda', color: '#8b5cf6', icon: '📦' },
            'completed': { label: 'Tamamlandı', color: '#10b981', icon: '✅' },
            'cancelled': { label: 'İptal Edildi', color: '#ef4444', icon: '❌' }
        };
        return statuses[status] || { label: status, color: '#6b7280', icon: '❓' };
    };

    const filteredEscrows = escrows.filter(e => {
        if (activeTab === 'cancelled') return e.status === 'cancelled';
        if (activeTab === 'buying') return e.isBuyer && e.status !== 'cancelled';
        if (activeTab === 'selling') return e.isSeller && e.status !== 'cancelled';
        // 'all' tab - exclude cancelled
        return e.status !== 'cancelled';
    });

    if (authLoading || loading) {
        return (
            <div className="my-escrows-page">
                <div className="container">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Yükleniyor...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="my-escrows-page">
            <div className="container">
                <div className="page-header">
                    <h1>🛡️ Güvenli Alışverişlerim</h1>
                    <p>Param Güvende işlemlerinizi buradan takip edin</p>
                </div>

                {/* Tabs */}
                <div className="escrow-tabs">
                    <button
                        className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        Tümü ({escrows.filter(e => e.status !== 'cancelled').length})
                    </button>
                    <button
                        className={`tab ${activeTab === 'buying' ? 'active' : ''}`}
                        onClick={() => setActiveTab('buying')}
                    >
                        🛒 Aldıklarım ({escrows.filter(e => e.isBuyer && e.status !== 'cancelled').length})
                    </button>
                    <button
                        className={`tab ${activeTab === 'selling' ? 'active' : ''}`}
                        onClick={() => setActiveTab('selling')}
                    >
                        💰 Sattıklarım ({escrows.filter(e => e.isSeller && e.status !== 'cancelled').length})
                    </button>
                    <button
                        className={`tab cancelled ${activeTab === 'cancelled' ? 'active' : ''}`}
                        onClick={() => setActiveTab('cancelled')}
                    >
                        ❌ İptal Edilenler ({escrows.filter(e => e.status === 'cancelled').length})
                    </button>
                </div>

                {/* Escrow List */}
                <div className="escrow-list">
                    {filteredEscrows.length === 0 ? (
                        <div className="no-escrows">
                            <span>🛡️</span>
                            <h3>Henüz işlem yok</h3>
                            <p>Param Güvende ile güvenli alışveriş yapmaya başlayın!</p>
                            <Link to="/" className="btn btn-primary">İlanlara Göz At</Link>
                        </div>
                    ) : (
                        filteredEscrows.map(escrow => {
                            const status = getStatusInfo(escrow.status);
                            return (
                                <div key={escrow.id} className="escrow-card">
                                    <div className="escrow-main">
                                        {escrow.listingImage && (
                                            <img
                                                src={escrow.listingImage}
                                                alt=""
                                                className="escrow-image"
                                            />
                                        )}
                                        <div className="escrow-info">
                                            <h3>{escrow.listingTitle}</h3>
                                            <div className="escrow-meta">
                                                <span className="escrow-price">{formatPrice(escrow.amount)}</span>
                                                <span className="escrow-role">
                                                    {escrow.isBuyer ? '🛒 Alıcı' : '💰 Satıcı'}
                                                </span>
                                            </div>
                                            <div className="escrow-parties">
                                                {escrow.isBuyer ? (
                                                    <span>Satıcı: {escrow.seller?.name}</span>
                                                ) : (
                                                    <span>Alıcı: {escrow.buyer?.name}</span>
                                                )}
                                            </div>
                                            <div className="escrow-date">
                                                {formatDate(escrow.createdAt)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="escrow-status-section">
                                        <div
                                            className="status-badge"
                                            style={{ background: status.color }}
                                        >
                                            {status.icon} {status.label}
                                        </div>

                                        {/* Tracking Info */}
                                        {escrow.status === 'shipped' && escrow.trackingNumber && (
                                            <div className="tracking-info">
                                                <span>📦 {escrow.cargoCompany}</span>
                                                <span>Takip: {escrow.trackingNumber}</span>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="escrow-actions">
                                            {/* Seller: Ship button */}
                                            {escrow.isSeller && escrow.status === 'paid' && (
                                                <button
                                                    className="btn btn-ship"
                                                    onClick={() => setShowShipModal(escrow.id)}
                                                >
                                                    📦 Kargoya Verdim
                                                </button>
                                            )}

                                            {/* Buyer: Confirm button */}
                                            {escrow.isBuyer && escrow.status === 'shipped' && (
                                                <button
                                                    className="btn btn-confirm"
                                                    onClick={() => handleConfirm(escrow.id)}
                                                    disabled={processing}
                                                >
                                                    ✅ Teslim Aldım
                                                </button>
                                            )}

                                            {/* Cancel button (buyer only, before shipping) */}
                                            {escrow.isBuyer && ['pending_payment', 'paid'].includes(escrow.status) && (
                                                <button
                                                    className="btn btn-cancel"
                                                    onClick={() => handleCancel(escrow.id)}
                                                    disabled={processing}
                                                >
                                                    ❌ İptal Et
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Ship Modal */}
                {showShipModal && (
                    <div className="modal-overlay" onClick={() => setShowShipModal(null)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <h3>📦 Kargo Bilgileri</h3>
                            <p>Ürünü kargoya verdiğinizi belirtin</p>

                            <div className="form-group">
                                <label>Kargo Şirketi</label>
                                <select
                                    value={shipData.cargoCompany}
                                    onChange={e => setShipData(prev => ({ ...prev, cargoCompany: e.target.value }))}
                                >
                                    <option>Yurtiçi Kargo</option>
                                    <option>Aras Kargo</option>
                                    <option>MNG Kargo</option>
                                    <option>PTT Kargo</option>
                                    <option>Sürat Kargo</option>
                                    <option>UPS</option>
                                    <option>Diğer</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Takip Numarası (Opsiyonel)</label>
                                <input
                                    type="text"
                                    value={shipData.trackingNumber}
                                    onChange={e => setShipData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                                    placeholder="Kargo takip numarası..."
                                />
                            </div>

                            <div className="modal-actions">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowShipModal(null)}
                                >
                                    İptal
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleShip(showShipModal)}
                                    disabled={processing}
                                >
                                    {processing ? 'Kaydediliyor...' : 'Kargoya Verildi'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyEscrowsPage;
