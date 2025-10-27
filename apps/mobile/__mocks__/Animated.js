/**
 * Animated Module Mock
 * Provides a working mock for React Native's Animated API
 */

class AnimatedValue {
  _value;
  _listeners;
  _animation;
  
  constructor(value) {
    this._value = value || 0;
    this._listeners = new Set();
    this._animation = null;
  }
  
  setValue(value) {
    this._value = value;
    this._listeners.forEach(listener => listener && listener({ value }));
  }
  
  setOffset(value) {
    return this;
  }
  
  flattenOffset() {
    return this;
  }
  
  addListener(callback) {
    this._listeners.add(callback);
  }
  
  removeListener(callback) {
    this._listeners.delete(callback);
  }
  
  removeAllListeners() {
    this._listeners.clear();
  }
  
  interpolate(config) {
    return this;
  }
  
  stopAnimation() {
    if (this._animation && this._animation.stop) {
      this._animation.stop();
    }
  }
  
  setAnimation(animation) {
    this._animation = animation;
  }
}

class AnimatedValueXY {
  x;
  y;
  
  constructor(xy = {x: 0, y: 0}) {
    this.x = new AnimatedValue(xy.x);
    this.y = new AnimatedValue(xy.y);
  }
  
  setValue(xy) {
    this.x.setValue(xy.x);
    this.y.setValue(xy.y);
  }
  
  setOffset() {}
  
  flattenOffset() {}
  
  stopAnimation() {
    this.x.stopAnimation();
    this.y.stopAnimation();
  }
  
  getValue() {
    return { x: this.x._value, y: this.y._value };
  }
}

class MockAnimatedConfig {
  constructor() {
    this._config = {};
    this._animation = null;
  }
  
  start(callback) {
    if (callback) setTimeout(callback, 0);
    this._animation = { stop: jest.fn() };
    return this._animation;
  }
  
  stop() {
    if (this._animation) {
      this._animation.stop();
    }
  }
}

const RN = require('react-native');

const Animated = {
  Value: AnimatedValue,
  ValueXY: AnimatedValueXY,
  View: RN.View,
  Text: RN.Text,
  Image: RN.Image,
  ScrollView: RN.ScrollView,
  
  timing: jest.fn((value, config) => {
    const mock = new MockAnimatedConfig();
    return mock;
  }),
  
  spring: jest.fn((value, config) => {
    const mock = new MockAnimatedConfig();
    return mock;
  }),
  
  decay: jest.fn((value, config) => {
    const mock = new MockAnimatedConfig();
    return mock;
  }),
  
  sequence: jest.fn((animations) => {
    const mock = new MockAnimatedConfig();
    return mock;
  }),
  
  parallel: jest.fn((animations) => {
    const mock = new MockAnimatedConfig();
    return mock;
  }),
  
  stagger: jest.fn((time, animations) => {
    const mock = new MockAnimatedConfig();
    return mock;
  }),
  
  loop: jest.fn((animation) => {
    const mock = new MockAnimatedConfig();
    return mock;
  }),
  
  delay: jest.fn((delay) => {
    const mock = new MockAnimatedConfig();
    return mock;
  }),
  
  createAnimatedComponent: jest.fn(component => component),
  
  // Additional methods that might be called
  add: jest.fn(),
  subtract: jest.fn(),
  multiply: jest.fn(),
  divide: jest.fn(),
  modulo: jest.fn(),
  diffClamp: jest.fn(),
};

module.exports = Animated;

