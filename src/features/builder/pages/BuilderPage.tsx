import { Header, FooterStrip } from '@/widgets'
import { Sidebar } from '../components/Sidebar'
import { RightPanel } from '../components/RightPanel'
import { ViewportPanel } from '@/features/viewport'

export function BuilderPage() {
  return (
    <div className="bg-noise flex min-h-dvh flex-col overflow-x-hidden overflow-y-auto bg-void min-[1401px]:h-dvh min-[1401px]:overflow-hidden">
      <Header />
      <main className="flex min-h-0 w-full flex-1 flex-col px-4 pt-4 pb-2 sm:px-6">
        <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row lg:items-stretch">
          <div className="hidden min-h-0 w-56 shrink-0 min-[1401px]:block xl:w-60">
            <Sidebar />
          </div>
          <div className="min-h-[min(70dvh,36rem)] min-w-0 flex-1 min-[1401px]:min-h-0">
            <ViewportPanel />
          </div>
          <div className="flex min-h-0 w-full shrink-0 lg:w-88 min-[1401px]:lg:w-104 xl:w-122.75">
            <RightPanel />
          </div>
        </div>
        <FooterStrip />
      </main>
    </div>
  )
}
