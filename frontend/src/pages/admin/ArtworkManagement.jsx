import { useState } from 'react'
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
} from 'lucide-react'

import { assetUrl } from '../../services/api.js'
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

  const handleEdit = () => {
    if (!selectedArtwork) return

    onEdit(selectedArtwork)
    setSelectedArtwork(null)
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
            No active artworks found.
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
                  <strong>{art.title}</strong>
                  <small>{art.art_code}</small>
                </span>
              </div>

              <span className="status-badge status-badge--open">
                <span />
                Active
              </span>

              <strong>{art.total_votes || 0}</strong>

              <div className="row-actions">
                <button
                  className="icon-button"
                  onClick={() => setSelectedArtwork(art)}
                  title="View artwork details"
                >
                  <Eye size={16} />
                </button>

                <button
                  className="icon-button"
                  onClick={() => onDeactivate(art.id)}
                  title="Deactivate"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Artwork Details Modal */}
      {selectedArtwork && (
        <div
          className="artwork-details-overlay"
          onClick={() => setSelectedArtwork(null)}
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
                  Artwork Details
                </h2>
              </div>

              <button
                type="button"
                className="artwork-details-close"
                onClick={() => setSelectedArtwork(null)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

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
                      <strong>
                        {selectedArtwork.art_code || 'N/A'}
                      </strong>
                    </div>
                  </div>

                  <div className="artwork-detail-item">
                    <div className="artwork-detail-icon">
                      <Vote size={18} />
                    </div>

                    <div>
                      <small>Total Votes</small>
                      <strong>
                        {selectedArtwork.total_votes || 0}
                      </strong>
                    </div>
                  </div>

                  <div className="artwork-detail-item">
                    <div className="artwork-detail-icon">
                      <CheckCircle2 size={18} />
                    </div>

                    <div>
                      <small>Status</small>
                      <strong className="artwork-detail-active">
                        Active
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="artwork-details-footer">
              <button
                type="button"
                className="artwork-details-cancel"
                onClick={() => setSelectedArtwork(null)}
              >
                Close
              </button>

              <button
                type="button"
                className="artwork-details-edit"
                onClick={handleEdit}
              >
                <Pencil size={16} />
                Edit Artwork
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ArtworkManagement