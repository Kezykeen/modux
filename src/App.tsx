import { BuildProvider } from "./state/BuildContext";
import { SoundProvider } from "./state/SoundContext";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { ViewportPanel } from "./components/viewport/ViewportPanel";
import { RightPanel } from "./components/RightPanel";
import { FooterStrip } from "./components/FooterStrip";

function App() {
  return (
    <BuildProvider>
      <SoundProvider>
        <div className="bg-noise flex h-dvh flex-col overflow-hidden bg-void">
          <Header />
          <main className="flex min-h-0 w-full flex-1 flex-col px-4 pt-4 pb-2 sm:px-6">
            <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row lg:items-stretch">
              <div className="hidden min-h-0 w-56 shrink-0 lg:block xl:w-60">
                <Sidebar />
              </div>
              <div className="min-h-0 min-w-0 flex-1">
                <ViewportPanel />
              </div>
              <div className="flex min-h-0 w-full shrink-0 lg:w-104 xl:w-122.75">
                <RightPanel />
              </div>
            </div>
            <FooterStrip />
          </main>
        </div>
      </SoundProvider>
    </BuildProvider>
  );
}

export default App;
