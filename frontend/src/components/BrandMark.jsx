import { useNavigate } from 'react-router-dom'

function BrandMark({ compact = false }) {
  const navigate = useNavigate()

  return (
    <div
      className={`brand-mark ${compact ? 'brand-mark--compact' : ''}`}
      onClick={() => navigate('/')}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          navigate('/')
        }
      }}
      style={{ cursor: 'pointer' }}
      aria-label="Go to home page"
    >
      <img src="/assets/logo_jp.png" alt="LNBTI Japanese Club" />
      <span className="brand-name">
        LNBTI <b>Japanese Club</b>
      </span>
    </div>
  )
}

export default BrandMark
