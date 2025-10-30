/**
 * QR Code Generator Endpoint
 * Generates PNG QR codes for reel sharing
 */

import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('u');

  if (!url) {
    return NextResponse.json({ error: 'Missing "u" parameter' }, { status: 400 });
  }

  try {
    const png = await QRCode.toBuffer(url, {
      margin: 1,
      width: 512,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return new NextResponse(png, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('QR generation failed:', error);
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
  }
}

