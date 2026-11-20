import { Mail, LockKeyhole, ArrowRight } from 'lucide-react'
import StepHeader from '../../components/StepHeader'

function EmailScreen({ email, setEmail, onSubmit, onBack, error, loading }) {
  return (
    <section className="form-page">
      <div className="form-aside">
        <div className="aside-kanji">信</div>
        <span>VERIFICATION</span>
        <p>One student.<br />One voice.</p>
      </div>

      <div className="form-content">
        <StepHeader
          step={1}
          title="Let's verify you're a student."
          subtitle="We'll send a one-time code to your institutional email."
          onBack={onBack}
        />

        <form onSubmit={onSubmit} className="auth-form">
          <label htmlFor="email">Institutional email address</label>

          <div className="input-wrap">
            <Mail size={19} />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="your.name@edu.lnbti.lk"
              autoFocus
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button
            className="primary-button wide-button"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Sending code…' : 'Send verification code'}
            {!loading && <ArrowRight size={18} />}
          </button>

          <div className="privacy-note">
            <LockKeyhole size={15} />
            <span>
              Your email is used only to verify your eligibility and is never shown publicly.
            </span>
          </div>
        </form>
      </div>
    </section>
  )
}

export default EmailScreen
