import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Palette,
  Power,
  Settings,
} from 'lucide-react'

import { apiRequest } from '../../services/api.js'

import BrandMark from '../../components/BrandMark'
import AdminNav from '../../components/AdminNav'
import StatCard from '../../components/StatCard'
import UploadModal from '../../components/UploadModal'
import ResetVotesModal from '../../components/ResetVotesModal'

import AdminLogin from './AdminLogin'
import Overview from './Overview'
import ArtworkManagement from './ArtworkManagement'
import Leaderboard from './Leaderboard'

// Artwork visual styles
const artStyles = [
  { style: 'mist', colors: ['#c7d0ca', '#eef0e7'] },
  { style: 'sun', colors: ['#d17c58', '#f2c17b'] },
  { style: 'crimson', colors: ['#9f222d', '#e9b98c'] },
  { style: 'ink', colors: ['#29353c', '#b6c8bf'] },
  { style: 'blue', colors: ['#507c8d', '#c3d0c7'] },
  { style: 'gold', colors: ['#9d7c37', '#efe1aa'] },
]

function decorateArtwork(artwork, index) {
  const visual = artStyles[index % artStyles.length]

  return {
    ...artwork,
    id: Number(artwork.id),
    title: artwork.title || artwork.art_code,
    artist: artwork.art_code,
    ...visual,
  }
}

function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)
  const [loginError, setLoginError] = useState('')
  const [active, setActive] = useState('overview')

  const [overview, setOverview] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [votingOpen, setVotingOpen] = useState(false)

  const [adminError, setAdminError] = useState('')
  const [search, setSearch] = useState('')

  const [showUpload, setShowUpload] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadLoading, setUploadLoading] = useState(false)

  // Reset modal states
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  // Load dashboard data
  const loadDashboard = useCallback(async () => {
    const [
      overviewData,
      leaderboardData,
      settings,
    ] = await Promise.all([
      apiRequest('/admin/overview'),
      apiRequest('/admin/leaderboard'),
      apiRequest('/settings'),
    ])

    setOverview(overviewData)
    setLeaderboard(leaderboardData.map(decorateArtwork))
    setVotingOpen(Boolean(settings?.is_open))
  }, [])

  // Check existing admin session
  useEffect(() => {
    apiRequest('/admin/overview')
      .then(() => {
        setAuthenticated(true)
        return loadDashboard()
      })
      .catch(() => {})
      .finally(() => setChecking(false))
  }, [loadDashboard])

  // Automatically refresh dashboard every 4 seconds
  useEffect(() => {
    if (!authenticated) return undefined

    const timer = window.setInterval(() => {
      loadDashboard().catch((requestError) => {
        setAdminError(requestError.message)
      })
    }, 4000)

    return () => window.clearInterval(timer)
  }, [authenticated, loadDashboard])

  // Admin login
  const login = async (password) => {
    setLoginError('')

    try {
      await apiRequest('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
      })

      setAuthenticated(true)
      await loadDashboard()
    } catch (requestError) {
      setLoginError(requestError.message)
    }
  }

  // Admin logout
  const logout = async () => {
    await apiRequest('/admin/logout', {
      method: 'POST',
    }).catch(() => {})

    setAuthenticated(false)
    setOverview(null)
    setLeaderboard([])
  }

  // Open or close voting
  const updateVoting = async () => {
    const nextValue = !votingOpen

    try {
      await apiRequest('/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({ isOpen: nextValue }),
      })

      setVotingOpen(nextValue)
    } catch (requestError) {
      setAdminError(requestError.message)
    }
  }

  // Reset voting data
  const resetVotes = async () => {
    setResetLoading(true)
    setAdminError('')

    try {
      await apiRequest('/admin/reset', {
        method: 'POST',
      })

      await loadDashboard()
      setShowResetModal(false)
    } catch (requestError) {
      setAdminError(requestError.message)
    } finally {
      setResetLoading(false)
    }
  }

  // Upload new artwork
  const uploadArtwork = async (formData) => {
    setUploadLoading(true)
    setUploadError('')

    try {
      await apiRequest('/admin/artworks', {
        method: 'POST',
        body: formData,
      })

      setShowUpload(false)
      await loadDashboard()
    } catch (requestError) {
      setUploadError(requestError.message)
    } finally {
      setUploadLoading(false)
    }
  }

  // Deactivate artwork
  const deactivateArtwork = async (id) => {
    if (
      !window.confirm(
        'Deactivate this artwork? Existing votes will be preserved.'
      )
    ) {
      return
    }

    try {
      await apiRequest(`/admin/artworks/${id}/deactivate`, {
        method: 'PATCH',
      })

      await loadDashboard()
    } catch (requestError) {
      setAdminError(requestError.message)
    }
  }

  // Edit artwork title
  const editArtwork = async (artwork) => {
    const title = window.prompt('Artwork title', artwork.title)

    if (title === null) return

    try {
      await apiRequest(`/admin/artworks/${artwork.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title }),
      })

      await loadDashboard()
    } catch (requestError) {
      setAdminError(requestError.message)
    }
  }

  // Search artworks
  const filtered = useMemo(
    () =>
      leaderboard.filter((art) =>
        `${art.art_code} ${art.title}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [leaderboard, search]
  )

  // Checking admin session
  if (checking) {
    return (
      <main className="admin-auth-page">
        <div className="loading-state">
          Checking admin session…
        </div>
      </main>
    )
  }

  // Show login page
  if (!authenticated) {
    return <AdminLogin onLogin={login} error={loginError} />
  }

  // Admin dashboard
  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <BrandMark compact />

        <div className="admin-event">
          <span className="live-dot" />
          Live event
          <strong>Art Competition 2026</strong>
        </div>

        <nav>
          <AdminNav
            active={active}
            setActive={setActive}
            icon={LayoutDashboard}
            label="Overview"
            value="overview"
          />

          <AdminNav
            active={active}
            setActive={setActive}
            icon={Palette}
            label="Artworks"
            value="artworks"
          />

          <AdminNav
            active={active}
            setActive={setActive}
            icon={BarChart3}
            label="Leaderboard"
            value="leaderboard"
          />
        </nav>

        <div className="sidebar-bottom">
          <div className="admin-profile">
            <div className="profile-avatar">JP</div>

            <div>
              <strong>Club admin</strong>
              <span>Administrator</span>
            </div>

            <MoreHorizontal size={18} />
          </div>

          <button
            className="return-link logout-button"
            onClick={logout}
          >
            <ArrowRight size={15} /> Sign out
          </button>

          <Link to="/" className="return-link">
            <ArrowRight size={15} /> View voting page
          </Link>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="mobile-admin-brand">
            <Menu size={20} />
            <BrandMark compact />
          </div>

          <div className="admin-heading">
            <span className="eyebrow">
              Live competition control
            </span>

            <h1>
              {active === 'overview'
                ? 'Good morning, admin.'
                : active === 'artworks'
                  ? 'Artwork collection'
                  : 'Live leaderboard'}
            </h1>
          </div>

          <div className="admin-actions">
            <button
              className={`status-toggle ${votingOpen ? 'open' : ''}`}
              onClick={updateVoting}
            >
              <Power size={15} />
              Voting {votingOpen ? 'open' : 'closed'}
              <span />
            </button>

            <button
              className="icon-button"
              onClick={() => setShowResetModal(true)}
              title="Reset voting data"
              aria-label="Reset voting data"
            >
              <Settings size={18} />
            </button>
          </div>
        </header>

        {adminError && (
          <div className="admin-alert">
            {adminError}
          </div>
        )}

        {active === 'overview' && (
          <Overview
            overview={overview}
            votingOpen={votingOpen}
            setActive={setActive}
          />
        )}

        {active === 'artworks' && (
          <ArtworkManagement
            filtered={filtered}
            search={search}
            setSearch={setSearch}
            onUpload={() => {
              setUploadError('')
              setShowUpload(true)
            }}
            onEdit={editArtwork}
            onDeactivate={deactivateArtwork}
          />
        )}

        {active === 'leaderboard' && (
          <Leaderboard artworks={leaderboard} />
        )}
      </div>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSubmit={uploadArtwork}
          loading={uploadLoading}
          error={uploadError}
        />
      )}

      {showResetModal && (
        <ResetVotesModal
          onClose={() => setShowResetModal(false)}
          onConfirm={resetVotes}
          loading={resetLoading}
        />
      )}
    </main>
  )
}

export default AdminPage
