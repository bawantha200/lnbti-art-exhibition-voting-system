function StatCard({ label, value, change, icon: Icon, tone }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon size={18} />
      </div>

      <span>{label}</span>
      <strong>{value}</strong>
      <small>{change}</small>
    </div>
  )
}

export default StatCard
