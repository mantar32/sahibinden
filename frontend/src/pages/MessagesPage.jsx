import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMessages, getConversation, sendMessage } from '../utils/api';
import './MessagesPage.css';

const MessagesPage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, loading: authLoading } = useAuth();

    const [messages, setMessages] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [currentConversation, setCurrentConversation] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/giris?redirect=/mesajlar');
        }
    }, [isAuthenticated, authLoading, navigate]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchMessages();
        }
    }, [isAuthenticated]);

    const fetchMessages = async () => {
        try {
            const response = await getMessages();
            setMessages(response.data);

            // Group messages by conversation
            const convos = {};
            response.data.forEach(msg => {
                // Skip invalid messages
                if (!msg.sender || !msg.receiver) {
                    return;
                }

                const otherUserId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
                const otherUser = msg.senderId === user.id ? msg.receiver : msg.sender;

                if (!otherUser || !otherUserId) return;

                if (!convos[otherUserId]) {
                    convos[otherUserId] = {
                        user: otherUser,
                        lastMessage: msg,
                        unread: msg.receiverId === user.id && !msg.isRead ? 1 : 0
                    };
                } else {
                    if (msg.receiverId === user.id && !msg.isRead) {
                        convos[otherUserId].unread++;
                    }
                }
            });
            setConversations(Object.values(convos));
        } catch (error) {
            console.error('Mesajlar yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const openConversation = async (otherUser) => {
        setSelectedUser(otherUser);
        try {
            const response = await getConversation(otherUser.id);
            setCurrentConversation(response.data);

            // Mark as read locally and trigger event update
            setConversations(prev => prev.map(c =>
                c.user.id === otherUser.id ? { ...c, unread: 0 } : c
            ));
            window.dispatchEvent(new Event('messagesRead'));
        } catch (error) {
            console.error('Sohbet yüklenirken hata:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        setSending(true);
        try {
            await sendMessage({
                receiverId: selectedUser.id,
                content: newMessage
            });
            setNewMessage('');
            // Refresh conversation
            const response = await getConversation(selectedUser.id);
            setCurrentConversation(response.data);
        } catch (error) {
            console.error('Mesaj gönderilirken hata:', error);
        } finally {
            setSending(false);
        }
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;

        if (diff < 60000) return 'Şimdi';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} dk önce`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} saat önce`;
        return d.toLocaleDateString('tr-TR');
    };

    if (authLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="messages-page">
            <div className="container">
                <div className="messages-header">
                    <h1>💬 Mesajlarım</h1>
                </div>

                <div className={`messages-layout ${selectedUser ? 'mobile-chat-active' : ''}`}>
                    {/* Conversations List */}
                    <div className="conversations-list">
                        <h3>Sohbetler</h3>

                        {loading ? (
                            <div className="loading-small">Yükleniyor...</div>
                        ) : conversations.length === 0 ? (
                            <div className="no-conversations">
                                <p>Henüz mesajınız yok</p>
                            </div>
                        ) : (
                            conversations.map(convo => (
                                <div
                                    key={convo.user.id}
                                    className={`conversation-item ${selectedUser?.id === convo.user.id ? 'active' : ''}`}
                                    onClick={() => openConversation(convo.user)}
                                >
                                    <img src={convo.user.avatar} alt="" className="conv-avatar" />
                                    <div className="conv-info">
                                        <span className="conv-name">{convo.user.name}</span>
                                        <span className="conv-preview">
                                            {convo.lastMessage.content.substring(0, 40)}...
                                        </span>
                                    </div>
                                    <div className="conv-meta">
                                        <span className="conv-time">{formatDate(convo.lastMessage.createdAt)}</span>
                                        {convo.unread > 0 && (
                                            <span className="conv-badge">{convo.unread}</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Chat Area */}
                    <div className="chat-area">
                        {selectedUser ? (
                            <>
                                <div className="chat-header">
                                    <button
                                        className="mobile-back-btn"
                                        onClick={() => setSelectedUser(null)}
                                        style={{ marginRight: '10px', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', display: 'none' }}
                                    >
                                        ⬅️
                                    </button>
                                    <img src={selectedUser.avatar} alt="" />
                                    <span>{selectedUser.name}</span>
                                </div>

                                <div className="chat-messages">
                                    {currentConversation.map(msg => (
                                        <div
                                            key={msg.id}
                                            className={`message ${msg.senderId === user.id ? 'sent' : 'received'}`}
                                        >
                                            <div className="message-content">{msg.content}</div>
                                            <div className="message-time">{formatDate(msg.createdAt)}</div>
                                        </div>
                                    ))}
                                </div>

                                <form className="chat-input" onSubmit={handleSendMessage}>
                                    <input
                                        type="text"
                                        placeholder="Mesajınızı yazın..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                    <button type="submit" disabled={sending || !newMessage.trim()}>
                                        {sending ? '...' : '📤'}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="no-chat-selected">
                                <span>💬</span>
                                <p>Sohbet başlatmak için sol taraftan bir kişi seçin</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;
