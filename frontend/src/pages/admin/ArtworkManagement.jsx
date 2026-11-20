import {
  Search,
  UploadCloud,
  Eye,
  Trash2,
} from 'lucide-react'
import { assetUrl } from '../../services/api.js'

function ArtworkManagement({
  filtered,
  search,
  setSearch,
  onUpload,
  onEdit,
  onDeactivate,
}) {
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
          <UploadCloud size={17} /> Upload artwork
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
                  className={`table-thumb ${art.style}`}
                  style={{
                    '--tone-a': art.colors[0],
                    '--tone-b': art.colors[1],
                  }}
                >
                  {art.image_url && (
                    <img src={assetUrl(art.image_url)} alt="" />
                  )}
                </div>

                <span>
                  <strong>{art.title}</strong>
                  <small>{art.art_code}</small>
                </span>
              </div>

              <span className="status-badge status-badge--open">
                <span /> Active
              </span>

              <strong>{art.total_votes || 0}</strong>

              <div className="row-actions">
                <button
                  className="icon-button"
                  onClick={() => onEdit(art)}
                  title="Edit title"
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
    </div>
  )
}

export default ArtworkManagement
