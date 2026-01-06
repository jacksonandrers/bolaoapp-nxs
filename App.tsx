
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabase';
import { User, UserRole } from './types';
import Layout from './components/Layout';
import Auth from './views/Auth';
import HomeView from './views/HomeView';
import CreatePool from './views/CreatePool';
import MyBets from './views/MyBets';
import PoolDetail from './views/PoolDetail';
import Balance from './views/Balance';
import Profile from './views/Profile';
import AdminDashboard from './views/AdminDashboard';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        setCurrentUser(data as User);
      }
    } catch (e) {
      console.error("Erro ao carregar perfil:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
      else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const refreshUser = useCallback(() => {
    if (session?.user) fetchProfile(session.user.id);
  }, [session, fetchProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#10B981]"></div>
      </div>
    );
  }

  if (!session || !currentUser) {
    return <Auth onLogin={refreshUser} />;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navigateToPool = (id: string) => {
    setSelectedPoolId(id);
    setActiveTab('pool-detail');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView onPoolClick={(pool) => navigateToPool(pool.id)} onNavigate={(tab) => setActiveTab(tab)} />;
      case 'my-bets':
        return <MyBets onPoolClick={(pool) => navigateToPool(pool.id)} currentUser={currentUser} />;
      case 'create-pool':
        return <CreatePool onCreated={() => setActiveTab('my-bets')} onCancel={() => setActiveTab('home')} currentUser={currentUser} />;
      case 'pool-detail':
        return <PoolDetail poolId={selectedPoolId!} onBack={() => setActiveTab('home')} onRefresh={refreshUser} />;
      case 'balance':
        return <Balance onNavigate={(tab) => setActiveTab(tab)} onRefresh={refreshUser} currentUser={currentUser} />;
      case 'profile':
        return <Profile onUpdate={refreshUser} currentUser={currentUser} />;
      case 'admin':
        return currentUser.role === UserRole.ADMIN ? <AdminDashboard /> : <HomeView onPoolClick={(pool) => navigateToPool(pool.id)} onNavigate={(tab) => setActiveTab(tab)} />;
      default:
        return <HomeView onPoolClick={(pool) => navigateToPool(pool.id)} onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} currentUser={currentUser}>
      {renderContent()}
    </Layout>
  );
};

export default App;
