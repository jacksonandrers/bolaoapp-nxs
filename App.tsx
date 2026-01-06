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

      if (error) throw error;
      if (data) setCurrentUser(data as User);
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);

      if (session?.user) {
        fetchProfile(session.user.id).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSession(session);

      if (session?.user) {
        setLoading(true);
        fetchProfile(session.user.id).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const refreshUser = useCallback(() => {
    if (session?.user) {
      setLoading(true);
      fetchProfile(session.user.id).finally(() => setLoading(false));
    }
  }, [session, fetchProfile]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navigateToPool = (id: string) => {
    setSelectedPoolId(id);
    setActiveTab('pool-detail');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <div className="h-10 w-10 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 🔐 NÃO autenticado → só Auth (SEM Layout)
  if (!session || !currentUser) {
    return <Auth onLogin={refreshUser} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView onPoolClick={(p) => navigateToPool(p.id)} onNavigate={setActiveTab} />;
      case 'my-bets':
        return <MyBets onPoolClick={(p) => navigateToPool(p.id)} currentUser={currentUser} />;
      case 'create-pool':
        return (
          <CreatePool
            onCreated={() => setActiveTab('my-bets')}
            onCancel={() => setActiveTab('home')}
            currentUser={currentUser}
          />
        );
      case 'pool-detail':
        return (
          <PoolDetail
            poolId={selectedPoolId!}
            onBack={() => setActiveTab('home')}
            onRefresh={refreshUser}
          />
        );
      case 'balance':
        return (
          <Balance
            onNavigate={setActiveTab}
            onRefresh={refreshUser}
            currentUser={currentUser}
          />
        );
      case 'profile':
        return <Profile onUpdate={refreshUser} currentUser={currentUser} />;
      case 'admin':
        return currentUser.role === UserRole.ADMIN ? (
          <AdminDashboard />
        ) : (
          <HomeView onPoolClick={(p) => navigateToPool(p.id)} onNavigate={setActiveTab} />
        );
      default:
        return <HomeView onPoolClick={(p) => navigateToPool(p.id)} onNavigate={setActiveTab} />;
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={handleLogout}
      currentUser={currentUser}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
