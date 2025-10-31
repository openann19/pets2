/**
 * 🧪 MOTION LAB
 * 
 * Internal development screen for testing animations, performance, and motion tokens
 * 
 * Features:
 * - Knobs for duration/easing/spring
 * - Toggles for reduced motion, low-end mode
 * - FPS + dropped frames counter
 * - Record 5-second traces
 * - Scene presets (Home, Card Stack, Details)
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useCapabilities } from '@/foundation/capabilities';
import { durations, easings, springs, getEasingArray, getSpringConfig } from '@/foundation/motion';
import { useReduceMotion } from '@/hooks/useReducedMotion';
import { PERFORMANCE_BUDGETS } from '@/foundation/performance-budgets';

export function MotionLabScreen() {
  const caps = useCapabilities();
  const reduceMotion = useReduceMotion();
  
  // Scene selection
  const [selectedScene, setSelectedScene] = useState<'home' | 'card-stack' | 'details'>('home');
  
  // Animation knobs
  const [duration, setDuration] = useState<keyof typeof durations>('md');
  const [easing, setEasing] = useState<keyof typeof easings>('enter');
  const [spring, setSpring] = useState<keyof typeof springs>('standard');
  
  // Toggles
  const [lowEndMode, setLowEndMode] = useState(false);
  const [showFPS, setShowFPS] = useState(true);
  
  // Performance tracking
  const [fps, setFPS] = useState(60);
  const [droppedFrames, setDroppedFrames] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  
  // Get current scene budget
  const budget = PERFORMANCE_BUDGETS[selectedScene] || PERFORMANCE_BUDGETS.default;
  
  // FPS tracking (simplified - in production use native module)
  useEffect(() => {
    if (!showFPS) return;
    
    let frameCount = 0;
    let lastTime = Date.now();
    
    const interval = setInterval(() => {
      frameCount++;
      const now = Date.now();
      const elapsed = now - lastTime;
      
      if (elapsed >= 1000) {
        const currentFPS = Math.round((frameCount * 1000) / elapsed);
        setFPS(currentFPS);
        
        // Count dropped frames (< 60fps)
        if (currentFPS < 60) {
          setDroppedFrames((prev) => prev + (60 - currentFPS));
        }
        
        frameCount = 0;
        lastTime = now;
      }
    }, 16); // ~60fps
    
    return () => clearInterval(interval);
  }, [showFPS]);
  
  const handleRecord = useCallback(() => {
    setIsRecording(true);
    setDroppedFrames(0);
    
    // Record for 5 seconds
    setTimeout(() => {
      setIsRecording(false);
    }, 5000);
  }, []);
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧪 Motion Lab</Text>
        <Text style={styles.subtitle}>Test animations, performance, and motion tokens</Text>
      </View>
      
      {/* Device Capabilities */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device Capabilities</Text>
        <View style={styles.row}>
          <Text style={styles.label}>High Performance:</Text>
          <Text style={styles.value}>{caps.highPerf ? '✅' : '❌'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Skia:</Text>
          <Text style={styles.value}>{caps.skia ? '✅' : '❌'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>HDR:</Text>
          <Text style={styles.value}>{caps.hdr ? '✅' : '❌'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Thermals OK:</Text>
          <Text style={styles.value}>{caps.thermalsOk ? '✅' : '❌'}</Text>
        </View>
      </View>
      
      {/* Scene Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Scene Presets</Text>
        <View style={styles.buttonRow}>
          {(['home', 'card-stack', 'details'] as const).map((scene) => (
            <TouchableOpacity
              key={scene}
              style={[
                styles.button,
                selectedScene === scene && styles.buttonActive,
              ]}
              onPress={() => setSelectedScene(scene)}
            >
              <Text style={styles.buttonText}>{scene}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.budget}>
          <Text style={styles.budgetLabel}>Budget:</Text>
          <Text style={styles.budgetText}>
            Blur: ≤{budget.maxBlurRadius}px, Particles: ≤{budget.maxParticles}, 
            FPS: {budget.targetFPS}
          </Text>
        </View>
      </View>
      
      {/* Animation Knobs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Animation Knobs</Text>
        
        <View style={styles.knob}>
          <Text style={styles.label}>Duration:</Text>
          <View style={styles.buttonRow}>
            {(Object.keys(durations) as Array<keyof typeof durations>).map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.button, duration === d && styles.buttonActive]}
                onPress={() => setDuration(d)}
              >
                <Text style={styles.buttonText}>{d} ({durations[d]}ms)</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.knob}>
          <Text style={styles.label}>Easing:</Text>
          <View style={styles.buttonRow}>
            {(Object.keys(easings) as Array<keyof typeof easings>).map((e) => (
              <TouchableOpacity
                key={e}
                style={[styles.button, easing === e && styles.buttonActive]}
                onPress={() => setEasing(e)}
              >
                <Text style={styles.buttonText}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.knob}>
          <Text style={styles.label}>Spring:</Text>
          <View style={styles.buttonRow}>
            {(Object.keys(springs) as Array<keyof typeof springs>).map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.button, spring === s && styles.buttonActive]}
                onPress={() => setSpring(s)}
              >
                <Text style={styles.buttonText}>
                  {s} (k:{springs[s].k}, c:{springs[s].c})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      
      {/* Toggles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Toggles</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Reduce Motion:</Text>
          <Switch value={reduceMotion} disabled />
          <Text style={styles.value}>{reduceMotion ? 'ON' : 'OFF'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Low-End Mode:</Text>
          <Switch value={lowEndMode} onValueChange={setLowEndMode} />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Show FPS:</Text>
          <Switch value={showFPS} onValueChange={setShowFPS} />
        </View>
      </View>
      
      {/* Performance Metrics */}
      {showFPS && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Metrics</Text>
          <View style={styles.row}>
            <Text style={styles.label}>FPS:</Text>
            <Text style={[styles.value, fps < 60 && styles.warning]}>
              {fps}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Dropped Frames:</Text>
            <Text style={[styles.value, droppedFrames > 0 && styles.warning]}>
              {droppedFrames}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.button, styles.recordButton, isRecording && styles.recording]}
            onPress={handleRecord}
          >
            <Text style={styles.buttonText}>
              {isRecording ? 'Recording... (5s)' : 'Record 5s Trace'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Current Config */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Config</Text>
        <View style={styles.config}>
          <Text style={styles.configText}>
            Duration: {durations[duration]}ms{'\n'}
            Easing: {JSON.stringify(getEasingArray(easing))}{'\n'}
            Spring: {JSON.stringify(getSpringConfig(spring))}{'\n'}
            Reduced: {reduceMotion ? 'Yes' : 'No'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  warning: {
    color: '#f44336',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    marginRight: 8,
    marginBottom: 8,
  },
  buttonActive: {
    backgroundColor: '#ec4899',
  },
  buttonText: {
    fontSize: 12,
    color: '#000',
  },
  knob: {
    marginBottom: 16,
  },
  budget: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  budgetLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  budgetText: {
    fontSize: 12,
    color: '#666',
  },
  recordButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  recording: {
    backgroundColor: '#f44336',
  },
  config: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  configText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});

export default MotionLabScreen;

