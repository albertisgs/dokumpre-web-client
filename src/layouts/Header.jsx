import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { LogOut } from 'lucide-react';

const Header = () => {
  const location = useLocation()
  const navigate =  useNavigate()
  const [title, setTitle] = useState('')
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();

  useEffect(() => { 
    if(location.pathname == '/'){
      setTitle('Dashboard')
    }
    else if(location.pathname == '/knowledge-base'){
      setTitle('Knowledge Base')
    }
    else if(location.pathname == '/prompt-management'){
      setTitle('Prompt Management')
    }
    else if(location.pathname == '/market-competitor-insight'){
      setTitle('Market Competitor Insight')
    }
    
  }, [location])

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

    return (
        <header className="flex flex-row bg-[#F9FAFB] justify-between items-center ">
            <h1 className="text-3xl font-bold mx-10">{title}</h1>
            
            <div className="flex items-center gap-4 relative cursor-not-allowed" ref={menuRef}>
              <img src="/active.svg" className="w-7 h-7" />

              <div className="relative">
                <img
                  src="/avatar.svg"
                  className="w-10 h-10 cursor-pointer rounded-full"
                  onClick={() => setShowMenu(prev => !prev)}
                />

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-10">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      <LogOut className="w-5 h-5"/>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
        </header>
    )
}

export default Header