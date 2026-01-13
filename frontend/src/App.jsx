import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import SplashScreen from './components/SplashScreen';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ListingDetailPage from './pages/ListingDetailPage';
import CreateListingPage from './pages/CreateListingPage';
import EditListingPage from './pages/EditListingPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import FavoritesPage from './pages/FavoritesPage';
import MessagesPage from './pages/MessagesPage';
import PaymentPage from './pages/PaymentPage';
import PromoteListingPage from './pages/PromoteListingPage';
import EscrowPage from './pages/EscrowPage';
import MyEscrowsPage from './pages/MyEscrowsPage';
import WalletPage from './pages/WalletPage';

function App() {
    const [showSplash, setShowSplash] = useState(true);

    return (
        <AuthProvider>
            <Router>
                <div className="app">
                    {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
                    <Header />
                    <main style={{ paddingBottom: '60px' }}> {/* Add padding for bottom nav */}
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/kategori/:slug" element={<CategoryPage />} />
                            <Route path="/ilan/:id/:slug?" element={<ListingDetailPage />} />
                            <Route path="/ilan-ver" element={<CreateListingPage />} />
                            <Route path="/ilan-duzenle/:id" element={<EditListingPage />} />
                            <Route path="/profil" element={<ProfilePage />} />
                            <Route path="/profilim" element={<ProfilePage />} />
                            <Route path="/favorilerim" element={<FavoritesPage />} />
                            <Route path="/mesajlar" element={<MessagesPage />} />
                            <Route path="/odeme" element={<PaymentPage />} />
                            <Route path="/vitrin/:id" element={<PromoteListingPage />} />
                            <Route path="/param-guvende/:id" element={<EscrowPage />} />
                            <Route path="/param-guvende/islem/:escrowId" element={<EscrowPage />} />
                            <Route path="/guvenli-islemlerim" element={<MyEscrowsPage />} />
                            <Route path="/cuzdanim" element={<WalletPage />} />
                            <Route path="/giris" element={<LoginPage />} />
                            <Route path="/kayit" element={<RegisterPage />} />
                            <Route path="/admin" element={<AdminPage />} />
                        </Routes>
                    </main>
                    <Footer />
                    <MobileBottomNav />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
