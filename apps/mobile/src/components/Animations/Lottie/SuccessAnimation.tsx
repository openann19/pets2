/**
 * 🎬 SUCCESS LOTTIE ANIMATION
 * Animated success checkmark
 */

// React import not required with React 17+ JSX transform
import { LottieAnimation } from './LottieAnimation';

interface SuccessAnimationProps {
  size?: number;
  onFinish?: () => void;
  style?: any;
}

export function SuccessAnimation({ size = 140, onFinish, style }: SuccessAnimationProps) {
  const successAnimation = {
    v: '5.7.4',
    fr: 60,
    ip: 0,
    op: 120,
    w: 512,
    h: 512,
    nm: 'Success',
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: 'Checkmark',
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [256, 256, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] },
        },
        ao: 0,
        shapes: [
          {
            ty: 'gr',
            it: [
              {
                d: 1,
                ty: 'el',
                s: { a: 0, k: [100, 100] },
                p: { a: 0, k: [0, 0] },
                nm: 'Ellipse Path 1',
                mn: 'ADBE Vector Shape - Ellipse',
                hd: false,
              },
              {
                ty: 'st',
                c: { a: 0, k: [0.2, 0.8, 0.4, 1] },
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
            nm: 'Ellipse 1',
            np: 2,
            cix: 2,
            bm: 0,
            ix: 1,
            mn: 'ADBE Vector Group',
            hd: false,
          },
        ],
        ip: 0,
        op: 120,
        st: 0,
        bm: 0,
      },
    ],
    markers: [],
  };

  return (
    <LottieAnimation
      source={successAnimation}
      width={size}
      height={size}
      autoPlay={true}
      loop={false}
      speed={1.2}
      {...(onFinish ? { onAnimationFinish: onFinish } : {})}
      style={style}
    />
  );
}
