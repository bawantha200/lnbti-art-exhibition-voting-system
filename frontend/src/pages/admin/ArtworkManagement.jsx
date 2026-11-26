import { useEffect, useState } from 'react'
import {
  Search,
  UploadCloud,
  Eye,
  Trash2,
  X,
  Image as ImageIcon,
  Pencil,
  Vote,
  Tag,
  CheckCircle2,
  Mail,
  CalendarClock,
  LoaderCircle,
  Save,
} from 'lucide-react'

import { apiRequest, assetUrl } from '../../services/api.js'
import './ArtworkManagement.css'

function ArtworkManagement({
  filtered,
  search,
  setSearch,
  onUpload,
  onEdit,
  onDeactivate,
}) {
  const [selectedArtwork, setSelectedArtwork] = useState(null)
  const [editing, setEditing] = useState(false)

  const [title, setTitle] = useState('')
  const [artCode, setArtCode] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [image, setImage] = useState(null)

  const [voters, setVoters] = useState([])
  const [voteLoading, setVoteLoading] = useState(false)
  const [voteError, setVoteError] = useState('')

  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState('')
  const [showVoters, setShowVoters] = useState(false)

  // Custom confirmation modal state
  const [confirmArtwork, setConfirmArtwork] = useState(null)
  const [deactivating, setDeactivating] = useState(false)
  const [deactivateError, setDeactivateError] = useState('')

  useEffect(() => {
    if (!selectedArtwork) return undefined

    let cancelled = false

    async function loadVotes() {
      setVoteLoading(true)
      setVoteError('')

      try {
        const data = await apiRequest(
          `/admin/artworks/${selectedArtwork.id}/votes`
        )

        if (!cancelled) {
          setVoters(Array.isArray(data?.voters) ? data.voters : [])
        }
      } catch (error) {
        if (!cancelled) {
          setVoteError(error.message || 'Unable to load vote details.')
        }
      } finally {
        if (!cancelled) {
          setVoteLoading(false)
        }
      }
    }

    loadVotes()

    return () => {
      cancelled = true
    }
  }, [selectedArtwork])

  const closeModal = () => {
    setSelectedArtwork(null)
    setEditing(false)
    setImage(null)
    setEditError('')
    setVoters([])
    setVoteError('')
    setShowVoters(false)
  }

  const handleConfirmDeactivate = async () => {
    if (!confirmArtwork || deactivating) return

    setDeactivating(true)
    setDeactivateError('')

    try {
      const result = await onDeactivate(confirmArtwork.id)

      // If the parent callback explicitly returns false, keep the modal open.
      if (result === false) {
        setDeactivateError('Unable to deactivate artwork. Please try again.')
        return
      }

      setConfirmArtwork(null)
    } catch (error) {
      setDeactivateError(error.message || 'Unable to deactivate artwork.')
    } finally {
      setDeactivating(false)
    }
  }

  const startEditing = () => {
    if (!selectedArtwork) return

    setTitle(selectedArtwork.title || '')
    setArtCode(selectedArtwork.art_code || '')
    setIsActive(Boolean(selectedArtwork.is_active))
    setImage(null)
    setEditError('')
    setEditing(true)
  }

  const handleEdit = async (event) => {
    event.preventDefault()

    if (!selectedArtwork) return

    const formData = new FormData()

    formData.append('title', title.trim())
    formData.append('artCode', artCode.trim())
    formData.append('isActive', String(isActive))

    if (image) {
      formData.append('image', image)
    }

    setSaving(true)
    setEditError('')

    try {
      const success = await onEdit(selectedArtwork.id, formData)

      if (success) {
        closeModal()
      } else {
        setEditError('Unable to update artwork. Please try again.')
      }
    } catch (error) {
      setEditError(error.message || 'Unable to update artwork.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="dashboard-content">
      <div className="content-toolbar">
        <div className="search-box">
          <Search size={17} />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search artworks..."
          />
        </div>

        <button className="primary-button" onClick={onUpload}>
          <UploadCloud size={17} />
          Upload artwork
        </button>
      </div>

      <section className="panel artwork-table-panel">
        <div className="table-header">
          <span>Artwork</span>
          <span>Status</span>
          <span>Votes</span>
          <span>Actions</span>
        </div>

        {!filtered.length ? (
          <div className="empty-state">
            No artworks found.
          </div>
        ) : (
          filtered.map((art) => (
            <div className="table-row" key={art.id}>
              <div className="table-art">
                <div
                  className={`table-thumb ${art.style || ''}`}
                  style={{
                    '--tone-a': art.colors?.[0] || '#e5e7eb',
                    '--tone-b': art.colors?.[1] || '#f3f4f6',
                  }}
                >
                  {art.image_url && (
                    <img
                      src={assetUrl(art.image_url)}
                      alt={art.title || 'Artwork'}
                    />
                  )}
                </div>

                <span>
                  <strong>{art.title || 'Untitled Artwork'}</strong>
                  <small>{art.art_code}</small>
                </span>
              </div>

              <span
                className={`status-badge ${
                  art.is_active
                    ? 'status-badge--open'
                    : 'status-badge--inactive'
                }`}
              >
                <span />
                {art.is_active ? 'Active' : 'Inactive'}
              </span>

              <strong>{art.total_votes || 0}</strong>

              <div className="row-actions">
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => {
                    setSelectedArtwork(art)
                    setEditing(false)
                  }}
                  title="View artwork details"
                  aria-label="View artwork details"
                >
                  <Eye size={16} />
                </button>

                {art.is_active && (
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => {
                      setDeactivateError('')
                      setConfirmArtwork(art)
                    }}
                    title="Deactivate"
                    aria-label="Deactivate artwork"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </section>

      {/* Artwork Details and Edit Modal */}
      {selectedArtwork && (
        <div
          className="artwork-details-overlay"
          onClick={closeModal}
        >
          <div
            className="artwork-details-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="artwork-details-title"
          >
            <div className="artwork-details-header">
              <div>
                <span className="artwork-details-eyebrow">
                  ARTWORK INFORMATION
                </span>

                <h2 id="artwork-details-title">
                  {editing ? 'Edit Artwork' : 'Artwork Details'}
                </h2>
              </div>

              <button
                type="button"
                className="artwork-details-close"
                onClick={closeModal}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {editing ? (
              <form onSubmit={handleEdit}>
                <div className="artwork-details-body artwork-edit-body">
                  <div className="artwork-edit-image">
                    <img
                      src={
                        image
                          ? URL.createObjectURL(image)
                          : assetUrl(selectedArtwork.image_url)
                      }
                      alt="Artwork preview"
                    />

                    <label className="artwork-image-upload">
                      <UploadCloud size={16} />
                      Change image

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) => {
                          setImage(event.target.files?.[0] || null)
                        }}
                      />
                    </label>

                    {image && (
                      <span className="artwork-selected-file">
                        {image.name}
                      </span>
                    )}
                  </div>

                  <div className="artwork-edit-fields">
                    <label>
                      Artwork Title
                      <input
                        type="text"
                        value={title}
                        maxLength={160}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="Enter artwork title"
                      />
                    </label>

                    <label>
                      Artwork Code
                      <input
                        type="text"
                        value={artCode}
                        onChange={(event) => setArtCode(event.target.value)}
                        placeholder="ART-01"
                      />
                    </label>

                    <label>
                      Artwork Status
                      <select
                        value={String(isActive)}
                        onChange={(event) => {
                          setIsActive(event.target.value === 'true')
                        }}
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </label>
                  </div>
                </div>

                {editError && (
                  <p className="artwork-edit-error">{editError}</p>
                )}

                <div className="artwork-details-footer">
                  <button
                    type="button"
                    className="artwork-details-cancel"
                    onClick={() => setEditing(false)}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="artwork-details-edit"
                    disabled={saving || !artCode.trim()}
                  >
                    {saving ? (
                      <>
                        <LoaderCircle size={16} className="artwork-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="artwork-details-body">
                  <div className="artwork-details-image">
                    {selectedArtwork.image_url ? (
                      <img
                        src={assetUrl(selectedArtwork.image_url)}
                        alt={selectedArtwork.title || 'Artwork'}
                      />
                    ) : (
                      <div className="artwork-details-no-image">
                        <ImageIcon size={42} />
                        <span>No artwork image available</span>
                      </div>
                    )}
                  </div>

                  <div className="artwork-details-info">
                    <div className="artwork-details-title">
                      <span>Artwork Title</span>
                      <h3>
                        {selectedArtwork.title || 'Untitled Artwork'}
                      </h3>
                    </div>

                    <div className="artwork-details-grid">
                      <div className="artwork-detail-item">
                        <div className="artwork-detail-icon">
                          <Tag size={18} />
                        </div>
                        <div>
                          <small>Artwork Code</small>
                          <strong>{selectedArtwork.art_code}</strong>
                        </div>
                      </div>

                      <div className="artwork-detail-item">
                        <div className="artwork-detail-icon">
                          <Vote size={18} />
                        </div>
                        <div>
                          <small>Total Votes</small>
                          <strong>{voters.length}</strong>
                        </div>
                      </div>

                      <div className="artwork-detail-item">
                        <div className="artwork-detail-icon">
                          <CheckCircle2 size={18} />
                        </div>
                        <div>
                          <small>Status</small>
                          <strong
                            className={
                              selectedArtwork.is_active
                                ? 'artwork-detail-active'
                                : 'artwork-detail-inactive'
                            }
                          >
                            {selectedArtwork.is_active ? 'Active' : 'Inactive'}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Students who voted */}
                
                {/* Students who voted */}
                <section className="artwork-voters-section">
                  <div className="artwork-voters-heading">
                    <div>
                      <span className="artwork-details-eyebrow">
                        VOTING INFORMATION
                      </span>
                      <h3>Students Who Voted</h3>
                      <span className="artwork-voters-count">
                        {voters.length} total votes
                      </span>
                    </div>

                    <button
                      type="button"
                      className="artwork-voters-toggle"
                      onClick={() => setShowVoters((previous) => !previous)}
                    >
                      {showVoters ? 'Hide Voters' : 'View Voters'}
                    </button>
                  </div>

                  {showVoters && (
                    <>
                      {voteLoading ? (
                        <div className="artwork-voters-message">
                          <LoaderCircle size={18} className="artwork-spin" />
                          Loading vote details...
                        </div>
                      ) : voteError ? (
                        <div className="artwork-voters-message artwork-voters-error">
                          {voteError}
                        </div>
                      ) : voters.length === 0 ? (
                        <div className="artwork-voters-message">
                          No students have voted for this artwork yet.
                        </div>
                      ) : (
                        <div className="artwork-voters-list">
                          {voters.map((voter) => (
                            <div
                              className="artwork-voter-row"
                              key={`${voter.email}-${voter.voted_at}`}
                            >
                              <div className="artwork-voter-email">
                                <Mail size={16} />
                                <span>{voter.email}</span>
                              </div>

                              <div className="artwork-voter-date">
                                <CalendarClock size={14} />
                                <span>
                                  {new Date(voter.voted_at).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </section>


                <div className="artwork-details-footer">
                  <button
                    type="button"
                    className="artwork-details-cancel"
                    onClick={closeModal}
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    className="artwork-details-edit"
                    onClick={startEditing}
                  >
                    <Pencil size={16} />
                    Edit Artwork
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      {confirmArtwork && (
        <div
          className="artwork-confirm-overlay"
          onClick={() => {
            if (!deactivating) {
              setConfirmArtwork(null)
              setDeactivateError('')
            }
          }}
        >
          <div
            className="artwork-confirm-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="artwork-confirm-title"
            aria-describedby="artwork-confirm-description"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="artwork-confirm-icon">
              <Trash2 size={23} />
            </div>

            <h2 id="artwork-confirm-title">Confirm Deactivation</h2>

            <p id="artwork-confirm-description">
              Are you sure you want to deactivate
              <strong> {confirmArtwork.title || 'this artwork'}</strong>?
              This artwork will no longer be available for voting.
              Existing vote records will be retained.
            </p>

            {deactivateError && (
              <p className="artwork-confirm-error" role="alert">
                {deactivateError}
              </p>
            )}

            <div className="artwork-confirm-actions">
              <button
                type="button"
                className="artwork-confirm-no"
                disabled={deactivating}
                onClick={() => {
                  setConfirmArtwork(null)
                  setDeactivateError('')
                }}
              >
                No, Cancel
              </button>

              <button
                type="button"
                className="artwork-confirm-yes"
                disabled={deactivating}
                onClick={handleConfirmDeactivate}
              >
                {deactivating ? (
                  <>
                    <LoaderCircle size={15} className="artwork-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Yes, Deactivate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ArtworkManagement
