import {
  RotateCcwKey,
  Box,
  LayoutDashboard,
  History,
  Building2,
  MessageCircleQuestionMark,
  Menu,
  X,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SwitchDropDown from '../other/switchDropDown';

const Sidebar = () => {
  const location = useLocation();
  const [activeId, setActiveId] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const activeItem = menuList.find((item) => item.to === location.pathname);
    setActiveId(activeItem ? activeItem.id : null);
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleEscapePress = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscapePress);
    } else {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscapePress);
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscapePress);
    };
  }, [isMenuOpen]);

  return (
    <>
      <div className="lg:hidden fixed top-4 z-50">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-md outline-none bg-white shadow-md text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      <aside
        className={`fixed top-0 left-0 z-40 flex flex-col justify-between bg-white 
          p-6 h-full transition-transform duration-300 ease-in-out transform 
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 lg:sticky lg:top-4 w-full lg:w-[350px]`}
      >
        <section>
          <div className="flex items-center gap-3 pb-6  border-gray-100">
            <img src="miraq-logo.png" alt="MIRAQ Logo" className="w-9 h-9" />
            <h1 className="text-2xl font-bold text-gray-800">MIRAQ</h1>
          </div>

          <nav className="flex flex-col gap-3 text-base text-gray-600 mt-8">
            {menuList.map((item) => {
              const Icon = item.icon;
              const isActive = activeId === item.id;
              return (
                <Link
                  key={item.id}
                  to={item.to}
                  onClick={() => setActiveId(item.id)}
                  className={`flex items-center gap-3 p-2 rounded-md 
                    transition-colors duration-200 ease-in-out text-base
                    ${
                      isActive ? 'bg-[#5932EA] text-white' : 'hover:bg-gray-100 hover:text-gray-900'
                    }`}
                >
                  <Icon
                    size={20}
                    className={`${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`}
                  />
                  <span className="font-medium">{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </section>

        <section className="flex flex-col gap-3 pt-6 border-gray-100">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div>
                <h4 className="text-base font-semibold text-gray-800">Evano</h4>
                <span className="text-sm text-gray-500">Project Manager</span>
              </div>
            </div>
            <SwitchDropDown />
          </div>
        </section>
      </aside>
    </>
  );
};

const menuList = [
  {
    id: 1,
    title: 'Dashboard',
    icon: LayoutDashboard,
    to: '/dashboard',
  },
  {
    id: 2,
    title: 'Import data (Analysis)',
    icon: Box,
    to: '/import-data',
  },
  {
    id: 3,
    title: 'History',
    icon: History,
    to: '/history',
  },
  {
    id: 4,
    title: 'Company (Super user)',
    icon: Building2,
    to: '/company',
  },
  {
    id: 5,
    title: 'Profile',
    icon: RotateCcwKey,
    to: '/profile',
  },
  {
    id: 6,
    title: 'Help',
    icon: MessageCircleQuestionMark,
    to: '/help',
  },
];

export default Sidebar;
