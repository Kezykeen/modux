import { BuildProvider } from './state/BuildContext'
import { SoundProvider } from './state/SoundContext'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { ViewportPanel } from './components/viewport/ViewportPanel'
import { RightPanel } from './components/RightPanel'
import { FooterStrip } from './components/FooterStrip'

function App() {
  return (
    <BuildProvider>
      <SoundProvider>
        <div className="bg-noise min-h-screen bg-void">
          <Header />
          <main className="w-full px-4 py-6 sm:px-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch">
              <div className="w-full shrink-0 lg:w-60 xl:w-64">
                <Sidebar />
              </div>
              <div className="h-[560px] min-w-0 flex-1 lg:h-auto">
                <ViewportPanel />
              </div>
              <div className="w-full shrink-0 lg:w-auto">
                <RightPanel />
              </div>
            </div>
            <FooterStrip />
          </main>
        </div>
      </SoundProvider>
    </BuildProvider>
  )
}

export default App
