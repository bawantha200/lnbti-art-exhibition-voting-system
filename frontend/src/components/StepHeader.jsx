import { ChevronLeft } from 'lucide-react'

function StepHeader({ step, title, subtitle, onBack }) {
  return (
    <div className="step-header">
      <button className="back-button" onClick={onBack}>
        <ChevronLeft size={18} /> Back
      </button>

      <div className="step-progress">
        <span className={step >= 1 ? 'active' : ''}>01</span>
        <i />
        <span className={step >= 2 ? 'active' : ''}>02</span>
        <i />
        <span className={step >= 3 ? 'active' : ''}>03</span>
      </div>

      <span className="step-label">
        Step {String(step).padStart(2, '0')} / 03
      </span>

      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  )
}

export default StepHeader
