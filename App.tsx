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

  // 🔐 garante que o profile exista (sem duplicar)
  const ensureProfileExists = async (user: any) => {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (existingProfile) return existingProfile;

    const { data: newProfile, error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        full_name: 'Usuário',
        role: UserRole.USER,
        balance: 0,
        withdrawable_balance: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return newProfile;
  };

  const fetchProfile = useCallback(async (user: any) => {
    try {
      setLoading(true);
      const profile = await ensureProfileExists(user);
      setCurrentUser(profile as User);
    } catch (e) {
      console.error('Erro ao carregar profile:', e);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 1️⃣ sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // 2️⃣ mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session?.user) {
          fetchProfile(session.user);
        } else {
          setCurrentUser(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const refreshUser = useCallback(() => {
    if (session?.user) {
      fetchProfile(session.user);
    }
  }, [session, fetchProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#10B981]"></div>
      </div>
    );
  }

  if (!session || !currentUser) {
    return <Auth onLogin={() => {}} />;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navigateToPool = (id: string) => {
    setSelectedPoolId(id);
    setActiveTab('pool-detail');
  };

  const renderContent = () => {
    if (activeTab === 'admin' && currentUser.role === UserRole.ADMIN) {
      return <AdminDashboard />;
    }

    switch (activeTab) {
      case 'home':
        return <HomeView onPoolClick={(pool) => navigateToPool(pool.id)} onNavigate={setActiveTab} currentUser={currentUser} />;
      case 'my-bets':
        return <MyBets onPoolClick={(pool) => navigateToPool(pool.id)} currentUser={currentUser} />;
      case 'create-pool':
        return <CreatePool onCreated={() => setActiveTab('my-bets')} onCancel={() => setActiveTab('home')} currentUser={currentUser} />;
      case 'pool-detail':
        return <PoolDetail poolId={selectedPoolId!} onBack={() => setActiveTab('home')} onRefresh={refreshUser} />;
      case 'balance':
        return <Balance currentUser={currentUser} onRefresh={refreshUser} />;
      case 'profile':
        return <Profile onUpdate={refreshUser} currentUser={currentUser} />;
      default:
        return <HomeView onPoolClick={(pool) => navigateToPool(pool.id)} onNavigate={setActiveTab} currentUser={currentUser} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} currentUser={currentUser}>
      {renderContent()}
    </Layout>
  );
};

export default App;
