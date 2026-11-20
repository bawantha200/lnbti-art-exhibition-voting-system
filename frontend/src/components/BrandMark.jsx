function BrandMark({ compact = false }) {
  return (
    <div className={`brand-mark ${compact ? 'brand-mark--compact' : ''}`}>
      <img src="/assets/logo_jp.png" alt="LNBTI Japanese Club" />
      <span className="brand-name">
        LNBTI <b>Japanese Club</b>
      </span>
    </div>
  )
}

export default BrandMark
