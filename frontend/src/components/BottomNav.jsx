import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function BottomNav() {
  const { t } = useTranslation()

  const NAV_ITEMS = [
    { to: '/',         icon: '🏠', label: t('nav.home')    },
    { to: '/chat',     icon: '🤖', label: t('nav.chat')    },
    { to: '/disease',  icon: '🔬', label: t('nav.disease') },
    { to: '/mandi',    icon: '💰', label: t('nav.mandi')   },
    { to: '/settings', icon: '⚙️', label: 'Settings'       },
  ]

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 68,
      background: 'white',
      borderTop: '1px solid #E8F4E8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '0 4px',
      boxShadow: '0 -2px 16px rgba(0,0,0,0.08)',
      zIndex: 1000,
    }}>
      {NAV_ITEMS.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          style={{ textDecoration: 'none', flex: 1 }}
        >
          {({ isActive }) => (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 3, padding: '6px 0',
            }}>
              <div style={{
                width: 40, height: 34, borderRadius: 10,
                background: isActive ? '#E8F5E9' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
                transform: isActive ? 'scale(1.08)' : 'scale(1)',
              }}>
                <span style={{ fontSize: 22 }}>{item.icon}</span>
              </div>
              <span style={{
                fontSize: 10, fontWeight: isActive ? 700 : 500,
                color: isActive ? '#1B4D2E' : '#888',
                fontFamily: 'system-ui, sans-serif',
                lineHeight: 1,
              }}>{item.label}</span>
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  )
}