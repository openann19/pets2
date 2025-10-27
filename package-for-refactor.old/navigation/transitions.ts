// src/navigation/transitions.ts
import { TransitionPresets } from '@react-navigation/stack';
export const screenTransitions = {
  iosModal: { ...TransitionPresets.ModalSlideFromBottomIOS, gestureEnabled: true },
  iosPush:  { ...TransitionPresets.SlideFromRightIOS, gestureEnabled: true },
  androidFade: { ...TransitionPresets.FadeFromBottomAndroid },
};
