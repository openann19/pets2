export type TemplateSpec = {
  canvas: { w:number; h:number; fps:number; bg:string };
  music: { bpm:number; offsetMs:number };
  timeline: { t:number; clip:number; inMs:number; durMs:number; transOut:string }[];
  overlays?: any[];
  styles?: Record<string, any>;
  cta?: { variant: 'adopt'|'follow'|'challenge', t:number };
};

export function buildFilter(spec: TemplateSpec, clipCount: number, vars: Record<string,string>): string {
  // Scale/format each input clip to canvas
  const pre = Array.from({length: clipCount}, (_,i)=>`
    [${i+1}:v]scale=${spec.canvas.w}:${spec.canvas.h},format=yuv420p,setpts=PTS-STARTPTS[v${i}];
  `).join('\n');

  // Trim segments and concatenate using xfade with defined transitions
  let chain = '';
  let last = '';
  spec.timeline.forEach((seg, idx) => {
    chain += `[v${seg.clip}]trim=${seg.inMs/1000}:${(seg.inMs+seg.durMs)/1000},setpts=PTS-STARTPTS[a${idx}];\n`;
    if (idx === 0) { 
      last = `a0`; 
      return; 
    }
    const off = spec.timeline.slice(0, idx).reduce((s, p) => s + p.durMs, 0)/1000;
    const tr = (seg.transOut || 'fade').toLowerCase();
    chain += `[${last}][a${idx}]xfade=transition=${tr}:duration=0.20:offset=${off.toFixed(2)}[x${idx}];\n`;
    last = `x${idx}`;
  });

  const text = vars['TITLE'] ? `
    [${last}]drawtext=fontfile=assets/fonts/Inter-Bold.ttf:text='${vars['TITLE'].replace(/:/g,'\\:')}':x=(w-text_w)/2:y=0.12*h:fontsize=64:fontcolor=white:shadowx=2:shadowy=2:shadowcolor=0x000000AA[txt]
  ` : `[${last}]copy[txt]`;

  return pre + '\n' + chain + '\n' + text;
}

