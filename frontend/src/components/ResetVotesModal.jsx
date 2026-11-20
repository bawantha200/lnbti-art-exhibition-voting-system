import { useState } from 'react'
import {
  AlertTriangle,
  Vote,
  ShieldCheck,
  Users,
  Power,
  X,
  Loader2,
} from 'lucide-react'

import './ResetModal.css'

function ResetVotesModal({ onClose, onConfirm, loading = false }) {
  const [confirmation, setConfirmation] = useState('')

  const canReset = confirmation.trim().toUpperCase() === 'RESET'

  const handleConfirm = () => {
    if (!canReset || loading) return
    onConfirm()
  }

  return (
    <div
      className="reset-modal-overlay"
      onClick={loading ? undefined : onClose}
    >
      <div
        className="reset-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-modal-title"
      >
        <button
          type="button"
          className="reset-modal-close"
          onClick={onClose}
          disabled={loading}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="reset-modal-icon">
          <AlertTriangle size={27} />
        </div>

        <span className="reset-modal-eyebrow">
          DANGER ZONE
        </span>

        <h2 id="reset-modal-title">
          Reset voting data?
        </h2>

        <p className="reset-modal-description">
          This action cannot be undone. All voting data and voter
          verification records will be permanently cleared.
        </p>

        <div className="reset-modal-list">
          <div>
            <Vote size={19} />
            <span>All votes</span>
            <strong>Clear</strong>
          </div>

          <div>
            <ShieldCheck size={19} />
            <span>OTP records</span>
            <strong>Clear</strong>
          </div>

          <div>
            <Users size={19} />
            <span>Voter eligibility</span>
            <strong>Reset</strong>
          </div>

          <div>
            <Power size={19} />
            <span>Voting status</span>
            <strong>Close</strong>
          </div>
        </div>

        <label
          className="reset-modal-label"
          htmlFor="reset-confirmation"
        >
          Type <strong>RESET</strong> to confirm
        </label>

        <input
          id="reset-confirmation"
          type="text"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          placeholder="Type RESET here"
          autoComplete="off"
          disabled={loading}
        />

        <div className="reset-modal-actions">
          <button
            type="button"
            className="reset-cancel-button"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="button"
            className="reset-confirm-button"
            onClick={handleConfirm}
            disabled={!canReset || loading}
          >
            {loading ? (
              <>
                <Loader2 className="reset-spinner" size={17} />
                Resetting...
              </>
            ) : (
              'Reset Everything'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResetVotesModal
