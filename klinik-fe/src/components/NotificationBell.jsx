import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import echo from '../echo';

const TYPE_CONFIG = {
    reservasi_baru:  { icon: '📋', color: '#0a7c6e', bg: '#e6f4f2' },
    dibatalkan:      { icon: '❌', color: '#ef4444', bg: '#fef2f2' },
    dikonfirmasi:    { icon: '✅', color: '#10b981', bg: '#ecfdf5' },
    rekam_medis_baru:{ icon: '🏥', color: '#d97706', bg: '#fffbeb' },
    default:         { icon: '🔔', color: '#3d5a54', bg: '#f0f4f3' },
};

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 60) return 'baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return `${Math.floor(diff / 86400)} hari lalu`;
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef(null);

    const token = () => localStorage.getItem('klinik_token');

    const fetchNotifications = async () => {
        if (!token()) return;
        setLoading(true);
        try {
            const [notifRes, countRes] = await Promise.all([
                api('/notifications', {}, token()),
                api('/notifications/unread-count', {}, token()),
            ]);
            setNotifications(notifRes.data?.data || []);
            setUnreadCount(countRes.data?.count || 0);
        } catch (e) {
            console.error('Gagal memuat notifikasi:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Dapatkan user ID untuk subscribe ke private channel
        if (token()) {
            api('/profile', {}, token())
                .then(r => setUserId(r.data?.id))
                .catch(() => {});
        }
    }, []);

    // Close dropdown saat klik di luar
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Listen ke real-time WebSocket
    useEffect(() => {
        if (!userId) return;
        const channelName = `App.Models.User.${userId}`;
        const channel = echo.private(channelName);

        channel.notification((notification) => {
            const newNotif = {
                id: notification.id || Date.now().toString(),
                data: notification,
                read_at: null,
                created_at: new Date().toISOString(),
            };
            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        return () => {
            try { echo.leave(channelName); } catch(e) {}
        };
    }, [userId]);

    const handleMarkAsRead = async (id) => {
        if (!token()) return;
        try {
            await api(`/notifications/${id}/read`, { method: 'PATCH' }, token());
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (e) {}
    };

    const handleMarkAllAsRead = async () => {
        if (!token()) return;
        try {
            await api('/notifications/read-all', { method: 'PATCH' }, token());
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
            setUnreadCount(0);
        } catch (e) {}
    };

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            {/* ── Bell Button ── */}
            <button
                onClick={() => setIsOpen(o => !o)}
                style={{
                    position: 'relative',
                    width: 40, height: 40,
                    borderRadius: '50%',
                    border: 'none',
                    background: isOpen ? 'rgba(10,124,110,0.12)' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20,
                    transition: 'background 0.18s ease',
                    flexShrink: 0,
                }}
                title="Notifikasi"
            >
                🔔
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: 4, right: 4,
                        background: '#ef4444', color: '#fff',
                        borderRadius: '99px',
                        minWidth: 18, height: 18,
                        fontSize: 11, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0 4px',
                        lineHeight: 1,
                        animation: 'scaleIn 0.2s ease',
                        border: '2px solid #fff',
                    }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* ── Dropdown Panel ── */}
            {isOpen && (
                <>
                <style>{`
                    .notif-dropdown {
                        position: absolute;
                        top: calc(100% + 8px);
                        right: 0;
                        width: 340px;
                        background: #fff;
                        border-radius: 16px;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.18);
                        border: 1px solid #e2ebe8;
                        z-index: 9999;
                        overflow: hidden;
                        animation: fadeUp 0.2s ease;
                    }
                    @media (max-width: 640px) {
                        .notif-dropdown {
                            position: fixed;
                            top: 72px; /* adjust below the mobile header */
                            right: 16px;
                            left: 16px;
                            width: auto;
                            max-width: none;
                        }
                    }
                `}</style>
                <div className="notif-dropdown">
                    {/* Header */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '16px 20px',
                        borderBottom: '1px solid #f0f4f3',
                    }}>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 15, color: '#0d1f1c' }}>Notifikasi</div>
                            {unreadCount > 0 && (
                                <div style={{ fontSize: 12, color: '#7a9991', marginTop: 2 }}>
                                    {unreadCount} belum dibaca
                                </div>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                style={{
                                    background: '#e6f4f2', border: 'none', color: '#0a7c6e',
                                    cursor: 'pointer', fontSize: 12, fontWeight: 600,
                                    borderRadius: 8, padding: '6px 12px',
                                    transition: 'background 0.15s',
                                }}
                            >
                                Baca Semua
                            </button>
                        )}
                    </div>

                    {/* Body */}
                    <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                        {loading ? (
                            <div style={{ padding: 32, textAlign: 'center', color: '#7a9991', fontSize: 13 }}>
                                <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
                                Memuat notifikasi...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div style={{ padding: 32, textAlign: 'center', color: '#7a9991', fontSize: 13 }}>
                                <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
                                <div style={{ fontWeight: 600, color: '#3d5a54', marginBottom: 4 }}>Tidak ada notifikasi</div>
                                <div>Semua aktivitas terbaru akan muncul di sini.</div>
                            </div>
                        ) : (
                            notifications.map(notif => {
                                const data = notif.data || {};
                                const type = data.type || 'default';
                                const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.default;
                                const isUnread = !notif.read_at;
                                return (
                                    <div
                                        key={notif.id}
                                        onClick={() => isUnread && handleMarkAsRead(notif.id)}
                                        style={{
                                            display: 'flex', gap: 12, padding: '14px 20px',
                                            borderBottom: '1px solid #f0f4f3',
                                            background: isUnread ? '#f8fffe' : '#fff',
                                            cursor: isUnread ? 'pointer' : 'default',
                                            transition: 'background 0.15s',
                                            alignItems: 'flex-start',
                                        }}
                                        onMouseEnter={e => { if (isUnread) e.currentTarget.style.background = '#f0faf8'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = isUnread ? '#f8fffe' : '#fff'; }}
                                    >
                                        {/* Icon */}
                                        <div style={{
                                            width: 38, height: 38, borderRadius: 10,
                                            background: cfg.bg,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 18, flexShrink: 0,
                                        }}>
                                            {cfg.icon}
                                        </div>

                                        {/* Content */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                fontWeight: isUnread ? 700 : 500,
                                                fontSize: 13.5,
                                                color: '#0d1f1c',
                                                marginBottom: 3,
                                            }}>
                                                {data.title || 'Notifikasi'}
                                            </div>
                                            <div style={{
                                                fontSize: 12.5, color: '#3d5a54',
                                                lineHeight: 1.45,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                            }}>
                                                {data.message}
                                            </div>
                                            <div style={{ fontSize: 11, color: '#7a9991', marginTop: 5 }}>
                                                {timeAgo(notif.created_at)}
                                            </div>
                                        </div>

                                        {/* Unread dot */}
                                        {isUnread && (
                                            <div style={{
                                                width: 8, height: 8, borderRadius: '50%',
                                                background: '#0a7c6e', flexShrink: 0, marginTop: 6,
                                            }} />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div style={{
                            padding: '12px 20px', borderTop: '1px solid #f0f4f3',
                            textAlign: 'center', fontSize: 12.5, color: '#7a9991',
                        }}>
                            Menampilkan {notifications.length} notifikasi terbaru
                        </div>
                    )}
                </div>
                </>
            )}
        </div>
    );
}
