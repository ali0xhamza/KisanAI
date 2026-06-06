import { useTranslation } from 'react-i18next'

export default function LanguageToggle() {
  const { i18n } = useTranslation()

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button
        disabled
        style={{
          padding: '6px 14px',
          borderRadius: '20px',
          border: '1px solid #d1d5db',
          background: '#f5f5f5',
          color: '#aaa',
          fontFamily: 'inherit',
          cursor: 'not-allowed',
          fontSize: '13px',
          opacity: 0.65,
          pointerEvents: 'none'
        }}
      >
        اردو
      </button>
      <span style={{
        fontSize: '11px',
        color: '#16a34a',
        fontWeight: '600',
        background: '#dcfce7',
        padding: '2px 8px',
        borderRadius: '10px',
        whiteSpace: 'nowrap'
      }}>
        Coming Soon
      </span>
    </div>
  )
}