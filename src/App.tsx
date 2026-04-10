import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from './components/layout/Layout'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { QuoteList } from './pages/QuoteList'
import { QuoteNew } from './pages/QuoteNew'
import { QuoteEditor } from './pages/QuoteEditor'
import { Templates } from './pages/Templates'
import { TemplateEditor } from './pages/TemplateEditor'
import { Preview } from './pages/Preview'
import { Settings } from './pages/Settings'
import { CrmDashboard } from './pages/crm/CrmDashboard'
import { ClientsPage } from './pages/crm/ClientsPage'
import { ClientDetailPage } from './pages/crm/ClientDetailPage'
import { ContractsPage } from './pages/crm/ContractsPage'
import { ContractDetailPage } from './pages/crm/ContractDetailPage'
import { ContractEditorPage } from './pages/contracts/ContractEditorPage'
import { ContractViewerPage } from './pages/contracts/ContractViewerPage'

const queryClient = new QueryClient()

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/quotes" element={<QuoteList />} />
          <Route path="/quotes/new" element={<QuoteNew />} />
          <Route path="/quotes/:id" element={<QuoteEditor />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/templates/:id" element={<TemplateEditor />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="/settings" element={<Settings />} />

          {/* CRM */}
          <Route path="/crm" element={<CrmDashboard />} />
          <Route path="/crm/clients" element={<ClientsPage />} />
          <Route path="/crm/clients/:id" element={<ClientDetailPage />} />
          <Route path="/crm/contracts" element={<ContractsPage />} />
          <Route path="/crm/contracts/:id" element={<ContractDetailPage />} />
          <Route path="/crm/contracts/:id/document" element={<ContractEditorPage />} />
          <Route path="/crm/contracts/:id/document/view" element={<ContractViewerPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
