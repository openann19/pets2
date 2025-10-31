#!/usr/bin/env node
import { readFileSync, mkdirSync, writeFileSync, existsSync } from "fs";
import { dirname, join } from "path";

const MANIFEST = JSON.parse(readFileSync("parity/screens.json","utf8"));
for (const [name, cfg] of Object.entries(MANIFEST)) {
  const routeDir = join(cfg.webRoute);
  const pageFile = join(routeDir, "page.tsx");
  const orchFile = join(routeDir, `${name}.orchestrator.web.tsx`);

  mkdirSync(routeDir, { recursive: true });

  if (!existsSync(orchFile)) {
    writeFileSync(orchFile, `import React from "react";
import { useTheme } from "@pawfectmatch/ui/theme/useTheme";
import { FeedList } from "@pawfectmatch/ui/components/FeedList";
export default function ${name}Orchestrator(){
  const t = useTheme();
  return (<main style={{background: 'var(--color-bg)', color:'var(--color-text)'}}>
    <div style={{maxWidth: 1200, margin: '0 auto', padding: 24}}>
      <h1 style={{fontSize: 32, marginBottom: 16}}>${name}</h1>
      <FeedList />
    </div>
  </main>);
}
`);
  }
  if (!existsSync(pageFile)) {
    writeFileSync(pageFile, `import Orchestrator from "./${name}.orchestrator.web";
export default function Page(){ return <Orchestrator/> }`);
  }
}
console.log("✅ Generated missing web screens.");
