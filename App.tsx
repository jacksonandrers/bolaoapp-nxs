import { useState, useEffect } from 'react';
import Auth from './views/Auth';
import HomeView from './views/HomeView';
import CreatePool from './views/CreatePool';
import Profile from './views/Profile';
import MyBets from './views/MyBets';
import Layout from './components/Layout';
import { supabase } from './lib/supabase';

type Screen = 'home' | 'create-pool' | 'profile' | 'bets';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              setCurrentUser(profile);
              setIsLoggedIn(true);
            }
          });
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            setCurrentUser(profile);
            setIsLoggedIn(true);
          });
      } else {
        setCurrentUser(null);
        setIsLoggedIn(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogin = (profile: any) => {
    setCurrentUser(profile);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setIsLoggedIn(false);
    setActiveTab('home');
  };

  if (!isLoggedIn) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <Layout
      currentUser={currentUser}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={handleLogout}
    >
      {activeTab === 'create-pool' && <CreatePool currentUser={currentUser} onBack={() => setActiveTab('home')} />}
      {activeTab === 'profile' && <Profile currentUser={currentUser} onBack={() => setActiveTab('home')} />}
      {activeTab === 'bets' && <MyBets currentUser={currentUser} onBack={() => setActiveTab('home')} />}
      {activeTab === 'home' && (
        <HomeView
          currentUser={currentUser}
          onPoolClick={(pool) => console.log(pool)}
          onNavigate={(tab) => setActiveTab(tab)}
        />
      )}
    </Layout>
  );
}