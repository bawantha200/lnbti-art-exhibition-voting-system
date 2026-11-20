import { ArrowRight, Check, CheckCircle2, X } from 'lucide-react'

function ConfirmModal({
  selected,
  artworks,
  error,
  loading,
  onCancel,
  onConfirm,
}) {
  const names = selected.map(
    (id) => artworks.find((artwork) => artwork.id === id)?.art_code || id
  )

  return (
    <div className="modal-backdrop">
      <div className="confirm-modal">
        <button
          className="modal-close"
          onClick={onCancel}
          disabled={loading}
        >
          <X size={18} />
        </button>

        <div className="modal-icon">
          <CheckCircle2 size={23} />
        </div>

        <div className="eyebrow">One last look</div>

        <h3>Ready to submit?</h3>

        <p>
          Your selection will be final and you won't be able to vote again in this exhibition.
        </p>

        <div className="chosen-list">
          {names.map((id) => (
            <span key={id}>
              <Check size={14} /> {id}
            </span>
          ))}
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="modal-actions">
          <button
            className="secondary-button"
            onClick={onCancel}
            disabled={loading}
          >
            Keep browsing
          </button>

          <button
            className="primary-button"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Submitting…' : 'Submit my votes'}
            {!loading && <ArrowRight size={17} />}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
