import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getWallet, topUpWallet, withdrawWallet, addSavedCard, removeSavedCard } from '../utils/api';
import './WalletPage.css';

const WalletPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, loading: authLoading } = useAuth();

    const [wallet, setWallet] = useState({ balance: 0, savedCards: [], transactions: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('transactions'); // transactions, cards

    // Modals
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [showAddCardModal, setShowAddCardModal] = useState(false);

    // Forms
    const [topUpAmount, setTopUpAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawIban, setWithdrawIban] = useState('');
    const [processing, setProcessing] = useState(false);

    const [newCard, setNewCard] = useState({
        cardName: '',
        cardNumber: '',
        expiry: '',
        cvv: ''
    });

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/giris');
            return;
        }
        if (isAuthenticated) {
            fetchWallet();
        }
    }, [isAuthenticated, authLoading]);

    const fetchWallet = async () => {
        try {
            const response = await getWallet();
            setWallet(response.data);
        } catch (error) {
            console.error('Cüzdan bilgileri alınamadı:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTopUp = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            // Use dummy new card for demo
            await topUpWallet({
                amount: topUpAmount,
                newCard: {
                    ...newCard,
                    saveCard: true // Auto save for simplicity in demo
                }
            });
            setShowTopUpModal(false);
            setTopUpAmount('');
            setNewCard({ cardName: '', cardNumber: '', expiry: '', cvv: '' });
            fetchWallet();
            alert('Bakiye başarıyla yüklendi!');
        } catch (error) {
            alert(error.response?.data?.message || 'Hata oluştu');
        } finally {
            setProcessing(false);
        }
    };

    const handleWithdraw = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await withdrawWallet({ amount: withdrawAmount, iban: withdrawIban });
            setShowWithdrawModal(false);
            setWithdrawAmount('');
            setWithdrawIban('');
            fetchWallet();
            alert('Para çekme talebiniz alındı.');
        } catch (error) {
            alert(error.response?.data?.message || 'Hata oluştu');
        } finally {
            setProcessing(false);
        }
    };

    const handleAddCard = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await addSavedCard(newCard);
            setShowAddCardModal(false);
            setNewCard({ cardName: '', cardNumber: '', expiry: '', cvv: '' });
            fetchWallet();
        } catch (error) {
            alert(error.response?.data?.message || 'Hata oluştu');
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteCard = async (cardId) => {
        if (!window.confirm('Kartı silmek istediğinize emin misiniz?')) return;
        try {
            await removeSavedCard(cardId);
            fetchWallet();
        } catch (error) {
            alert('Kart silinemedi.');
        }
    };

    const handleCardInputChange = (e) => {
        let { name, value } = e.target;
        if (name === 'cardNumber') {
            value = value.replace(/\D/g, '').slice(0, 16);
            value = value.replace(/(.{4})/g, '$1 ').trim();
        }
        if (name === 'expiry') {
            value = value.replace(/\D/g, '').slice(0, 4);
            if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2);
        }
        if (name === 'cvv') value = value.replace(/\D/g, '').slice(0, 4);

        setNewCard(prev => ({ ...prev, [name]: value }));
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('tr-TR').format(price) + ' TL';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (authLoading || loading) {
        return <div className="loading-container"><div className="loading-spinner"></div></div>;
    }

    return (
        <div className="wallet-page">
            <div className="container">
                <div className="wallet-header">
                    <h1>💰 Cüzdanım</h1>
                    <div className="balance-card">
                        <span className="balance-label">Toplam Bakiye</span>
                        <div className="balance-amount">{formatPrice(wallet.balance)}</div>
                        <div className="balance-actions">
                            <button className="btn btn-topup" onClick={() => setShowTopUpModal(true)}>➕ Para Yükle</button>
                            <button className="btn btn-withdraw" onClick={() => setShowWithdrawModal(true)}>💸 Para Çek</button>
                        </div>
                    </div>
                </div>

                <div className="wallet-content">
                    <div className="wallet-tabs">
                        <button
                            className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
                            onClick={() => setActiveTab('transactions')}
                        >
                            📋 Hesap Hareketleri
                        </button>
                        <button
                            className={`tab ${activeTab === 'cards' ? 'active' : ''}`}
                            onClick={() => setActiveTab('cards')}
                        >
                            💳 Kayıtlı Kartlar
                        </button>
                    </div>

                    {activeTab === 'transactions' && (
                        <div className="transactions-list">
                            {wallet.transactions.length === 0 ? (
                                <div className="no-data">Henüz işlem yok.</div>
                            ) : (
                                (wallet.transactions || []).map(tx => {
                                    const isSeller = String(wallet.currentUser?.id) === String(tx.sellerId) || (tx.type === 'sale_revenue');
                                    const isPositive = ['deposit', 'sale_revenue'].includes(tx.type) || isSeller;
                                    const isCancelled = tx.status === 'cancelled';

                                    const getStatusLabel = (status) => {
                                        const labels = {
                                            'completed': '✅ Tamamlandı',
                                            'cancelled': '❌ İptal',
                                            'pending': '⏳ Beklemede',
                                            'pending_payment': '💳 Ödeme Bekleniyor',
                                            'paid': '💰 Ödendi',
                                            'shipped': '📦 Kargoda'
                                        };
                                        return labels[status] || status;
                                    };

                                    return (
                                        <div key={tx.id} className={`transaction-item ${isCancelled ? 'cancelled' : ''}`}>
                                            <div className={`tx-icon ${tx.type}`}>
                                                {tx.type === 'deposit' ? '📥' :
                                                    tx.type === 'withdrawal' ? '📤' :
                                                        isSeller ? '💰' : '🛒'}
                                            </div>
                                            <div className="tx-info">
                                                <div className="tx-desc">{tx.description} {isSeller ? '(Satış)' : ''}</div>
                                                <div className="tx-meta">
                                                    <span className="tx-date">{formatDate(tx.date)}</span>
                                                    {tx.status && tx.type === 'escrow_purchase' && (
                                                        <span className={`tx-status ${tx.status}`}>{getStatusLabel(tx.status)}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={`tx-amount ${isPositive ? 'positive' : 'negative'} ${isCancelled ? 'cancelled-amount' : ''}`}>
                                                {isCancelled ? '' : (isPositive ? '+' : '-')} {formatPrice(tx.amount)}
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    )}

                    {activeTab === 'cards' && (
                        <div className="cards-section">
                            <button className="btn btn-add-card" onClick={() => setShowAddCardModal(true)}>
                                ➕ Yeni Kart Ekle
                            </button>
                            <div className="cards-grid">
                                {(wallet.savedCards || []).map(card => (
                                    <div key={card.id} className="saved-card">
                                        <div className="card-top">
                                            <span className="card-type">{card.type === 'visa' ? 'VISA' : 'MasterCard'}</span>
                                            <button className="btn-delete-card" onClick={() => handleDeleteCard(card.id)}>🗑️</button>
                                        </div>
                                        <div className="card-number">{card.cardNumberMasked}</div>
                                        <div className="card-bottom">
                                            <span className="card-name">{card.cardName}</span>
                                            <span className="card-expiry">{card.expiry}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Top Up Modal */}
            {showTopUpModal && (
                <div className="modal-overlay" onClick={() => setShowTopUpModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Para Yükle</h3>
                        <form onSubmit={handleTopUp}>
                            <div className="form-group">
                                <label>Tutar (TL)</label>
                                <input
                                    type="number"
                                    value={topUpAmount}
                                    onChange={e => setTopUpAmount(e.target.value)}
                                    placeholder="0.00"
                                    min="1"
                                    required
                                />
                            </div>

                            <h4>Kart Bilgileri</h4>
                            <div className="form-group">
                                <label>Kart Numarası</label>
                                <input type="text" name="cardNumber" value={newCard.cardNumber} onChange={handleCardInputChange} placeholder="0000 0000 0000 0000" required />
                            </div>
                            <div className="form-group">
                                <label>Kart Üzerindeki İsim</label>
                                <input type="text" name="cardName" value={newCard.cardName} onChange={handleCardInputChange} placeholder="AD SOYAD" required />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>SKT</label>
                                    <input type="text" name="expiry" value={newCard.expiry} onChange={handleCardInputChange} placeholder="AA/YY" required />
                                </div>
                                <div className="form-group">
                                    <label>CVV</label>
                                    <input type="text" name="cvv" value={newCard.cvv} onChange={handleCardInputChange} placeholder="000" required />
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={processing}>
                                {processing ? 'Yükleniyor...' : 'Ödeme Yap ve Yükle'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Withdraw Modal */}
            {showWithdrawModal && (
                <div className="modal-overlay" onClick={() => setShowWithdrawModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Para Çek</h3>
                        <form onSubmit={handleWithdraw}>
                            <div className="form-group">
                                <label>Çekilecek Tutar (TL)</label>
                                <input
                                    type="number"
                                    value={withdrawAmount}
                                    onChange={e => setWithdrawAmount(e.target.value)}
                                    placeholder="0.00"
                                    min="1"
                                    max={wallet.balance}
                                    required
                                />
                                <small>Mevcut Bakiyeniz: {formatPrice(wallet.balance)}</small>
                            </div>

                            <div className="form-group">
                                <label>IBAN</label>
                                <input
                                    type="text"
                                    value={withdrawIban}
                                    onChange={e => setWithdrawIban(e.target.value)}
                                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                                    required
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={processing}>
                                {processing ? 'İşleniyor...' : 'Çekim Talebi Oluştur'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Card Modal */}
            {showAddCardModal && (
                <div className="modal-overlay" onClick={() => setShowAddCardModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Yeni Kart Ekle</h3>
                        <form onSubmit={handleAddCard}>
                            <div className="form-group">
                                <label>Kart Numarası</label>
                                <input type="text" name="cardNumber" value={newCard.cardNumber} onChange={handleCardInputChange} placeholder="0000 0000 0000 0000" required />
                            </div>
                            <div className="form-group">
                                <label>Kart Üzerindeki İsim</label>
                                <input type="text" name="cardName" value={newCard.cardName} onChange={handleCardInputChange} placeholder="AD SOYAD" required />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>SKT</label>
                                    <input type="text" name="expiry" value={newCard.expiry} onChange={handleCardInputChange} placeholder="AA/YY" required />
                                </div>
                                <div className="form-group">
                                    <label>CVV (Doğrulama için)</label>
                                    <input type="text" name="cvv" value={newCard.cvv} onChange={handleCardInputChange} placeholder="000" required />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={processing}>
                                {processing ? 'Kaydediliyor...' : 'Kartı Kaydet'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WalletPage;
