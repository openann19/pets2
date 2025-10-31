import React from "react";
import { useTheme } from "@pawfectmatch/ui/theme/useTheme";
import { FeedList } from "@pawfectmatch/ui/components/FeedList";
export default function AdoptOrchestrator(){
  const t = useTheme();
  return (<main style={{background: 'var(--color-bg)', color:'var(--color-text)'}}>
    <div style={{maxWidth: 1200, margin: '0 auto', padding: 24}}>
      <h1 style={{fontSize: 32, marginBottom: 16}}>Adopt</h1>
      <FeedList />
    </div>
  </main>);
}
