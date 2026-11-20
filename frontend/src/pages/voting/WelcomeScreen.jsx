import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'
import BrandMark from '../../components/BrandMark'

function WelcomeScreen({ onStart }) {
  return (
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
  )
}

export default WelcomeScreen
