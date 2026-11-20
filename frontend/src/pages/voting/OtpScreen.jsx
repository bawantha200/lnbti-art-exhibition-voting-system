import { Clock3, LockKeyhole, ArrowRight } from 'lucide-react'
import StepHeader from '../../components/StepHeader'

function OtpScreen({
  email,
  otp,
  updateOtp,
  pasteOtp,
  onSubmit,
  onResend,
  onBack,
  error,
  remaining,
  loading,
}) {
  return (
    <section className="form-page">
      <div className="form-aside otp-aside">
        <div className="aside-kanji">認</div>
        <span>YOUR CODE</span>
        <p>Almost there.<br />Check your inbox.</p>
      </div>

      <div className="form-content">
        <StepHeader
          step={2}
          title="Enter your verification code."
          subtitle={
            <>
              We sent a 6-digit code to <strong>{email}</strong>.
            </>
          }
          onBack={onBack}
        />

        <form onSubmit={onSubmit} className="auth-form">
          <label>Verification code</label>

          <div className="otp-row">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                value={digit}
                onChange={(event) => updateOtp(index, event.target.value)}
                onPaste={pasteOtp}
                inputMode="numeric"
                maxLength={1}
                autoFocus={index === 0}
              />
            ))}
          </div>

          {error && <div className="form-error">{error}</div>}

          <button
            className="primary-button wide-button"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Verifying…' : 'Verify & continue'}
            {!loading && <ArrowRight size={18} />}
          </button>

          <div className="resend-row">
            <span>Didn't receive a code?</span>
            <button
              type="button"
              onClick={onResend}
              disabled={remaining > 0 || loading}
            >
              Resend code {remaining > 0 && `(${remaining}s)`}
            </button>
          </div>

          <div className="privacy-note">
            <Clock3 size={15} />
            <span>
              Your code expires in 5 minutes. Never share it with anyone.
            </span>
          </div>
        </form>
      </div>
    </section>
  )
}

export default OtpScreen
