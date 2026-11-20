import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, RefreshCw, Trophy } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { apiRequest, assetUrl } from '../../services/api.js'
import './LiveLeaderboard.css'

function LiveLeaderboardPage() {
  const navigate = useNavigate()

  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

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

  return (
    <main className="leaderboard-page">
      <header className="leaderboard-page-header">
        <button
          type="button"
          className="leaderboard-back-button"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={17} />
          Back to Home
        </button>
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

              return (
                <div className="leaderboard-item" key={artwork.id}>
                  <div className="leaderboard-rank">
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  <div className="leaderboard-artwork-image">
                    <img
                      src={assetUrl(artwork.image_url)}
                      alt={artwork.title}
                    />
                  </div>

                  <div className="leaderboard-artwork-info">
                    <span className="leaderboard-art-code">
                      {artwork.art_code}
                    </span>

                    <h3>{artwork.title}</h3>

                    <div className="leaderboard-progress">
                      <div
                        className="leaderboard-progress-fill"
                        style={{
                          width: `${Math.min(100, Math.max(0, percentage))}%`,
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
          <span>
            <RefreshCw size={13} />
            Automatically updates every 5 seconds
          </span>
          <span>LNBTI Japanese Club</span>
        </div>
      </section>
    </main>
  )
}

export default LiveLeaderboardPage
