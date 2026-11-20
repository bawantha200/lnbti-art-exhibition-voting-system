import { useEffect, useState } from 'react'
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Trophy,
  RefreshCw,
} from 'lucide-react'

import BrandMark from '../../components/BrandMark'
import { apiRequest, assetUrl } from '../../services/api'
import './LiveLeaderboard.css'

function WelcomeScreen({ onStart }) {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [leaderboardError, setLeaderboardError] = useState(false)

  useEffect(() => {
    let isMounted = true

    const fetchLeaderboard = async () => {
      try {
        const data = await apiRequest('/leaderboard')

        if (isMounted) {
          setLeaderboard(Array.isArray(data) ? data : [])
          setLeaderboardError(false)
        }
      } catch (error) {
        console.error('Leaderboard loading failed:', error)

        if (isMounted) {
          setLeaderboardError(true)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchLeaderboard()

    const interval = setInterval(fetchLeaderboard, 4000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

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

      {/* Public Live Leaderboard */}
      <section className="live-leaderboard-section">
        <div className="leaderboard-container">

          <div className="leaderboard-heading">
            <div>
              <div className="leaderboard-eyebrow">
                <Trophy size={15} />
                STUDENT ART COMPETITION
              </div>

              <h2>Live Leaderboard</h2>

              <p>
                Discover the artworks leading the competition.
              </p>
            </div>

            <div className="live-status">
              <span className="live-indicator" />
              LIVE
            </div>
          </div>

          <div className="leaderboard-update">
            <RefreshCw size={13} />
            Automatically updates every 4 seconds
          </div>

          {loading ? (
            <div className="leaderboard-message">
              Loading leaderboard...
            </div>
          ) : leaderboardError ? (
            <div className="leaderboard-message">
              Unable to load leaderboard. Please try again later.
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="leaderboard-message">
              No active artworks available yet.
            </div>
          ) : (
            <div className="leaderboard-list">
              {leaderboard.map((artwork, index) => (
                <div
                  className={`leaderboard-item ${index < 3 ? `rank-${index + 1}` : ''}`}
                  key={artwork.id}
                >
                  <div className="leaderboard-rank">
                    {index === 0 ? (
                      <Trophy size={21} />
                    ) : (
                      String(index + 1).padStart(2, '0')
                    )}
                  </div>

                  <div className="leaderboard-artwork-image">
                    {artwork.image_url ? (
                      <img
                        src={assetUrl(artwork.image_url)}
                        alt={artwork.title}
                        loading="lazy"
                      />
                    ) : (
                      <div className="leaderboard-no-image">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="leaderboard-artwork-info">
                    <span className="leaderboard-art-code">
                      {artwork.art_code}
                    </span>

                    <h3>{artwork.title}</h3>
                  </div>

                  <div className="leaderboard-votes">
                    <strong>
                      {Number(artwork.total_votes).toLocaleString()}
                    </strong>
                    <span>
                      {Number(artwork.total_votes) === 1 ? 'VOTE' : 'VOTES'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="leaderboard-footer">
            <span>Presented by LNBTI Japanese Club</span>
            <span>2026 · Art Exhibition & Competition</span>
          </div>

        </div>
      </section>
    </>
  )
}

export default WelcomeScreen
