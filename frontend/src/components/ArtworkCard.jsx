import { ArrowRight, Check, Plus } from 'lucide-react'
import { assetUrl } from '../services/api.js'

function ArtworkCard({ artwork, isSelected, onToggle, disabled }) {
  return (
    <button
      className={`art-card ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={onToggle}
      disabled={disabled}
    >
      <div
        className={`art-image ${artwork.style}`}
        style={{
          '--tone-a': artwork.colors[0],
          '--tone-b': artwork.colors[1],
        }}
      >
        {artwork.image_url ? (
          <img src={assetUrl(artwork.image_url)} alt={artwork.title} />
        ) : (
          <div className="art-shape" />
        )}

        <span className="art-number">{artwork.art_code}</span>

        <span className="selection-indicator">
          {isSelected ? <Check size={18} /> : <Plus size={18} />}
        </span>
      </div>

      <div className="art-card-footer">
        <div>
          <strong>{artwork.title}</strong>
          <span>{artwork.artist}</span>
        </div>

        <span className="card-arrow">
          <ArrowRight size={17} />
        </span>
      </div>
    </button>
  )
}

export default ArtworkCard
