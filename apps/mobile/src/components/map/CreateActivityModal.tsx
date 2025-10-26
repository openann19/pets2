import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { startPetActivity, type ActivityKind } from '../../services/petActivityService';
import { logger } from '../../services/logger';

export interface ActivityType {
  id: string;
  label: string;
  emoji?: string;
}

export interface PetLite {
  _id: string;
  name: string;
}

export interface CreateActivityForm {
  petId: string;
  activity: string;
  message: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  pets: PetLite[];
  activityTypes: string[] | ActivityType[];
}

export default function CreateActivityModal({ visible, onClose, pets, activityTypes }: Props) {
  const [pet, setPet] = useState<string | null>(pets?.[0]?._id ?? null);
  const [act, setAct] = useState<string | null>(
    typeof activityTypes[0] === 'string' ? (activityTypes[0] as string) : (activityTypes[0] as ActivityType).id
  );
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!pet || !act) return;
    try {
      setLoading(true);
      await startPetActivity({ petId: pet, activity: act as ActivityKind, message: msg });
      onClose();
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Failed to start activity', { error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={s.container}>
        <Text style={s.header}>Start Activity</Text>
        <Text style={s.subHeader}>Pet</Text>
        {pets.map(p => (
          <TouchableOpacity key={p._id} onPress={() => setPet(p._id)} style={[s.option, pet === p._id && s.selected]}>
            <Text>{p.name}</Text>
          </TouchableOpacity>
        ))}

        <Text style={[s.subHeader, { marginTop: 12 }]}>Activity</Text>
        {activityTypes.map((t) => {
          const id = typeof t === 'string' ? t : t.id;
          const label = typeof t === 'string' ? t : `${t.emoji ?? ''} ${t.label}`;
          return (
            <TouchableOpacity key={id} onPress={() => setAct(id)} style={[s.option, act === id && s.selected]}>
              <Text>{label}</Text>
            </TouchableOpacity>
          );
        })}

        <TextInput
          value={msg}
          onChangeText={setMsg}
          placeholder="Message (optional)"
          style={s.input}
          placeholderTextColor="#999"
        />
        <View style={s.actions}>
          <TouchableOpacity onPress={onClose} style={s.button}>
            <Text>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={submit} style={[s.button, s.primaryButton]} disabled={loading}>
            <Text style={s.primaryText}>{loading ? 'Sharing...' : 'Share'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontWeight: '700', fontSize: 18, marginBottom: 8 },
  subHeader: { fontWeight: '600', fontSize: 14, marginBottom: 8, marginTop: 8 },
  option: { padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, marginBottom: 8 },
  selected: { borderColor: '#4f46e5', backgroundColor: '#eef2ff' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginTop: 8, color: '#111' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 16 },
  button: { padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, flex: 1, alignItems: 'center' },
  primaryButton: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  primaryText: { color: '#fff', fontWeight: '600' },
});
