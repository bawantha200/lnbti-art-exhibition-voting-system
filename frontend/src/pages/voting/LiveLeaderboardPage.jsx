
import { useCallback, useEffect, useState } from 'react'
import {
  RefreshCw,
  Trophy,
  X,
  ZoomIn,
} from 'lucide-react'

import BrandMark from '../../components/BrandMark'
import { apiRequest, assetUrl } from '../../services/api.js'
import './LiveLeaderboard.css'

function LiveLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selectedArtwork, setSelectedArtwork] = useState(null)

  const fetchLeaderboard = useCallback(async () => {
    try {
      const data = await apiRequest('/leaderboard')
      setLeaderboard(Array.isArray(data) ? data : [])
      setError(false)
    } catch (err) {
      console.error('Leaderboard loading failed:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeaderboard()

    const interval = setInterval(fetchLeaderboard, 5000)

    return () => clearInterval(interval)
  }, [fetchLeaderboard])

  useEffect(() => {
    if (!selectedArtwork) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedArtwork(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [selectedArtwork])

  return (
    <main className="leaderboard-page">
      <header className="topbar">
        <BrandMark compact />

        <div className="topbar-meta">
          <span className="live-dot" />
          Live leaderboard · 2026 Exhibition
        </div>
      </header>

      <section className="live-leaderboard">
        <div className="leaderboard-heading">
          <div>
            <div className="leaderboard-eyebrow">
              <Trophy size={15} />
              LIVE RESULTS
            </div>

            <h2>People's Choice</h2>

            <p>
              Discover the artworks currently leading the exhibition.
            </p>
          </div>

          <div className="live-indicator">
            <span className="live-dot" />
            LIVE
          </div>
        </div>

        {loading ? (
          <div className="leaderboard-message">
            <RefreshCw className="loading-icon" size={22} />
            <span>Loading leaderboard...</span>
          </div>
        ) : error ? (
          <div className="leaderboard-message">
            Unable to load leaderboard. Please try again later.

            <button
              type="button"
              className="leaderboard-retry-button"
              onClick={fetchLeaderboard}
            >
              Try Again
            </button>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="leaderboard-message">
            No artworks are available yet.
          </div>
        ) : (
          <div className="leaderboard-list">
            {leaderboard.map((artwork, index) => {
              const percentage = Number(artwork.percentage) || 0
              const imageUrl = assetUrl(artwork.image_url)

              return (
                <div className="leaderboard-item" key={artwork.id}>
                  <div className="leaderboard-rank">
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  <button
                    type="button"
                    className="leaderboard-artwork-image"
                    onClick={() =>
                      setSelectedArtwork({
                        ...artwork,
                        imageUrl,
                      })
                    }
                    aria-label={`View ${artwork.title} image`}
                  >
                    <img
                      src={imageUrl}
                      alt={artwork.title}
                    />

                    <span className="image-zoom-hint">
                      <ZoomIn size={18} />
                    </span>
                  </button>

                  <div className="leaderboard-artwork-info">
                    <span className="leaderboard-art-code">
                      {artwork.art_code}
                    </span>

                    <h3>{artwork.title}</h3>

                    <div className="leaderboard-progress">
                      <div
                        className="leaderboard-progress-fill"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(0, percentage)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="leaderboard-percentage">
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="leaderboard-footer">
          <span>LNBTI Japanese Club</span>
        </div>
      </section>

      {selectedArtwork && (
        <div
          className="artwork-lightbox"
          onClick={() => setSelectedArtwork(null)}
          role="presentation"
        >
          <button
            type="button"
            className="lightbox-close"
            onClick={() => setSelectedArtwork(null)}
            aria-label="Close image preview"
          >
            <X size={25} />
          </button>

          <div
            className="lightbox-content"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={selectedArtwork.imageUrl}
              alt={selectedArtwork.title}
            />

            <div className="lightbox-caption">
              <span>{selectedArtwork.art_code}</span>
              <h3>{selectedArtwork.title}</h3>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default LiveLeaderboardPage
