function AdminNav({ active, setActive, icon: Icon, label, value }) {
  return (
    <button
      className={`admin-nav ${active === value ? 'active' : ''}`}
      onClick={() => setActive(value)}
    >
      <Icon size={18} />
      {label}
      {value === 'leaderboard' && <span className="nav-live">Live</span>}
    </button>
  )
}

export default AdminNav
