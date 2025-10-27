/**
 * 🎬 LOADING LOTTIE ANIMATION
 * Animated loading spinner
 */

import React from "react";
import { LottieAnimation } from "./LottieAnimation";

interface LoadingAnimationProps {
  size?: number;
  style?: any;
}

export function LoadingAnimation({ size = 120, style }: LoadingAnimationProps) {
  const loadingAnimation = {
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 90,
    w: 200,
    h: 200,
    nm: "Loading",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Circle",
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
          s: { a: 0, k: [100, 100, 100] },
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                d: 1,
                ty: "el",
                s: { a: 0, k: [80, 80] },
                p: { a: 0, k: [0, 0] },
                nm: "Ellipse Path 1",
                mn: "ADBE Vector Shape - Ellipse",
                hd: false,
              },
              {
                ty: "st",
                c: { a: 0, k: [0.3, 0.6, 1, 1] },
                o: { a: 0, k: 100 },
                w: { a: 0, k: 6 },
                lc: 2,
                lj: 1,
                ml: 4,
                bm: 0,
                d: [{ n: "d", nm: "dash", v: 0 }],
                nm: "Stroke 1",
                mn: "ADBE Vector Graphic - Stroke",
                hd: false,
              },
            ],
            nm: "Circle",
            np: 2,
            cix: 2,
            bm: 0,
            ix: 1,
            mn: "ADBE Vector Group",
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
      source={loadingAnimation}
      width={size}
      height={size}
      autoPlay={true}
      loop={true}
      speed={1}
      style={style}
    />
  );
}
