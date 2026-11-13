import { Header, FooterStrip } from '@/widgets'
import { Sidebar } from '../components/Sidebar'
import { RightPanel } from '../components/RightPanel'
import { MobileBuildDock } from '../components/MobileBuildDock'
import { ViewportPanel } from '@/features/viewport'
import { useBuild } from '../context/BuildContext'
import clsx from 'clsx'

export function BuilderPage() {
  const { viewMode } = useBuild()
  const mobile2d = viewMode === '2d'

  return (
    <div className="bg-noise flex min-h-dvh flex-col overflow-x-clip bg-void min-[1401px]:h-dvh min-[1401px]:overflow-hidden">
      <Header />
      <main
        className={clsx(
          'flex min-h-0 w-full flex-1 flex-col px-4 pt-4 pb-2 sm:px-6 max-lg:px-0 max-lg:pt-0',
          mobile2d
            ? 'max-lg:pb-0'
            : 'max-lg:pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))]',
        )}
      >
        <div
          className={clsx(
            'flex min-h-0 flex-1 flex-col gap-3 max-lg:gap-0 lg:flex-row lg:items-stretch',
            mobile2d && 'max-lg:min-h-0',
          )}
        >
          <div className="hidden min-h-0 w-56 shrink-0 min-[1401px]:block xl:w-60">
            <Sidebar />
          </div>
          <div
            className={clsx(
              'min-h-[min(70dvh,36rem)] min-w-0 flex-1 bg-[#070510] min-[1401px]:min-h-0',
              'max-lg:sticky max-lg:z-30 max-lg:shrink-0 max-lg:flex-none',
              'max-lg:top-[var(--header-offset,calc(3.5rem+env(safe-area-inset-top,0px)))]',
              'max-lg:transition-[top,height] max-lg:duration-300 max-lg:ease-[cubic-bezier(0.4,0,0.2,1)]',
              mobile2d
                ? 'max-lg:h-[calc(100dvh-var(--header-offset,calc(3.5rem+env(safe-area-inset-top,0px))))] max-lg:min-h-0'
                : 'max-lg:h-[min(48dvh,420px)] max-lg:min-h-[300px]',
            )}
          >
            <ViewportPanel />
          </div>
          <div
            className={clsx(
              'flex min-h-0 w-full shrink-0 max-lg:flex-none max-lg:px-3 max-lg:pt-2.5 max-lg:pb-3 lg:w-88 min-[1401px]:lg:w-104 xl:w-122.75',
              mobile2d && 'max-lg:hidden',
            )}
          >
            <RightPanel />
          </div>
        </div>
        <FooterStrip className="max-lg:hidden" />
      </main>
      {!mobile2d ? <MobileBuildDock /> : null}
    </div>
  )
}
