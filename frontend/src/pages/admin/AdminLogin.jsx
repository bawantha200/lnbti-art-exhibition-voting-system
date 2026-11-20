import { useState } from 'react'
import { ArrowRight, ChevronLeft, LockKeyhole } from 'lucide-react'
import { Link } from 'react-router-dom'
import BrandMark from '../../components/BrandMark'

function AdminLogin({ onLogin, error }) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    await onLogin(password)
    setLoading(false)
  }

  return (
    <main className="admin-auth-page">
      <div className="admin-login-card">
        <BrandMark />

        <div className="eyebrow">
          <LockKeyhole size={14} /> Private admin area
        </div>

        <h1>Welcome back.</h1>
        <p>Sign in to manage the exhibition and monitor live voting.</p>

        <form onSubmit={submit}>
          <label htmlFor="admin-password">Admin password</label>

          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoFocus
          />

          {error && <div className="form-error">{error}</div>}

          <button className="primary-button wide-button" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <Link to="/" className="back-button">
          <ChevronLeft size={17} /> Return to voting
        </Link>
      </div>
    </main>
  )
}

export default AdminLogin
