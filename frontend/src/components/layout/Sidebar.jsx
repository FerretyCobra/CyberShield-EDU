import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  LinkIcon,
  DocumentIcon,
  PhotoIcon,
  AcademicCapIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {

  const menuItems = [
    { name: 'Text Scan', path: '/text', icon: ChatBubbleLeftRightIcon },
    { name: 'URL Scan', path: '/url', icon: LinkIcon },
    { name: 'PDF Scan', path: '/pdf', icon: DocumentIcon },
    { name: 'Image Scan', path: '/image', icon: PhotoIcon },
    { name: 'Education', path: '/awareness', icon: AcademicCapIcon },
    { name: 'Admin', path: '/admin', icon: AdjustmentsHorizontalIcon },
  ];

  return (
    <div className="sidebar flex flex-col h-full">

      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-6 py-8 mb-4 border-b border-slate-800/40">

        <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30">
          <ShieldCheckIcon className="w-7 h-7 text-indigo-400" />
        </div>

        <h1 className="text-xl font-bold tracking-tight text-slate-100">
          CyberShield
        </h1>

      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">

        <div className="px-2 mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
          Detection
        </div>

        {menuItems.slice(0, 4).map((item) => (

          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
              ${isActive
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'}
            `
            }
          >

            {({ isActive }) => (
              <>
                <item.icon
                  className={`w-5 h-5 flex-shrink-0 transition-colors
                  ${isActive ? 'text-indigo-400' : 'text-slate-400'}
                  `}
                />

                <span className="text-[15px] font-medium">
                  {item.name}
                </span>
              </>
            )}

          </NavLink>

        ))}

        <div className="px-2 mt-8 mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
          Platform
        </div>

        {menuItems.slice(4).map((item) => (

          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
              ${isActive
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'}
            `
            }
          >

            {({ isActive }) => (
              <>
                <item.icon
                  className={`w-5 h-5 flex-shrink-0 transition-colors
                  ${isActive ? 'text-indigo-400' : 'text-slate-400'}
                  `}
                />

                <span className="text-[15px] font-medium">
                  {item.name}
                </span>
              </>
            )}

          </NavLink>

        ))}

      </nav>

      {/* System Status */}
      <div className="p-6 mt-auto border-t border-slate-800/40">

        <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800">

          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">
            System Status
          </p>

          <p className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            CyberShield Active
          </p>

        </div>

      </div>

    </div>
  );
};

export default Sidebar;