import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import DashboardShell from './components/DashboardShell';
import StatsCards from './components/StatsCards';
import BedGrid from './components/BedGrid';
import PatientSidebar from './components/PatientSidebar';
import WardManagement from './components/WardManagement';
import PatientDirectory from './components/PatientDirectory';
import Login from './components/Login';

const SOCKET_URL = 'http://localhost:5000';
const API_URL = 'http://localhost:5000/api';

function App() {
  const [beds, setBeds] = useState([]);
  const [queue, setQueue] = useState([]);
  const [socket, setSocket] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  // Navigation State
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'ward'

  // Login Handler
  const handleLogin = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    if (socket) socket.disconnect();
  };

  // Initial Fetch & Socket Setup
  useEffect(() => {
    if (!token) return;

    // Connect Socket with token if needed or just connect
    // For now simple connect, but ideally we'd pass token in auth handshake
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    const headers = {
      'Authorization': `Bearer ${token}`
    };

    // Fetch Data
    fetch(`${API_URL}/beds`, { headers })
      .then(res => {
        if (res.status === 401) return handleLogout();
        return res.json();
      })
      .then(data => data && setBeds(data))
      .catch(err => console.error("Failed to fetch beds", err));

    fetch(`${API_URL}/queue`, { headers })
      .then(res => {
        if (res.status === 401) return handleLogout();
        return res.json();
      })
      .then(data => data && setQueue(data))
      .catch(err => console.error("Failed to fetch queue", err));

    return () => newSocket.close();
  }, [token]);

  // Real-time Updates
  useEffect(() => {
    if (!socket || !token) return;

    socket.on('bedUpdate', (updatedBed) => {
      setBeds(prevBeds => {
        const index = prevBeds.findIndex(b => b.id === updatedBed.id);
        if (index !== -1) {
          return prevBeds.map(b => b.id === updatedBed.id ? updatedBed : b);
        } else {
          return [...prevBeds, updatedBed];
        }
      });
    });

    socket.on('bedRemoved', (bedId) => {
      setBeds(prevBeds => prevBeds.filter(b => b.id !== bedId));
    });

    socket.on('queueUpdate', (newQueue) => {
      setQueue(newQueue);
    });

    return () => {
      socket.off('bedUpdate');
      socket.off('bedRemoved');
      socket.off('queueUpdate');
    };
  }, [socket, token]);

  const authenticatedFetch = (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).then(res => {
      if (res.status === 401) {
        handleLogout();
        throw new Error('Unauthorized');
      }
      return res;
    });
  };

  // Smart Assign Handler
  const handleSmartAssign = async (patient) => {
    try {
      const needs = patient.triageLevel === 1 ? 'ICU' : 'General';
      const payload = {
        needs: needs,
        urgency: patient.triageLevel <= 2,
        patientId: patient.id
      };

      const res = await authenticatedFetch(`${API_URL}/beds/assign`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        alert(`Assigned ${patient.name} to ${data.bed.id} (${data.bed.ward})`);
      } else {
        alert(`Failed: ${data.error}`);
      }
    } catch (err) {
      if (err.message !== 'Unauthorized') alert("Error assigning bed: " + err.message);
    }
  };

  // Manual Assign Handler
  const handleManualAssign = async (patient, bedId) => {
    try {
      const payload = {
        needs: 'Manual',
        urgency: false,
        bedId: bedId,
        patientId: patient.id
      };

      const res = await authenticatedFetch(`${API_URL}/beds/assign`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        alert(`Manually Assigned ${patient.name} to ${data.bed.id}`);
      } else {
        alert(data.error || 'Assignment Failed');
      }
    } catch (err) {
      if (err.message !== 'Unauthorized') alert('Assignment Error: ' + err.message);
    }
  };

  const handleAddPatient = async (patientData) => {
    try {
      const res = await authenticatedFetch(`${API_URL}/queue/add`, {
        method: 'POST',
        body: JSON.stringify(patientData)
      });
      const data = await res.json();
      if (!data.success) alert(data.error);
    } catch (err) {
      if (err.message !== 'Unauthorized') alert("Error adding patient");
    }
  };

  const handleRemovePatient = async (id) => {
    if (!confirm("Remove patient from queue?")) return;
    try {
      const res = await authenticatedFetch(`${API_URL}/queue/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!data.success) alert(data.error);
    } catch (err) {
      if (err.message !== 'Unauthorized') alert("Error removing patient");
    }
  };

  const handleTransfer = async (sourceId, targetId) => {
    try {
      const res = await authenticatedFetch(`${API_URL}/beds/transfer`, {
        method: 'POST',
        body: JSON.stringify({ sourceBedId: sourceId, targetBedId: targetId })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Transferred from ${sourceId} to ${targetId}`);
        return true;
      } else {
        alert(`Transfer Failed: ${data.error}`);
        return false;
      }
    } catch (err) {
      if (err.message !== 'Unauthorized') alert("Transfer Error: " + err.message);
      return false;
    }
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex bg-medical-50 h-screen overflow-hidden font-sans">
      <DashboardShell
        currentView={currentView}
        onViewChange={setCurrentView}
        user={user}
        onLogout={handleLogout}
      >
        {currentView === 'dashboard' ? (
          <>
            <StatsCards beds={beds} queue={queue} />
            <div className="flex gap-6 relative">
              <BedGrid
                beds={beds}
                queue={queue}
                onAssign={handleManualAssign}
                onTransfer={handleTransfer}
                userRole={user?.role}
              />
            </div>
          </>
        ) : currentView === 'ward' ? (
          <WardManagement beds={beds} userRole={user?.role} />
        ) : (
          <PatientDirectory userRole={user?.role} />
        )}
      </DashboardShell>

      {/* Only show Patient Queue Sidebar on Dashboard View */}
      {currentView === 'dashboard' && (
        <PatientSidebar
          queue={queue}
          beds={beds}
          onAssign={handleSmartAssign}
          onManualAssign={handleManualAssign}
          onAddPatient={handleAddPatient}
          onRemovePatient={handleRemovePatient}
          userRole={user?.role}
        />
      )}
    </div>
  );
}

export default App;
