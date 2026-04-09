import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useSettingsStore } from '../../stores/settingsStore'
import { injectFont, applyFontToBody } from '../../utils/font'

export function Layout() {
  const { fetchSettings, company } = useSettingsStore()

  useEffect(() => {
    fetchSettings().then(() => {
      const { company } = useSettingsStore.getState()
      if (company.fontFamily) {
        injectFont(company.fontUrl, company.fontFamily)
        applyFontToBody(company.fontFamily)
      }
    })
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
