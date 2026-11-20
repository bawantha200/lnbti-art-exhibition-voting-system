import './LoadingScreen.css'

function LoadingScreen({ message = 'Loading, please wait...' }) {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <img
          src="/assets/logo_jp.png"
          alt="LNBTI Japanese Club"
          className="loading-logo"
        />

        <h2>LNBTI Japanese Club</h2>

        <p>Art Exhibition & Competition Voting</p>

        <div className="loading-spinner"></div>

        <span className="loading-message">{message}</span>

        <div className="loading-progress">
          <div className="loading-progress-bar"></div>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen
