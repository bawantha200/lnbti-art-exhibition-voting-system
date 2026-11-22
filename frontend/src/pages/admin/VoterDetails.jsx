import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Search,
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  Vote,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Clock,
  CalendarDays,
  Mail,
} from 'lucide-react'

import { apiRequest } from '../../services/api.js'
import './VoterDetails.css'

function formatDate(value) {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function SummaryCard({ icon: Icon, label, value, color }) {
  return (
    <div className="voter-stat-card">
      <div className={`voter-stat-icon ${color}`}>
        <Icon size={18} />
      </div>

      <span>{label}</span>
      <strong>{value ?? 0}</strong>
    </div>
  )
}

function VoterDetails() {
  const [voters, setVoters] = useState([])
  const [summary, setSummary] = useState(null)

  const [search, setSearch] = useState('')
  const [verificationFilter, setVerificationFilter] = useState('all')
  const [votingFilter, setVotingFilter] = useState('all')

  const [expandedVoter, setExpandedVoter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const loadVoters = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    setError('')

    try {
      const data = await apiRequest('/admin/voters')

      setVoters(Array.isArray(data.voters) ? data.voters : [])
      setSummary(data.summary || null)
    } catch (requestError) {
      setError(requestError.message || 'Failed to load voter details.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadVoters()
  }, [loadVoters])

  const filteredVoters = useMemo(() => {
    return voters.filter((voter) => {
      const matchesSearch = voter.email
        ?.toLowerCase()
        .includes(search.trim().toLowerCase())

      const matchesVerification =
        verificationFilter === 'all' ||
        (verificationFilter === 'verified' && voter.verified_at) ||
        (verificationFilter === 'unverified' && !voter.verified_at)

      const matchesVoting =
        votingFilter === 'all' ||
        (votingFilter === 'voted' && voter.has_voted) ||
        (votingFilter === 'not-voted' && !voter.has_voted)

      return matchesSearch && matchesVerification && matchesVoting
    })
  }, [voters, search, verificationFilter, votingFilter])

  const toggleExpanded = (id) => {
    setExpandedVoter((current) => current === id ? null : id)
  }

  return (
    <section className="voter-page">
      <div className="voter-page-heading">
        <div>
          <span className="eyebrow">Competition records</span>
          <h2>Registered voters</h2>
          <p>
            View student registration, email verification and voting activity.
          </p>
        </div>

        <button
          type="button"
          className="voter-refresh-button"
          onClick={() => loadVoters(true)}
          disabled={loading || refreshing}
        >
          <RefreshCw
            size={15}
            className={refreshing ? 'voter-spinning' : ''}
          />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="voter-error">
          {error}
          <button type="button" onClick={() => loadVoters()}>
            Try again
          </button>
        </div>
      )}

      <div className="voter-stats-grid">
        <SummaryCard
          icon={Users}
          label="Total registered emails"
          value={summary?.total_voters}
          color="blue"
        />

        <SummaryCard
          icon={UserCheck}
          label="Verified emails"
          value={summary?.verified_voters}
          color="green"
        />

        <SummaryCard
          icon={UserX}
          label="Not verified"
          value={summary?.unverified_voters}
          color="gold"
        />

        <SummaryCard
          icon={Vote}
          label="Students voted"
          value={summary?.voted_voters}
          color="red"
        />
      </div>

      <div className="voter-toolbar">
        <div className="voter-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by email address..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          value={verificationFilter}
          onChange={(event) => setVerificationFilter(event.target.value)}
          aria-label="Filter by verification status"
        >
          <option value="all">All verification statuses</option>
          <option value="verified">Verified</option>
          <option value="unverified">Not verified</option>
        </select>

        <select
          value={votingFilter}
          onChange={(event) => setVotingFilter(event.target.value)}
          aria-label="Filter by voting status"
        >
          <option value="all">All voting statuses</option>
          <option value="voted">Voted</option>
          <option value="not-voted">Not voted</option>
        </select>
      </div>

      <div className="voter-results-info">
        <span>
          Showing <strong>{filteredVoters.length}</strong> of{' '}
          <strong>{voters.length}</strong> voters
        </span>
      </div>

      <div className="panel voter-table-panel">
        <div className="voter-table-header">
          <span>Student email</span>
          <span>Registered at</span>
          <span>Verification</span>
          <span>Voting status</span>
          <span>Vote submitted at</span>
          <span></span>
        </div>

        {loading ? (
          <div className="empty-state">
            Loading voter details...
          </div>
        ) : filteredVoters.length === 0 ? (
          <div className="empty-state">
            {error
              ? 'Unable to display voter records.'
              : 'No voter records found.'}
          </div>
        ) : (
          filteredVoters.map((voter) => {
            const isExpanded = expandedVoter === voter.id
            const votes = Array.isArray(voter.votes) ? voter.votes : []

            return (
              <div className="voter-record" key={voter.id}>
                <div className="voter-table-row">
                  <div className="voter-email-cell">
                    <div className="voter-email-icon">
                      <Mail size={16} />
                    </div>
                    <span>{voter.email}</span>
                  </div>

                  <div className="voter-date-cell">
                    <CalendarDays size={14} />
                    {formatDate(voter.created_at)}
                  </div>

                  <div>
                    {voter.verified_at ? (
                      <span className="voter-status verified">
                        <CheckCircle2 size={13} />
                        Verified
                      </span>
                    ) : (
                      <span className="voter-status unverified">
                        <XCircle size={13} />
                        Unverified
                      </span>
                    )}
                  </div>

                  <div>
                    {voter.has_voted ? (
                      <span className="voter-status voted">
                        <CheckCircle2 size={13} />
                        Voted
                      </span>
                    ) : (
                      <span className="voter-status not-voted">
                        <Clock size={13} />
                        Not voted
                      </span>
                    )}
                  </div>

                  <div className="voter-date-cell">
                    {formatDate(voter.voted_at)}
                  </div>

                  <button
                    type="button"
                    className="voter-expand-button"
                    onClick={() => toggleExpanded(voter.id)}
                    aria-label={isExpanded ? 'Hide voter details' : 'View voter details'}
                  >
                    {isExpanded
                      ? <ChevronUp size={17} />
                      : <ChevronDown size={17} />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="voter-expanded">
                    <div className="voter-extra-details">
                      <div>
                        <span>Voter ID</span>
                        <strong>#{voter.id}</strong>
                      </div>

                      <div>
                        <span>Email submitted</span>
                        <strong>{formatDate(voter.created_at)}</strong>
                      </div>

                      <div>
                        <span>Email verified</span>
                        <strong>{formatDate(voter.verified_at)}</strong>
                      </div>

                      <div>
                        <span>Vote submitted</span>
                        <strong>{formatDate(voter.voted_at)}</strong>
                      </div>

                      <div>
                        <span>Total selected artworks</span>
                        <strong>{voter.vote_count ?? votes.length}</strong>
                      </div>
                    </div>

                    <div className="voter-artworks">
                      <h4>Selected artworks</h4>

                      {votes.length === 0 ? (
                        <p>No votes recorded for this student.</p>
                      ) : (
                        <div className="voter-artwork-list">
                          {votes.map((vote) => (
                            <div
                              className="voter-artwork-item"
                              key={vote.artwork_id}
                            >
                              <div>
                                <strong>{vote.art_code}</strong>
                                <span>{vote.title || 'Untitled artwork'}</span>
                              </div>

                              <small>
                                {formatDate(vote.vote_created_at)}
                              </small>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}

export default VoterDetails
