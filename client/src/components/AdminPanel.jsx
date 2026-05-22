export default function AdminPanel({
  show,
  onClose,
  isLoggedIn,
  password,
  onPasswordChange,
  onLogin,
  onLogout,
  tab,
  onTabChange,
  inquiries,
  analytics,
  pricing,
  cmsStatus,
  actionLoading,
  onUpdateInquiry,
  onDeleteInquiry,
  onUpdatePrice,
}) {
  if (!show) return null;

  return (
    <div className="admin-overlay">
      <div className="container admin-dashboard">
        {!isLoggedIn ? (
          <div className="admin-login-card">
            <h3>Admin Portal Login</h3>
            <form onSubmit={onLogin}>
              <input
                type="password"
                className="form-control"
                placeholder="Access Token Password"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-common">
                Authenticate
              </button>
              <button type="button" className="btn btn-border" onClick={onClose}>
                Exit
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="admin-header-row">
              <h2>AnnBuendia.com Administrative Hub</h2>
              <div>
                <button type="button" className="btn btn-border" onClick={onLogout}>
                  Log Out
                </button>
                <button type="button" className="btn btn-common" onClick={onClose}>
                  Close
                </button>
              </div>
            </div>

            <div className="admin-nav-tabs">
              <button
                type="button"
                className={tab === 'inquiries' ? 'active' : ''}
                onClick={() => onTabChange('inquiries')}
              >
                Leads ({inquiries.length})
              </button>
              <button
                type="button"
                className={tab === 'pricing' ? 'active' : ''}
                onClick={() => onTabChange('pricing')}
              >
                Pricing CMS
              </button>
              <button
                type="button"
                className={tab === 'analytics' ? 'active' : ''}
                onClick={() => onTabChange('analytics')}
              >
                Analytics
              </button>
            </div>

            {tab === 'inquiries' && (
              <div className="inbox-list">
                {inquiries.length === 0 ? (
                  <p>Inbox empty.</p>
                ) : (
                  inquiries.map((inq) => (
                    <div key={inq._id} className={`inbox-card status-${inq.status}`}>
                      <h5>{inq.name}</h5>
                      <p>
                        {inq.email} {inq.budget && `| ${inq.budget}`}
                      </p>
                      <p>{inq.message}</p>
                      <div className="inbox-actions">
                        {inq.status === 'new' && (
                          <button
                            type="button"
                            disabled={actionLoading === inq._id}
                            onClick={() => onUpdateInquiry(inq._id, 'in-progress')}
                          >
                            Progress
                          </button>
                        )}
                        {inq.status !== 'archived' && (
                          <button
                            type="button"
                            disabled={actionLoading === inq._id}
                            onClick={() => onUpdateInquiry(inq._id, 'archived')}
                          >
                            Archive
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={actionLoading === inq._id}
                          onClick={() => onDeleteInquiry(inq._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'pricing' && (
              <div>
                {cmsStatus.text && <p className="cms-status">{cmsStatus.text}</p>}
                {pricing.map((plan) => (
                  <div key={plan.planType} className="cms-card">
                    <strong>
                      {plan.title} — ${plan.price.toLocaleString()}
                    </strong>
                    <div>
                      <input
                        type="number"
                        id={`input-price-${plan.planType}`}
                        defaultValue={plan.price}
                      />
                      <button
                        type="button"
                        className="btn btn-common"
                        onClick={() => {
                          const val = document.getElementById(`input-price-${plan.planType}`)?.value;
                          if (val) onUpdatePrice(plan.planType, val);
                        }}
                      >
                        Update
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'analytics' && analytics && (
              <div className="admin-stats-grid">
                <div>Views: {analytics.views}</div>
                <div>Leads: {analytics.contactSubmissions}</div>
                <div>Bookings: {analytics.bookingClicks}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
