import { CheckCircle2 } from 'lucide-react'

function SuccessScreen() {
  return (
    <section className="success-page">
      <div className="success-orbit">
        <div className="success-kanji">感</div>
      </div>

      <div className="eyebrow">
        <CheckCircle2 size={15} />
        Submission complete
      </div>

      <h2>
        Your voice has<br />
        <em>been heard.</em>
      </h2>

      <p>
        Your votes have been successfully submitted. Thank you for celebrating creativity with the LNBTI Japanese Club.
      </p>

      <div className="success-rule" />

      <span className="auto-reset">
        This screen will reset for the next visitor.
      </span>
    </section>
  )
}

export default SuccessScreen
