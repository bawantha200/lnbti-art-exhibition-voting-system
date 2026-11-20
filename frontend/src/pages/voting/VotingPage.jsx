
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { apiRequest } from '../../services/api.js'
import BrandMark from '../../components/BrandMark'
import ConfirmModal from '../../components/ConfirmModal'
import LoadingScreen from '../../components/LoadingScreen'

import WelcomeScreen from './WelcomeScreen'
import EmailScreen from './EmailScreen'
import OtpScreen from './OtpScreen'
import GalleryScreen from './GalleryScreen'
import SuccessScreen from './SuccessScreen'

const artStyles = [
  { style: 'mist', colors: ['#c7d0ca', '#eef0e7'] },
  { style: 'sun', colors: ['#d17c58', '#f2c17b'] },
  { style: 'crimson', colors: ['#9f222d', '#e9b98c'] },
  { style: 'ink', colors: ['#29353c', '#b6c8bf'] },
  { style: 'blue', colors: ['#507c8d', '#c3d0c7'] },
  { style: 'gold', colors: ['#9d7c37', '#efe1aa'] },
]

function decorateArtwork(artwork, index) {
  const visual = artStyles[index % artStyles.length]

  return {
    ...artwork,
    id: Number(artwork.id),
    title: artwork.title || artwork.art_code,
    artist: artwork.art_code,
    ...visual,
  }
}

function VotingPage() {
  const navigate = useNavigate()
  const location = useLocation()

  // Get current page from URL
  const currentPath = location.pathname

  const step =
    currentPath === '/email' ? 'email' :
    currentPath === '/otp' ? 'otp' :
    currentPath === '/gallery' ? 'gallery' :
    currentPath === '/success' ? 'success' :
    'welcome'

  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [artworks, setArtworks] = useState([])
  const [selected, setSelected] = useState([])
  const [error, setError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [remaining, setRemaining] = useState(0)
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)

  // OTP countdown
  useEffect(() => {
    if (step !== 'otp' || remaining <= 0) return undefined

    const timer = window.setInterval(() => {
      setRemaining((current) => Math.max(0, current - 1))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [step, remaining])

  // Welcome -> Email
  const startEmail = () => {
    setError('')
    navigate('/email')
  }

  // Send OTP
  const sendOtp = async (event) => {
    event?.preventDefault()

    const normalizedEmail = email.trim().toLowerCase()

    if (!/^[^\s@]+@edu\.lnbti\.lk$/i.test(normalizedEmail)) {
      setError('Please use your institutional email ending in @edu.lnbti.lk')
      return
    }

    setLoading(true)
    setError('')

    try {
      await apiRequest('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email: normalizedEmail }),
      })

      setEmail(normalizedEmail)
      setOtp(['', '', '', '', '', ''])
      setRemaining(60)

      navigate('/otp')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  // Verify OTP
  const verifyOtp = async (event) => {
    event.preventDefault()

    const code = otp.join('')

    if (code.length !== 6) {
      setError('Enter the 6-digit verification code to continue.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await apiRequest('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, code }),
      })

      const [artworkResponse, settings] = await Promise.all([
        apiRequest('/artworks'),
        apiRequest('/settings'),
      ])

      if (!settings?.is_open) {
        throw new Error(
          'Voting is currently closed. Please ask the club administrator for assistance.'
        )
      }

      setArtworks(artworkResponse.map(decorateArtwork))
      navigate('/gallery')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  // Paste OTP
  const pasteOtp = (event) => {
    event.preventDefault()

    const pasted = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6)
      .split('')

    if (!pasted.length) return

    setOtp([...pasted, ...Array(6 - pasted.length).fill('')])

    document
      .getElementById(`otp-${Math.min(pasted.length, 6) - 1}`)
      ?.focus()
  }

  // Update OTP inputs
  const updateOtp = (index, value) => {
    const digits = value.replace(/\D/g, '')

    if (digits.length > 1) {
      const next = [...otp]

      digits.slice(0, 6 - index).split('').forEach((digit, offset) => {
        next[index + offset] = digit
      })

      setOtp(next)

      document
        .getElementById(`otp-${Math.min(index + digits.length, 6) - 1}`)
        ?.focus()

      return
    }

    const next = [...otp]
    next[index] = digits
    setOtp(next)

    if (digits && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  // Select / deselect artworks
  const toggleArtwork = (id) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length < 3
          ? [...current, id]
          : current
    )
  }

  // Submit votes
  const submitVotes = async () => {
    if (!selected.length || submitLoading) return

    setSubmitLoading(true)
    setError('')

    try {
      await apiRequest('/votes', {
        method: 'POST',
        body: JSON.stringify({ artworkIds: selected }),
      })

      setShowConfirm(false)
      setSelected([])
      setEmail('')
      setOtp(['', '', '', '', '', ''])

      navigate('/success')

      // Return to welcome after 8 seconds
      window.setTimeout(() => {
        navigate('/')
      }, 8000)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitLoading(false)
    }
  }

  // Show branded loading screen
  if (loading || submitLoading) {
    return (
      <LoadingScreen
        message={
          submitLoading
            ? 'Submitting your votes...'
            : 'Please wait...'
        }
      />
    )
  }

  return (
    <main className="voting-shell">
      <div className="grain" />

      <header className="topbar">
        <BrandMark compact />

        <div className="topbar-meta">
          <span className="live-dot" />
          Live voting · 2026 Exhibition
        </div>
      </header>

      {step === 'welcome' && (
        <WelcomeScreen onStart={startEmail} />
      )}

      {step === 'email' && (
        <EmailScreen
          email={email}
          setEmail={setEmail}
          onSubmit={sendOtp}
          onBack={() => navigate('/')}
          error={error}
          loading={loading}
        />
      )}

      {step === 'otp' && (
        <OtpScreen
          email={email}
          otp={otp}
          updateOtp={updateOtp}
          pasteOtp={pasteOtp}
          onSubmit={verifyOtp}
          onResend={sendOtp}
          onBack={() => navigate('/email')}
          error={error}
          remaining={remaining}
          loading={loading}
        />
      )}

      {step === 'gallery' && (
        <GalleryScreen
          artworks={artworks}
          selected={selected}
          toggleArtwork={toggleArtwork}
          onSubmit={() => selected.length && setShowConfirm(true)}
          onBack={() => navigate('/otp')}
          error={error}
        />
      )}

      {step === 'success' && <SuccessScreen />}

      {showConfirm && (
        <ConfirmModal
          selected={selected}
          artworks={artworks}
          error={error}
          loading={submitLoading}
          onCancel={() => setShowConfirm(false)}
          onConfirm={submitVotes}
        />
      )}
    </main>
  )
}

export default VotingPage
