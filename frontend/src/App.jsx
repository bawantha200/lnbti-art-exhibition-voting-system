import { useCallback, useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronLeft,
  CircleHelp,
  Clock3,
  Eye,
  ImagePlus,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  Menu,
  MoreHorizontal,
  Palette,
  Plus,
  Power,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
  Users,
  X,
} from 'lucide-react'
import { apiRequest, assetUrl } from './services/api.js'
import './App.css'

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
  return { ...artwork, id: Number(artwork.id), title: artwork.title || artwork.art_code, artist: artwork.art_code, ...visual }
}

function BrandMark({ compact = false }) {
  return <div className={`brand-mark ${compact ? 'brand-mark--compact' : ''}`}><img src="/assets/logo_jp.png" alt="LNBTI Japanese Club" /><span className="brand-name">LNBTI <b>Japanese Club</b></span></div>
}

function App() {
  return <BrowserRouter><Routes><Route path="/admin" element={<AdminPage />} /><Route path="*" element={<VotingApp />} /></Routes></BrowserRouter>
}

function VotingApp() {
  const [step, setStep] = useState('welcome')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [artworks, setArtworks] = useState([])
  const [selected, setSelected] = useState([])
  const [error, setError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [remaining, setRemaining] = useState(0)
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)

  useEffect(() => {
    if (step !== 'otp' || remaining <= 0) return undefined
    const timer = window.setInterval(() => setRemaining((current) => Math.max(0, current - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [step, remaining])

  const startEmail = () => {
    setError('')
    setStep('email')
  }

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
      await apiRequest('/auth/send-otp', { method: 'POST', body: JSON.stringify({ email: normalizedEmail }) })
      setEmail(normalizedEmail)
      setOtp(['', '', '', '', '', ''])
      setRemaining(60)
      setStep('otp')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

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
      await apiRequest('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, code }) })
      const [artworkResponse, settings] = await Promise.all([apiRequest('/artworks'), apiRequest('/settings')])
      if (!settings?.is_open) throw new Error('Voting is currently closed. Please ask the club administrator for assistance.')
      setArtworks(artworkResponse.map(decorateArtwork))
      setStep('gallery')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  const pasteOtp = (event) => {
    event.preventDefault()
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('')
    if (!pasted.length) return
    setOtp([...pasted, ...Array(6 - pasted.length).fill('')])
    document.getElementById(`otp-${Math.min(pasted.length, 6) - 1}`)?.focus()
  }

  const updateOtp = (index, value) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length > 1) {
      const next = [...otp]
      digits.slice(0, 6 - index).split('').forEach((digit, offset) => { next[index + offset] = digit })
      setOtp(next)
      document.getElementById(`otp-${Math.min(index + digits.length, 6) - 1}`)?.focus()
      return
    }
    const next = [...otp]
    next[index] = digits
    setOtp(next)
    if (digits && index < 5) document.getElementById(`otp-${index + 1}`)?.focus()
  }

  const toggleArtwork = (id) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 3 ? [...current, id] : current)

  const submitVotes = async () => {
    if (!selected.length || submitLoading) return
    setSubmitLoading(true)
    setError('')
    try {
      await apiRequest('/votes', { method: 'POST', body: JSON.stringify({ artworkIds: selected }) })
      setShowConfirm(false)
      setSelected([])
      setEmail('')
      setOtp(['', '', '', '', '', ''])
      setStep('success')
      window.setTimeout(() => setStep('welcome'), 8000)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitLoading(false)
    }
  }

  return <main className="voting-shell"><div className="grain" /><header className="topbar"><BrandMark compact /><div className="topbar-meta"><span className="live-dot" /> Live voting · 2026 Exhibition</div><Link to="/admin" className="admin-link">Admin <ArrowRight size={14} /></Link></header>{step === 'welcome' && <WelcomeScreen onStart={startEmail} />}{step === 'email' && <EmailScreen email={email} setEmail={setEmail} onSubmit={sendOtp} onBack={() => setStep('welcome')} error={error} loading={loading} />}{step === 'otp' && <OtpScreen email={email} otp={otp} updateOtp={updateOtp} pasteOtp={pasteOtp} onSubmit={verifyOtp} onResend={sendOtp} onBack={() => setStep('email')} error={error} remaining={remaining} loading={loading} />}{step === 'gallery' && <GalleryScreen artworks={artworks} selected={selected} toggleArtwork={toggleArtwork} onSubmit={() => selected.length && setShowConfirm(true)} onBack={() => setStep('otp')} error={error} />}{step === 'success' && <SuccessScreen />}{showConfirm && <ConfirmModal selected={selected} artworks={artworks} error={error} loading={submitLoading} onCancel={() => setShowConfirm(false)} onConfirm={submitVotes} />}</main>
}

function WelcomeScreen({ onStart }) {
  return <section className="welcome-page"><div className="welcome-art-panel"><div className="vertical-label">日本美術展覧会・コンテスト · 2026</div><div className="circle-art"><span>静</span></div><div className="brush-stroke brush-one" /><div className="brush-stroke brush-two" /><div className="art-caption"><span>01</span><span>THE ART OF<br />PAUSE</span></div></div><div className="welcome-copy"><BrandMark /><div className="eyebrow"><Sparkles size={14} /> Annual Student Art Exhibition & Competition</div><h1>Choose the art<br /><em>that moves you.</em></h1><p className="lead">Take a moment. Look closely. Then cast your vote for up to three works that stayed with you.</p><button className="primary-button start-button" onClick={onStart}>Start voting <ArrowRight size={18} /></button><div className="welcome-note"><ShieldCheck size={16} /><span>Your vote is private and can only be cast once.</span></div><div className="welcome-footer"><span>Presented by LNBTI Japanese Club</span><span>Scroll to explore <span className="scroll-line" /></span></div></div></section>
}

function StepHeader({ step, title, subtitle, onBack }) {
  return <div className="step-header"><button className="back-button" onClick={onBack}><ChevronLeft size={18} /> Back</button><div className="step-progress"><span className={step >= 1 ? 'active' : ''}>01</span><i /><span className={step >= 2 ? 'active' : ''}>02</span><i /><span className={step >= 3 ? 'active' : ''}>03</span></div><span className="step-label">Step {String(step).padStart(2, '0')} / 03</span><h2>{title}</h2><p>{subtitle}</p></div>
}

function EmailScreen({ email, setEmail, onSubmit, onBack, error, loading }) {
  return <section className="form-page"><div className="form-aside"><div className="aside-kanji">信</div><span>VERIFICATION</span><p>One student.<br />One voice.</p></div><div className="form-content"><StepHeader step={1} title="Let's verify you're a student." subtitle="We'll send a one-time code to your institutional email." onBack={onBack} /><form onSubmit={onSubmit} className="auth-form"><label htmlFor="email">Institutional email address</label><div className="input-wrap"><Mail size={19} /><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="your.name@edu.lnbti.lk" autoFocus /></div>{error && <div className="form-error">{error}</div>}<button className="primary-button wide-button" type="submit" disabled={loading}>{loading ? 'Sending code…' : 'Send verification code'} {!loading && <ArrowRight size={18} />}</button><div className="privacy-note"><LockKeyhole size={15} /><span>Your email is used only to verify your eligibility and is never shown publicly.</span></div></form></div></section>
}

function OtpScreen({ email, otp, updateOtp, pasteOtp, onSubmit, onResend, onBack, error, remaining, loading }) {
  return <section className="form-page"><div className="form-aside otp-aside"><div className="aside-kanji">認</div><span>YOUR CODE</span><p>Almost there.<br />Check your inbox.</p></div><div className="form-content"><StepHeader step={2} title="Enter your verification code." subtitle={<>We sent a 6-digit code to <strong>{email}</strong>.</>} onBack={onBack} /><form onSubmit={onSubmit} className="auth-form"><label>Verification code</label><div className="otp-row">{otp.map((digit, index) => <input key={index} id={`otp-${index}`} value={digit} onChange={(event) => updateOtp(index, event.target.value)} onPaste={pasteOtp} inputMode="numeric" maxLength={1} autoFocus={index === 0} />)}</div>{error && <div className="form-error">{error}</div>}<button className="primary-button wide-button" type="submit" disabled={loading}>{loading ? 'Verifying…' : 'Verify & continue'} {!loading && <ArrowRight size={18} />}</button><div className="resend-row"><span>Didn't receive a code?</span><button type="button" onClick={onResend} disabled={remaining > 0 || loading}>Resend code {remaining > 0 && `(${remaining}s)`}</button></div><div className="privacy-note"><Clock3 size={15} /><span>Your code expires in 5 minutes. Never share it with anyone.</span></div></form></div></section>
}

function GalleryScreen({ artworks, selected, toggleArtwork, onSubmit, onBack, error }) {
  return <section className="gallery-page"><div className="gallery-head"><div><button className="back-button" onClick={onBack}><ChevronLeft size={18} /> Back</button><div className="eyebrow">Step 03 · The exhibition</div><h2>Which works speak to you?</h2><p>Select between one and three artworks. Take your time.</p></div><div className="selection-counter"><span>{selected.length}</span> / 3 <small>Selected</small></div></div>{error && <div className="form-error gallery-error">{error}</div>}{!artworks.length ? <div className="empty-state">No active artworks are available right now.</div> : <div className="art-grid">{artworks.map((artwork) => <ArtworkCard key={artwork.id} artwork={artwork} isSelected={selected.includes(artwork.id)} onToggle={() => toggleArtwork(artwork.id)} disabled={!selected.includes(artwork.id) && selected.length >= 3} />)}</div>}<div className="gallery-actions"><span><CircleHelp size={15} /> You can change your selection until you submit.</span><button className="primary-button" onClick={onSubmit} disabled={!selected.length}>Review my choices <ArrowRight size={18} /></button></div></section>
}

function ArtworkCard({ artwork, isSelected, onToggle, disabled }) {
  return <button className={`art-card ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`} onClick={onToggle} disabled={disabled}><div className={`art-image ${artwork.style}`} style={{ '--tone-a': artwork.colors[0], '--tone-b': artwork.colors[1] }}>{artwork.image_url ? <img src={assetUrl(artwork.image_url)} alt={artwork.title} /> : <div className="art-shape" />}<span className="art-number">{artwork.art_code}</span><span className="selection-indicator">{isSelected ? <Check size={18} /> : <Plus size={18} />}</span></div><div className="art-card-footer"><div><strong>{artwork.title}</strong><span>{artwork.artist}</span></div><span className="card-arrow"><ArrowRight size={17} /></span></div></button>
}

function ConfirmModal({ selected, artworks, error, loading, onCancel, onConfirm }) {
  const names = selected.map((id) => artworks.find((artwork) => artwork.id === id)?.art_code || id)
  return <div className="modal-backdrop"><div className="confirm-modal"><button className="modal-close" onClick={onCancel} disabled={loading}><X size={18} /></button><div className="modal-icon"><CheckCircle2 size={23} /></div><div className="eyebrow">One last look</div><h3>Ready to submit?</h3><p>Your selection will be final and you won't be able to vote again in this exhibition.</p><div className="chosen-list">{names.map((id) => <span key={id}><Check size={14} /> {id}</span>)}</div>{error && <div className="form-error">{error}</div>}<div className="modal-actions"><button className="secondary-button" onClick={onCancel} disabled={loading}>Keep browsing</button><button className="primary-button" onClick={onConfirm} disabled={loading}>{loading ? 'Submitting…' : 'Submit my votes'} {!loading && <ArrowRight size={17} />}</button></div></div></div>
}

function SuccessScreen() {
  return <section className="success-page"><div className="success-orbit"><div className="success-kanji">感</div></div><div className="eyebrow"><CheckCircle2 size={15} /> Submission complete</div><h2>Your voice has<br /><em>been heard.</em></h2><p>Your votes have been successfully submitted. Thank you for celebrating creativity with the LNBTI Japanese Club.</p><div className="success-rule" /><span className="auto-reset">This screen will reset for the next visitor.</span></section>
}

function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)
  const [loginError, setLoginError] = useState('')
  const [active, setActive] = useState('overview')
  const [overview, setOverview] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [votingOpen, setVotingOpen] = useState(false)
  const [adminError, setAdminError] = useState('')
  const [search, setSearch] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadLoading, setUploadLoading] = useState(false)

  const loadDashboard = useCallback(async () => {
    const [overviewData, leaderboardData, settings] = await Promise.all([apiRequest('/admin/overview'), apiRequest('/admin/leaderboard'), apiRequest('/settings')])
    setOverview(overviewData)
    setLeaderboard(leaderboardData.map(decorateArtwork))
    setVotingOpen(Boolean(settings?.is_open))
  }, [])

  useEffect(() => {
    apiRequest('/admin/overview').then(() => { setAuthenticated(true); return loadDashboard() }).catch(() => {}).finally(() => setChecking(false))
  }, [loadDashboard])

  useEffect(() => {
    if (!authenticated) return undefined
    const timer = window.setInterval(() => { loadDashboard().catch((requestError) => setAdminError(requestError.message)) }, 4000)
    return () => window.clearInterval(timer)
  }, [authenticated, loadDashboard])

  const login = async (password) => {
    setLoginError('')
    try {
      await apiRequest('/admin/login', { method: 'POST', body: JSON.stringify({ password }) })
      setAuthenticated(true)
      await loadDashboard()
    } catch (requestError) {
      setLoginError(requestError.message)
    }
  }

  const logout = async () => {
    await apiRequest('/admin/logout', { method: 'POST' }).catch(() => {})
    setAuthenticated(false)
    setOverview(null)
    setLeaderboard([])
  }

  const updateVoting = async () => {
    const nextValue = !votingOpen
    try {
      await apiRequest('/admin/settings', { method: 'PATCH', body: JSON.stringify({ isOpen: nextValue }) })
      setVotingOpen(nextValue)
    } catch (requestError) { setAdminError(requestError.message) }
  }

  const resetVotes = async () => {
    if (!window.confirm('Reset all votes, OTP records, and voter eligibility? This cannot be undone and voting will close.')) return
    try { await apiRequest('/admin/reset', { method: 'POST' }); await loadDashboard() } catch (requestError) { setAdminError(requestError.message) }
  }

  const uploadArtwork = async (formData) => {
    setUploadLoading(true)
    setUploadError('')
    try { await apiRequest('/admin/artworks', { method: 'POST', body: formData }); setShowUpload(false); await loadDashboard() } catch (requestError) { setUploadError(requestError.message) } finally { setUploadLoading(false) }
  }

  const deactivateArtwork = async (id) => {
    if (!window.confirm('Deactivate this artwork? Existing votes will be preserved.')) return
    try { await apiRequest(`/admin/artworks/${id}/deactivate`, { method: 'PATCH' }); await loadDashboard() } catch (requestError) { setAdminError(requestError.message) }
  }

  const editArtwork = async (artwork) => {
    const title = window.prompt('Artwork title', artwork.title)
    if (title === null) return
    try { await apiRequest(`/admin/artworks/${artwork.id}`, { method: 'PATCH', body: JSON.stringify({ title }) }); await loadDashboard() } catch (requestError) { setAdminError(requestError.message) }
  }

  const filtered = useMemo(() => leaderboard.filter((art) => `${art.art_code} ${art.title}`.toLowerCase().includes(search.toLowerCase())), [leaderboard, search])
  if (checking) return <main className="admin-auth-page"><div className="loading-state">Checking admin session…</div></main>
  if (!authenticated) return <AdminLogin onLogin={login} error={loginError} />
  return <main className="admin-shell"><aside className="admin-sidebar"><BrandMark compact /><div className="admin-event"><span className="live-dot" /> Live event <strong>Art Competition 2026</strong></div><nav><AdminNav active={active} setActive={setActive} icon={LayoutDashboard} label="Overview" value="overview" /><AdminNav active={active} setActive={setActive} icon={Palette} label="Artworks" value="artworks" /><AdminNav active={active} setActive={setActive} icon={BarChart3} label="Leaderboard" value="leaderboard" /></nav><div className="sidebar-bottom"><div className="admin-profile"><div className="profile-avatar">JP</div><div><strong>Club admin</strong><span>Administrator</span></div><MoreHorizontal size={18} /></div><button className="return-link logout-button" onClick={logout}><ArrowRight size={15} /> Sign out</button><Link to="/" className="return-link"><ArrowRight size={15} /> View voting page</Link></div></aside><div className="admin-main"><header className="admin-topbar"><div className="mobile-admin-brand"><Menu size={20} /><BrandMark compact /></div><div className="admin-heading"><span className="eyebrow">Live competition control</span><h1>{active === 'overview' ? 'Good morning, admin.' : active === 'artworks' ? 'Artwork collection' : 'Live leaderboard'}</h1></div><div className="admin-actions"><button className={`status-toggle ${votingOpen ? 'open' : ''}`} onClick={updateVoting}><Power size={15} /> Voting {votingOpen ? 'open' : 'closed'}<span /></button><button className="icon-button" onClick={resetVotes} title="Reset for testing"><Settings size={18} /></button></div></header>{adminError && <div className="admin-alert">{adminError}</div>}{active === 'overview' && <Overview overview={overview} votingOpen={votingOpen} setActive={setActive} />}{active === 'artworks' && <ArtworkManagement filtered={filtered} search={search} setSearch={setSearch} onUpload={() => { setUploadError(''); setShowUpload(true) }} onEdit={editArtwork} onDeactivate={deactivateArtwork} />}{active === 'leaderboard' && <Leaderboard artworks={leaderboard} />}</div>{showUpload && <UploadModal onClose={() => setShowUpload(false)} onSubmit={uploadArtwork} loading={uploadLoading} error={uploadError} />}</main>
}

function AdminLogin({ onLogin, error }) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const submit = async (event) => { event.preventDefault(); setLoading(true); await onLogin(password); setLoading(false) }
  return <main className="admin-auth-page"><div className="admin-login-card"><BrandMark /><div className="eyebrow"><LockKeyhole size={14} /> Private admin area</div><h1>Welcome back.</h1><p>Sign in to manage the exhibition and monitor live voting.</p><form onSubmit={submit}><label htmlFor="admin-password">Admin password</label><input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus />{error && <div className="form-error">{error}</div>}<button className="primary-button wide-button" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'} {!loading && <ArrowRight size={18} />}</button></form><Link to="/" className="back-button"><ChevronLeft size={17} /> Return to voting</Link></div></main>
}

function AdminNav({ active, setActive, icon: Icon, label, value }) { return <button className={`admin-nav ${active === value ? 'active' : ''}`} onClick={() => setActive(value)}><Icon size={18} /> {label}{value === 'leaderboard' && <span className="nav-live">Live</span>}</button> }

function Overview({ overview, votingOpen, setActive }) {
  const registered = Number(overview?.registered_voters || 0)
  const voted = Number(overview?.students_voted || 0)
  const totalVotes = Number(overview?.total_votes || 0)
  const activeArtworks = Number(overview?.active_artworks || 0)
  const participation = registered ? Math.round((voted / registered) * 100) : 0
  return <div className="dashboard-content"><section className="stats-grid"><StatCard label="Registered voters" value={registered} change="Verified students" icon={Users} tone="red" /><StatCard label="Students voted" value={voted} change={`${participation}% participation`} icon={CheckCircle2} tone="green" /><StatCard label="Total votes cast" value={totalVotes} change={voted ? `${(totalVotes / voted).toFixed(1)} votes / student` : 'No votes yet'} icon={BarChart3} tone="blue" /><StatCard label="Active artworks" value={activeArtworks} change="Currently available" icon={Palette} tone="gold" /></section><div className="dashboard-grid"><section className="panel participation-panel"><div className="panel-heading"><div><span className="eyebrow">Live pulse</span><h2>Participation overview</h2></div><span className="status-badge"><span /> Database totals</span></div><div className="chart-empty"><BarChart3 size={24} /><strong>{voted} students have participated</strong><span>New submissions appear here as the exhibition progresses.</span></div></section><section className="panel quick-panel"><div className="panel-heading"><div><span className="eyebrow">At a glance</span><h2>Competition status</h2></div><span className={`status-badge ${votingOpen ? 'status-badge--open' : ''}`}><span /> {votingOpen ? 'Open' : 'Closed'}</span></div><div className="status-main"><div className="status-ring" style={{ background: `conic-gradient(var(--red) 0 ${participation}%, #eee9e1 ${participation}% 100%)` }}><strong>{participation}<span>%</span></strong><small>voted</small></div><div><strong>{voted} of {registered}</strong><span>students have voted</span><div className="mini-progress"><span style={{ width: `${participation}%` }} /></div></div></div><div className="quick-links"><button onClick={() => setActive('leaderboard')}><BarChart3 size={17} /><span>View live leaderboard</span><ArrowRight size={15} /></button><button onClick={() => setActive('artworks')}><Palette size={17} /><span>Manage artworks</span><ArrowRight size={15} /></button></div></section></div><section className="panel recent-panel"><div className="panel-heading"><div><span className="eyebrow">Testing controls</span><h2>Competition management</h2></div></div><div className="activity-list"><div className="activity"><span className="activity-dot green" /><span><strong>Voting status is controlled above</strong><small>Changes are saved to the database for every voting laptop.</small></span><Power size={15} /></div><div className="activity"><span className="activity-dot blue" /><span><strong>Leaderboard refreshes automatically</strong><small>Live results are polled every four seconds.</small></span><BarChart3 size={15} /></div></div></section></div>
}

function StatCard({ label, value, change, icon: Icon, tone }) { return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={18} /></div><span>{label}</span><strong>{value}</strong><small>{change}</small></div> }

function ArtworkManagement({ filtered, search, setSearch, onUpload, onEdit, onDeactivate }) {
  return <div className="dashboard-content"><div className="content-toolbar"><div className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search artworks..." /></div><button className="primary-button" onClick={onUpload}><UploadCloud size={17} /> Upload artwork</button></div><section className="panel artwork-table-panel"><div className="table-header"><span>Artwork</span><span>Status</span><span>Votes</span><span>Actions</span></div>{!filtered.length ? <div className="empty-state">No active artworks found.</div> : filtered.map((art) => <div className="table-row" key={art.id}><div className="table-art"><div className={`table-thumb ${art.style}`} style={{ '--tone-a': art.colors[0], '--tone-b': art.colors[1] }}>{art.image_url && <img src={assetUrl(art.image_url)} alt="" />}</div><span><strong>{art.title}</strong><small>{art.art_code}</small></span></div><span className="status-badge status-badge--open"><span /> Active</span><strong>{art.total_votes || 0}</strong><div className="row-actions"><button className="icon-button" onClick={() => onEdit(art)} title="Edit title"><Eye size={16} /></button><button className="icon-button" onClick={() => onDeactivate(art.id)} title="Deactivate"><Trash2 size={16} /></button></div></div>)}</section></div>
}

function Leaderboard({ artworks }) {
  const totalVotes = artworks.reduce((sum, artwork) => sum + Number(artwork.total_votes || 0), 0)
  const max = Math.max(...artworks.map((art) => Number(art.total_votes || 0)), 1)
  return <div className="dashboard-content"><div className="leaderboard-hero"><div><span className="eyebrow">Updated every four seconds</span><h2>What the audience is saying</h2><p>Live results from the database.</p></div><div className="leader-total"><strong>{totalVotes}</strong><span>Total votes</span></div></div><section className="panel leaderboard-panel">{!artworks.length ? <div className="empty-state">No leaderboard data yet.</div> : artworks.map((art, index) => <div className="leader-row" key={art.id}><span className="rank">{String(index + 1).padStart(2, '0')}</span><div className={`leader-thumb ${art.style}`} style={{ '--tone-a': art.colors[0], '--tone-b': art.colors[1] }}>{art.image_url && <img src={assetUrl(art.image_url)} alt="" />}</div><div className="leader-info"><strong>{art.title}</strong><span>{art.art_code}</span><div className="leader-bar"><span style={{ width: `${(Number(art.total_votes || 0) / max) * 100}%` }} /></div></div><strong className="leader-votes">{art.total_votes || 0}<small> votes</small></strong><span className="leader-percent">{totalVotes ? Math.round((Number(art.total_votes || 0) / totalVotes) * 100) : 0}%</span></div>)}</section></div>
}

function UploadModal({ onClose, onSubmit, loading, error }) {
  const [artCode, setArtCode] = useState('')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)
  const submit = (event) => { event.preventDefault(); if (!file) return; const data = new FormData(); data.append('artCode', artCode); data.append('title', title); data.append('image', file); onSubmit(data) }
  return <div className="modal-backdrop admin-modal-backdrop"><form className="confirm-modal upload-modal" onSubmit={submit}><button type="button" className="modal-close" onClick={onClose} disabled={loading}><X size={18} /></button><div className="eyebrow">New exhibition entry</div><h3>Upload artwork</h3><p>Add a new work to the live gallery. Images are validated and optimized for the voting experience.</p><label className="upload-drop"><ImagePlus size={26} /><strong>{file ? file.name : 'Choose an image'}</strong><span>JPEG, PNG or WEBP · max 10MB</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setFile(event.target.files?.[0] || null)} /></label><div className="upload-fields"><label>Artwork ID<input value={artCode} onChange={(event) => setArtCode(event.target.value)} placeholder="ART-25" required /></label><label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Enter artwork title" /></label></div>{error && <div className="form-error">{error}</div>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose} disabled={loading}>Cancel</button><button className="primary-button" disabled={loading || !file}>{loading ? 'Uploading…' : 'Add artwork'} {!loading && <ArrowRight size={17} />}</button></div></form></div>
}

export default App
