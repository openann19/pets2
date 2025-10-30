import { Worker } from 'bullmq';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';
import { buildFilter } from './template.js';

const redis = { connection: { url: process.env.REDIS_URL! } };
const bucket = process.env.S3_BUCKET!;
const s3 = new S3Client({ 
  region:'us-east-1', 
  endpoint: process.env.S3_ENDPOINT, 
  forcePathStyle: true,
  credentials: { 
    accessKeyId: process.env.S3_ACCESS_KEY!, 
    secretAccessKey: process.env.S3_SECRET_KEY! 
  } 
});

async function download(url: string, file: string) {
  if (url.startsWith('s3://')) {
    const Key = url.replace(`s3://${bucket}/`, '');
    const out = await s3.send(new GetObjectCommand({ Bucket: bucket, Key }));
    await fs.writeFile(file, Buffer.from(await (await out.Body!.transformToByteArray())));
  } else {
    const res = await fetch(url); 
    const buf = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(file, buf);
  }
}

new Worker(process.env.RENDER_QUEUE || 'render', async (job) => {
  const { reelId } = job.data as { reelId: string };

  // Fetch render context (spec, clips, track) from API
  const ctx = await (await fetch(`${process.env.API_URL}/render-context/${reelId}`)).json();
  const { spec, clips, track, vars, durationMs } = ctx;

  const work = path.join('/tmp', `reel_${reelId}`); 
  await fs.mkdir(work, { recursive: true });

  // Download media
  const trackPath = path.join(work, 'track.mp3'); 
  await download(track.url, trackPath);
  
  const clipPaths: string[] = [];
  for (let i=0;i<clips.length;i++) {
    const p = path.join(work, `clip${i}.mp4`);
    await download(clips[i].url, p);
    clipPaths.push(p);
  }

  const filter = buildFilter(spec, clips.length, vars || {});
  const out = path.join(work, 'out.mp4');

  const inputs = ['-y','-i', trackPath, ...clipPaths.flatMap(p => ['-i', p])];
  const filterComplex = [
    '-filter_complex', filter, 
    '-map', '[txt]', 
    '-map', '0:a',
    '-r','30',
    '-pix_fmt','yuv420p',
    '-c:v','libx264',
    '-preset','veryfast',
    '-crf','20',
    '-c:a','aac',
    '-b:a','192k',
    '-shortest', 
    out
  ];

  await execa('ffmpeg', [...inputs, ...filterComplex]);

  // Upload result to S3
  const key = `reels/${reelId}/out.mp4`;
  await s3.send(new PutObjectCommand({ 
    Bucket: bucket, 
    Key: key, 
    Body: await fs.readFile(out), 
    ContentType: 'video/mp4' 
  }));

  // Callback API to mark public
  await fetch(`${process.env.API_URL}/render-callback/${reelId}`, {
    method:'POST', 
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ 
      mp4Url: `s3://${bucket}/${key}`, 
      posterUrl: null, 
      durationMs 
    })
  });
}, redis);

console.log('Render worker started');

