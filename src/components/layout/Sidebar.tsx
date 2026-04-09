import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  LayoutTemplate,
  ChevronDown,
  Plus,
  List,
  Settings,
  LogOut,
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, logout } = useAuthStore()
  const quotesOpen = location.pathname.startsWith('/quotes')
  const [quotesExpanded, setQuotesExpanded] = useState(quotesOpen)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const initials = currentUser?.name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() ?? '?'

  return (
    <aside className="w-60 h-screen bg-white border-r border-gray-100 flex flex-col py-6 px-4 gap-1 shrink-0">
      <div className="mb-8 px-2">
        <span className="text-xl font-bold text-indigo-600">BudgetGen</span>
        <p className="text-xs text-gray-400 mt-0.5">Sistema de Orçamentos</p>
      </div>

      {/* Dashboard */}
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
          }`
        }
      >
        <LayoutDashboard size={18} />
        Dashboard
      </NavLink>

      {/* Orçamentos (collapsible) */}
      <div>
        <button
          onClick={() => setQuotesExpanded((v) => !v)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            quotesOpen ? 'text-indigo-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
          }`}
        >
          <FileText size={18} />
          <span className="flex-1 text-left">Orçamentos</span>
          <ChevronDown size={15} className={`transition-transform ${quotesExpanded ? 'rotate-180' : ''}`} />
        </button>

        {quotesExpanded && (
          <div className="ml-7 mt-0.5 flex flex-col gap-0.5">
            <NavLink
              to="/quotes"
              end
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`
              }
            >
              <List size={15} />
              Lista
            </NavLink>
            <NavLink
              to="/quotes/new"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`
              }
            >
              <Plus size={15} />
              Novo Orçamento
            </NavLink>
          </div>
        )}
      </div>

      {/* Templates */}
      <NavLink
        to="/templates"
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
          }`
        }
      >
        <LayoutTemplate size={18} />
        Templates
      </NavLink>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Settings */}
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
          }`
        }
      >
        <Settings size={18} />
        Configurações
      </NavLink>

      {/* User + logout */}
      <div className="mt-2 pt-3 border-t border-gray-100 flex items-center gap-3 px-1">
        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-700 truncate">{currentUser?.name}</p>
          <p className="text-xs text-gray-400 truncate">{currentUser?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          title="Sair"
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  )
}
