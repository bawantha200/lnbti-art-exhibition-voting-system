import { ArrowRight, ChevronLeft, CircleHelp } from 'lucide-react'
import ArtworkCard from '../../components/ArtworkCard'

function GalleryScreen({
  artworks,
  selected,
  toggleArtwork,
  onSubmit,
  onBack,
  error,
}) {
  return (
    <section className="gallery-page">
      <div className="gallery-head">
        <div>
          <button className="back-button" onClick={onBack}>
            <ChevronLeft size={18} /> Back
          </button>

          <div className="eyebrow">Step 03 · The exhibition</div>

          <h2>Which works speak to you?</h2>
          <p>Select between one and three artworks. Take your time.</p>
        </div>

        <div className="selection-counter">
          <span>{selected.length}</span> / 3
          <small>Selected</small>
        </div>
      </div>

      {error && <div className="form-error gallery-error">{error}</div>}

      {!artworks.length ? (
        <div className="empty-state">
          No active artworks are available right now.
        </div>
      ) : (
        <div className="art-grid">
          {artworks.map((artwork) => (
            <ArtworkCard
              key={artwork.id}
              artwork={artwork}
              isSelected={selected.includes(artwork.id)}
              onToggle={() => toggleArtwork(artwork.id)}
              disabled={
                !selected.includes(artwork.id) && selected.length >= 3
              }
            />
          ))}
        </div>
      )}

      <div className="gallery-actions">
        <span>
          <CircleHelp size={15} />
          You can change your selection until you submit.
        </span>

        <button
          className="primary-button"
          onClick={onSubmit}
          disabled={!selected.length}
        >
          Review my choices <ArrowRight size={18} />
        </button>
      </div>
    </section>
  )
}

export default GalleryScreen
