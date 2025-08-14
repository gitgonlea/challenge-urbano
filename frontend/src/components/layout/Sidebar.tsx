import { BookOpen, Home, LogOut, Users } from 'react-feather';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';

import useAuth from '../../hooks/useAuth';
import authService from '../../services/AuthService';
import SidebarItem from './SidebarItem';

interface SidebarProps {
  className: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const history = useHistory();
  const { authenticatedUser, setAuthenticatedUser } = useAuth();

  const handleLogout = async () => {
    await authService.logout();
    setAuthenticatedUser(null);
    history.push('/login');
  };

  return (
    <div
      className={`sidebar bg-cover bg-center ${className}`}
      style={{ backgroundImage: 'url(/assets/sidemenu-bg.jpg)' }}
    >
      <div className="absolute inset-0 bg-brand-background/10" />
      <div className="relative z-10 flex flex-col h-full">
        <Link to="/" className="no-underline">
          <img
            src="/assets/urbano-logo-white.png"
            alt="123"
            className="h-25 mx-auto py-4 object-contain"
          />
        </Link>
        <nav className="mt-5 flex flex-col gap-3 flex-grow px-2">
          <SidebarItem to="/">
            <Home /> Dashboard
          </SidebarItem>
          <SidebarItem to="/courses">
            <BookOpen /> Courses
          </SidebarItem>
          {authenticatedUser.role === 'admin' ? (
            <SidebarItem to="/users">
              <Users /> Users
            </SidebarItem>
          ) : null}
        </nav>

        <div className="px-2 pb-4">
          <button
            className="btn w-full flex gap-3 justify-center items-center"
            onClick={handleLogout}
          >
            <LogOut /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}
