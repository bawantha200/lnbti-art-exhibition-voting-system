import { useState } from 'react'
import { ImagePlus, ArrowRight, X } from 'lucide-react'

function UploadModal({ onClose, onSubmit, loading, error }) {
  const [artCode, setArtCode] = useState('')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)

  const submit = (event) => {
    event.preventDefault()

    if (!file) return

    const data = new FormData()
    data.append('artCode', artCode)
    data.append('title', title)
    data.append('image', file)

    onSubmit(data)
  }

  return (
    <div className="modal-backdrop admin-modal-backdrop">
      <form
        className="confirm-modal upload-modal"
        onSubmit={submit}
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          disabled={loading}
        >
          <X size={18} />
        </button>

        <div className="eyebrow">New exhibition entry</div>

        <h3>Upload artwork</h3>

        <p>
          Add a new work to the live gallery. Images are validated
          and optimized for the voting experience.
        </p>

        <label className="upload-drop">
          <ImagePlus size={26} />

          <strong>
            {file ? file.name : 'Choose an image'}
          </strong>

          <span>JPEG, PNG or WEBP · max 10MB</span>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) =>
              setFile(event.target.files?.[0] || null)
            }
          />
        </label>

        <div className="upload-fields">
          <label>
            Artwork ID
            <input
              value={artCode}
              onChange={(event) => setArtCode(event.target.value)}
              placeholder="ART-25"
              required
            />
          </label>

          <label>
            Title
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter artwork title"
            />
          </label>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="modal-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className="primary-button"
            disabled={loading || !file}
          >
            {loading ? 'Uploading…' : 'Add artwork'}
            {!loading && <ArrowRight size={17} />}
          </button>
        </div>
      </form>
    </div>
  )
}

export default UploadModal
