import { assetUrl } from '../../services/api.js'

function Leaderboard({ artworks }) {
  const totalVotes = artworks.reduce(
    (sum, artwork) => sum + Number(artwork.total_votes || 0),
    0
  )

  const max = Math.max(
    ...artworks.map((art) => Number(art.total_votes || 0)),
    1
  )

  return (
    <div className="dashboard-content">
      <div className="leaderboard-hero">
        <div>
          <span className="eyebrow">
            Updated every four seconds
          </span>

          <h2>What the audience is saying</h2>
          <p>Live results from the database.</p>
        </div>

        <div className="leader-total">
          <strong>{totalVotes}</strong>
          <span>Total votes</span>
        </div>
      </div>

      <section className="panel leaderboard-panel">
        {!artworks.length ? (
          <div className="empty-state">
            No leaderboard data yet.
          </div>
        ) : (
          artworks.map((art, index) => (
            <div className="leader-row" key={art.id}>
              <span className="rank">
                {String(index + 1).padStart(2, '0')}
              </span>

              <div
                className={`leader-thumb ${art.style}`}
                style={{
                  '--tone-a': art.colors[0],
                  '--tone-b': art.colors[1],
                }}
              >
                {art.image_url && (
                  <img src={assetUrl(art.image_url)} alt="" />
                )}
              </div>

              <div className="leader-info">
                <strong>{art.title}</strong>
                <span>{art.art_code}</span>

                <div className="leader-bar">
                  <span
                    style={{
                      width: `${
                        (Number(art.total_votes || 0) / max) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <strong className="leader-votes">
                {art.total_votes || 0}
                <small> votes</small>
              </strong>

              <span className="leader-percent">
                {totalVotes
                  ? Math.round(
                      (Number(art.total_votes || 0) / totalVotes) * 100
                    )
                  : 0}
                %
              </span>
            </div>
          ))
        )}
      </section>
    </div>
  )
}

export default Leaderboard
