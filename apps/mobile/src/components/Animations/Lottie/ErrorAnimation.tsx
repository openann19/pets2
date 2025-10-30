/**
 * 🎬 ERROR LOTTIE ANIMATION
 * Animated error indicator
 */

// React import not required with React 17+ JSX transform
import { LottieAnimation } from './LottieAnimation';

interface ErrorAnimationProps {
  size?: number;
  onFinish?: () => void;
  style?: any;
}

export function ErrorAnimation({ size = 140, onFinish, style }: ErrorAnimationProps) {
  const errorAnimation = {
    v: '5.7.4',
    fr: 60,
    ip: 0,
    op: 90,
    w: 200,
    h: 200,
    nm: 'Error',
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: 'X',
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: {
            a: 1,
            k: [
              {
                i: { x: [0.833], y: [0.833] },
                o: { x: [0.167], y: [0.167] },
                t: 0,
                s: [0],
              },
              { t: 90, s: [360] },
            ],
          },
          p: { a: 0, k: [100, 100, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: {
            a: 1,
            k: [
              {
                i: { x: [0.833, 0.833, 0.833], y: [0.833, 0.833, 0.833] },
                o: { x: [0.167, 0.167, 0.167], y: [0.167, 0.167, 0.167] },
                t: 0,
                s: [0, 0, 100],
              },
              {
                i: { x: [0.833, 0.833, 0.833], y: [0.833, 0.833, 0.833] },
                o: { x: [0.167, 0.167, 0.167], y: [0.167, 0.167, 0.167] },
                t: 30,
                s: [100, 100, 100],
              },
              { t: 90, s: [100, 100, 100] },
            ],
          },
        },
        ao: 0,
        shapes: [
          {
            ty: 'gr',
            it: [
              {
                d: 1,
                ty: 'el',
                s: { a: 0, k: [80, 80] },
                p: { a: 0, k: [0, 0] },
                nm: 'Ellipse Path 1',
                mn: 'ADBE Vector Shape - Ellipse',
                hd: false,
              },
              {
                ty: 'st',
                c: { a: 0, k: [1, 0.2, 0.2, 1] },
                o: { a: 0, k: 100 },
                w: { a: 0, k: 8 },
                lc: 2,
                lj: 1,
                ml: 4,
                bm: 0,
                d: [{ n: 'd', nm: 'dash', v: 0 }],
                nm: 'Stroke 1',
                mn: 'ADBE Vector Graphic - Stroke',
                hd: false,
              },
            ],
            nm: 'Circle',
            np: 2,
            cix: 2,
            bm: 0,
            ix: 1,
            mn: 'ADBE Vector Group',
            hd: false,
          },
        ],
        ip: 0,
        op: 90,
        st: 0,
        bm: 0,
      },
    ],
    markers: [],
  };

  return (
    <LottieAnimation
      source={errorAnimation}
      width={size}
      height={size}
      autoPlay={true}
      loop={false}
      speed={1.5}
      {...(onFinish ? { onAnimationFinish: onFinish } : {})}
      style={style}
    />
  );
}
