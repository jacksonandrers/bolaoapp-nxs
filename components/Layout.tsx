import React from 'react';
import { User, UserRole } from '../types';
import { 
  Home, 
  Trophy, 
  PlusCircle, 
  Wallet, 
  User as UserIcon, 
  Shield, 
  LogOut,
  Menu
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  currentUser: User | null;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onLogout, currentUser }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'my-bets', label: 'Meus Bolões', icon: Trophy },
    { id: 'create-pool', label: 'Criar Bolão', icon: PlusCircle },
    { id: 'balance', label: 'Saldo', icon: Wallet },
    { id: 'profile', label: 'Perfil', icon: UserIcon },
    { id: 'admin', label: 'Painel Admin', icon: Shield, adminOnly: true },
  ];

  return (
    <div className="flex h-screen bg-[#0A0A0B]">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#0A0A0B] border-r border-[#27272A] transform transition-transform duration-300
        md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-4">
          <div className="p-4 mb-8 text-center">
            <h1 className="text-2xl font-black text-[#10B981]">BOLÃO DA TURMADA</h1>
          </div>

          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => {
              if (item.adminOnly && currentUser?.role !== UserRole.ADMIN) return null;
              
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-[#10B981] text-black' 
                      : 'text-[#FAFAFA]/60 hover:text-[#FAFAFA] hover:bg-[#141417]'}
                  `}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-4 border-t border-[#27272A]">
            <button
              onClick={onLogout}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-[#0A0A0B] border-b border-[#27272A] md:hidden">
          <button onClick={() => setIsSidebarOpen(true)} className="text-[#FAFAFA]">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-[#10B981]">Bolão da Turmada</h1>
          <div className="w-8" />
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;