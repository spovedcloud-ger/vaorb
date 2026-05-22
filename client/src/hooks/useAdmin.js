import { useState, useEffect, useCallback } from 'react';

export function useAdmin(apiBase, pricing, setPricing) {
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminTab, setAdminTab] = useState('inquiries');
  const [adminInquiries, setAdminInquiries] = useState([]);
  const [adminAnalytics, setAdminAnalytics] = useState(null);
  const [inquiryActionLoading, setInquiryActionLoading] = useState(null);
  const [cmsStatus, setCmsStatus] = useState({ type: '', text: '' });

  const fetchAdminData = useCallback(async (token) => {
    const activeToken = token || localStorage.getItem('ann_admin_token');
    if (!activeToken) return;

    try {
      const resInq = await fetch(`${apiBase}/contact`, {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      if (resInq.ok) setAdminInquiries(await resInq.json());

      const resStats = await fetch(`${apiBase}/analytics/summary`, {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      if (resStats.ok) setAdminAnalytics(await resStats.json());
    } catch (err) {
      console.error('Admin data fetch failed', err);
    }
  }, [apiBase]);

  useEffect(() => {
    const token = localStorage.getItem('ann_admin_token');
    if (token) {
      fetch(`${apiBase}/auth/verify`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          if (res.ok) {
            setIsAdminLoggedIn(true);
            fetchAdminData(token);
          } else {
            localStorage.removeItem('ann_admin_token');
          }
        })
        .catch(() => setIsAdminLoggedIn(true));
    }
  }, [apiBase, fetchAdminData]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('ann_admin_token', data.token);
        setIsAdminLoggedIn(true);
        setAdminPassword('');
        fetchAdminData(data.token);
      } else {
        alert(data.message || 'Login credentials failed');
      }
    } catch {
      alert('Authentication server offline');
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('ann_admin_token');
    setIsAdminLoggedIn(false);
    setShowAdmin(false);
  };

  const handleUpdateInquiryStatus = async (id, newStatus) => {
    const token = localStorage.getItem('ann_admin_token');
    if (!token) return;
    setInquiryActionLoading(id);
    try {
      const res = await fetch(`${apiBase}/contact/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setAdminInquiries((prev) =>
          prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
        );
        fetchAdminData(token);
      }
    } catch {
      alert('Failed to update status');
    } finally {
      setInquiryActionLoading(null);
    }
  };

  const handleDeleteInquiry = async (id) => {
    if (!window.confirm('Permanently delete this message?')) return;
    const token = localStorage.getItem('ann_admin_token');
    if (!token) return;
    setInquiryActionLoading(id);
    try {
      const res = await fetch(`${apiBase}/contact/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAdminInquiries((prev) => prev.filter((item) => item._id !== id));
        fetchAdminData(token);
      }
    } catch {
      alert('Delete failed');
    } finally {
      setInquiryActionLoading(null);
    }
  };

  const handleUpdatePrice = async (planType, newPrice) => {
    const token = localStorage.getItem('ann_admin_token');
    if (!token) return;
    setCmsStatus({ type: 'loading', text: `Updating ${planType}...` });
    try {
      const res = await fetch(`${apiBase}/pricing/${planType}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ price: Number(newPrice) }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPricing((prev) =>
          prev.map((p) => (p.planType === planType ? { ...p, price: updated.price } : p))
        );
        setCmsStatus({ type: 'success', text: `Updated ${planType} to $${newPrice}` });
        setTimeout(() => setCmsStatus({ type: '', text: '' }), 3000);
      } else {
        const err = await res.json();
        setCmsStatus({ type: 'error', text: err.message || 'Update failed' });
      }
    } catch {
      setCmsStatus({ type: 'error', text: 'Server offline' });
    }
  };

  return {
    showAdmin,
    setShowAdmin,
    adminPassword,
    setAdminPassword,
    isAdminLoggedIn,
    adminTab,
    setAdminTab,
    adminInquiries,
    adminAnalytics,
    inquiryActionLoading,
    cmsStatus,
    handleAdminLogin,
    handleAdminLogout,
    handleUpdateInquiryStatus,
    handleDeleteInquiry,
    handleUpdatePrice,
  };
}
