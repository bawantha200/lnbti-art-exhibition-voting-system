import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Palette,
  Power,
  Users,
} from 'lucide-react'
import StatCard from '../../components/StatCard'

function Overview({ overview, votingOpen, setActive }) {
  const registered = Number(overview?.registered_voters || 0)
  const voted = Number(overview?.students_voted || 0)
  const totalVotes = Number(overview?.total_votes || 0)
  const activeArtworks = Number(overview?.active_artworks || 0)

  const participation = registered
    ? Math.round((voted / registered) * 100)
    : 0

  return (
    <div className="dashboard-content">
      <section className="stats-grid">
        <StatCard
          label="Registered voters"
          value={registered}
          change="Verified students"
          icon={Users}
          tone="red"
        />

        <StatCard
          label="Students voted"
          value={voted}
          change={`${participation}% participation`}
          icon={CheckCircle2}
          tone="green"
        />

        <StatCard
          label="Total votes cast"
          value={totalVotes}
          change={voted ? `${(totalVotes / voted).toFixed(1)} votes / student` : 'No votes yet'}
          icon={BarChart3}
          tone="blue"
        />

        <StatCard
          label="Active artworks"
          value={activeArtworks}
          change="Currently available"
          icon={Palette}
          tone="gold"
        />
      </section>

      <div className="dashboard-grid">
        <section className="panel participation-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Live pulse</span>
              <h2>Participation overview</h2>
            </div>

            <span className="status-badge">
              <span /> Database totals
            </span>
          </div>

          <div className="chart-empty">
            <BarChart3 size={24} />
            <strong>{voted} students have participated</strong>
            <span>
              New submissions appear here as the exhibition progresses.
            </span>
          </div>
        </section>

        <section className="panel quick-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">At a glance</span>
              <h2>Competition status</h2>
            </div>

            <span className={`status-badge ${votingOpen ? 'status-badge--open' : ''}`}>
              <span /> {votingOpen ? 'Open' : 'Closed'}
            </span>
          </div>

          <div className="status-main">
            <div
              className="status-ring"
              style={{
                background: `conic-gradient(var(--red) 0 ${participation}%, #eee9e1 ${participation}% 100%)`,
              }}
            >
              <strong>{participation}<span>%</span></strong>
              <small>voted</small>
            </div>

            <div>
              <strong>{voted} of {registered}</strong>
              <span>students have voted</span>

              <div className="mini-progress">
                <span style={{ width: `${participation}%` }} />
              </div>
            </div>
          </div>

          <div className="quick-links">
            <button onClick={() => setActive('leaderboard')}>
              <BarChart3 size={17} />
              <span>View live leaderboard</span>
              <ArrowRight size={15} />
            </button>

            <button onClick={() => setActive('artworks')}>
              <Palette size={17} />
              <span>Manage artworks</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </section>
      </div>

      <section className="panel recent-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Testing controls</span>
            <h2>Competition management</h2>
          </div>
        </div>

        <div className="activity-list">
          <div className="activity">
            <span className="activity-dot green" />

            <span>
              <strong>Voting status is controlled above</strong>
              <small>
                Changes are saved to the database for every voting laptop.
              </small>
            </span>

            <Power size={15} />
          </div>

          <div className="activity">
            <span className="activity-dot blue" />

            <span>
              <strong>Leaderboard refreshes automatically</strong>
              <small>
                Live results are polled every four seconds.
              </small>
            </span>

            <BarChart3 size={15} />
          </div>
        </div>
      </section>
    </div>
  )
}

export default Overview
