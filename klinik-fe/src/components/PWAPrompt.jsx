// src/components/PWAPrompt.jsx
import { useState, useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export default function PWAPrompt() {
  // Kelola lifecycle Service Worker
  const {
    needRefresh: [needRefresh],
    updateServiceWorker
  } = useRegisterSW({
    onRegistered(r) {
      // Polling update setiap jam — best practice production
      r && setInterval(() => r.update(), 60 * 60 * 1000)
    }
  })

  const [installPrompt, setInstallPrompt] = useState(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Browser fire event ini sebelum tampilkan prompt native
    const handler = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
      setIsInstallable(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Kalau sudah standalone (terinstall), sembunyikan banner
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setIsInstallable(false)
      setInstallPrompt(null)
    }
  }

  // Warna klinik dari GLOBAL_CSS
  const primary = '#0a7c6e'
  const primaryLight = '#e6f4f2'

  const bannerStyle = {
    position: 'fixed', bottom: '1.25rem', left: '50%',
    transform: 'translateX(-50%)',
    width: 'min(92vw, 420px)',
    background: '#fff',
    borderRadius: '16px',
    padding: '14px 18px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: '12px',
    zIndex: 99999,
    border: `1px solid ${primaryLight}`,
    fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
  }

  return (
    <>
      {/* ── UPDATE BANNER ── */}
      {needRefresh && (
        <div style={bannerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>🔄</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0d1f1c' }}>
              Versi baru tersedia!
            </span>
          </div>
          <button
            onClick={() => updateServiceWorker(true)}
            style={{
              background: primary, color: '#fff', border: 'none',
              padding: '8px 16px', borderRadius: '8px',
              cursor: 'pointer', fontSize: '13px', fontWeight: 700,
              fontFamily: 'inherit', whiteSpace: 'nowrap',
            }}
          >
            Perbarui
          </button>
        </div>
      )}

      {/* ── INSTALL BANNER ── */}
      {isInstallable && !dismissed && !needRefresh && (
        <div style={bannerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Logo klinik mini */}
            <div style={{
              width: 44, height: 44, flexShrink: 0,
              background: `linear-gradient(135deg, ${primary}, #14a090)`,
              borderRadius: 10, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
            }}>🏥</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0d1f1c', marginBottom: 2 }}>
                Install Klinik Sehat
              </div>
              <div style={{ fontSize: 12, color: '#7a9991' }}>
                Akses cepat, bisa dibuka offline
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button
              onClick={() => setDismissed(true)}
              style={{
                background: 'transparent', color: '#7a9991',
                border: '1px solid #e2ebe8', padding: '7px 12px',
                borderRadius: '8px', cursor: 'pointer',
                fontSize: '12px', fontFamily: 'inherit',
              }}
            >
              Nanti
            </button>
            <button
              onClick={handleInstall}
              style={{
                background: primary, color: '#fff', border: 'none',
                padding: '7px 14px', borderRadius: '8px',
                cursor: 'pointer', fontSize: '13px', fontWeight: 700,
                fontFamily: 'inherit',
              }}
            >
              Install
            </button>
          </div>
        </div>
      )}
    </>
  )
}