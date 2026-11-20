import { useCallback, useEffect, useState } from 'react'
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Trophy,
  RefreshCw,
} from 'lucide-react'

import BrandMark from '../../components/BrandMark'
import { apiRequest, assetUrl } from '../../services/api.js'
import './LiveLeaderboard.css'

function WelcomeScreen({ onStart }) {
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
    <>
      <section className="welcome-page">
        <div className="welcome-art-panel">
          <div className="vertical-label">
            日本美術展覧会・コンテスト · 2026
          </div>

          <div className="circle-art">
            <span>静</span>
          </div>

          <div className="brush-stroke brush-one" />
          <div className="brush-stroke brush-two" />

          <div className="art-caption">
            <span>01</span>
            <span>THE ART OF<br />PAUSE</span>
          </div>
        </div>

        <div className="welcome-copy">
          <BrandMark />

          <div className="eyebrow">
            <Sparkles size={14} />
            Annual Student Art Exhibition & Competition
          </div>

          <h1>
            Choose the art<br />
            <em>that moves you.</em>
          </h1>

          <p className="lead">
            Take a moment. Look closely. Then cast your vote for up to three works that stayed with you.
          </p>

          <button className="primary-button start-button" onClick={onStart}>
            Start voting <ArrowRight size={18} />
          </button>

          <div className="welcome-note">
            <ShieldCheck size={16} />
            <span>Your vote is private and can only be cast once.</span>
          </div>

          <div className="welcome-footer">
            <span>Presented by LNBTI Japanese Club</span>
            <span>
              Scroll to explore <span className="scroll-line" />
            </span>
          </div>
        </div>
      </section>

      {/* Live Leaderboard */}
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
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="leaderboard-message">
            No artworks are available yet.
          </div>
        ) : (
          <div className="leaderboard-list">
            {leaderboard.map((artwork, index) => (
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
                        width: `${Number(artwork.percentage) || 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="leaderboard-percentage">
                  {Number(artwork.percentage).toFixed(1)}%
                </div>
              </div>
            ))}
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
    </>
  )
}

export default WelcomeScreen
