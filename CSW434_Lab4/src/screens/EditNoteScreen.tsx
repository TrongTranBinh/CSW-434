import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  addDoc,
  collection,
  doc,
  getFirestore,
  serverTimestamp,
  updateDoc,
} from '@react-native-firebase/firestore';

import type { RootStackParamList } from '../types/navigation';


type Props = NativeStackScreenProps<RootStackParamList, 'EditNote'>;

const db = getFirestore();
const CARD_COLORS = ['#C8F7C5', '#C5C8F7', '#F7C5D0', '#F7EFC5', '#B2EBF2', '#F3C5F7'];

export default function EditNoteScreen({ navigation, route }: Props) {
  const { uid, note } = route.params;
  const isEditing = Boolean(note?.id);

  const [title, setTitle] = useState<string>(note?.title ?? '');
  const [content, setContent] = useState<string>(note?.content ?? '');
  const [saving, setSaving] = useState<boolean>(false);

  const handleSaveNote = async () => {
    if (saving) return;
    const cleanTitle = title.trim();
    const cleanContent = content.trim();

    if (!cleanTitle && !cleanContent) {
      Alert.alert('Validation', 'Please enter a title or content.');
      return;
    }

    setSaving(true);
    try {
      if (isEditing && note) {
        await updateDoc(doc(db, 'users', uid, 'notes', note.id), {
          title: cleanTitle || 'Untitled',
          content: cleanContent,
          updatedAt: serverTimestamp(),
        });
      } else {
        const randomColor =
          CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)];
        await addDoc(collection(db, 'users', uid, 'notes'), {
          title: cleanTitle || 'Untitled',
          content: cleanContent,
          color: randomColor,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      navigation.navigate('Notes', { uid });
    } catch (err) {
      Alert.alert('Save error', String((err as Error)?.message ?? err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.editorScreen} >
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.editorHeading}>
          {isEditing ? 'Edit Note' : 'New Note'}
        </Text>
        <Pressable
          style={styles.saveBtn}
          onPress={handleSaveNote}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>
            {saving ? 'Saving...' : 'Save Note'}
          </Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.titleInput}
        placeholder="Note title..."
        placeholderTextColor="#64748b"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={styles.contentInput}
        placeholder="Write note content..."
        placeholderTextColor="#64748b"
        multiline
        textAlignVertical="top"
        value={content}
        onChangeText={setContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  editorScreen: { flex: 1, backgroundColor: '#f7efc5', padding: 16, paddingTop: 50 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  backText: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  editorHeading: { fontSize: 17, fontWeight: '700', color: '#0f172a' },
  saveBtn: {
    backgroundColor: '#1565c0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 13 },
  titleInput: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    borderBottomWidth: 1,
    borderColor: '#cbd5e1',
    paddingBottom: 10,
    marginBottom: 14,
  },
  contentInput: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
    lineHeight: 22,
    textAlign: "justify"
  },
});