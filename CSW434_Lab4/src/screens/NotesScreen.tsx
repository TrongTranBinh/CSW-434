import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  PermissionsAndroid,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from '@react-native-firebase/firestore';
import { getMessaging, getToken } from '@react-native-firebase/messaging';
import type { NoteItem, RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Notes'>;

const db = getFirestore();
const CARD_COLORS = ['#C8F7C5', '#C5C8F7', '#F7C5D0', '#F7EFC5', '#B2EBF2', '#F3C5F7'];

export default function NotesScreen({ navigation, route }: Props) {
  const { uid } = route.params;
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [errorText, setErrorText] = useState<string>('');
  const [fcmToken, setFcmToken] = useState<string>('');

  // Lắng nghe ghi chú real-time từ Firestore
  useEffect(() => {
    if (!uid) {
      setNotes([]);
      return;
    }

    const notesRef = collection(db, 'users', uid, 'notes');
    const q = query(notesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const list: NoteItem[] = snapshot.docs.map((snap, index) => {
          const data = snap.data();
          return {
            id: snap.id,
            title: typeof data.title === 'string' ? data.title : '',
            content: typeof data.content === 'string' ? data.content : '',
            color:
              typeof data.color === 'string'
                ? data.color
                : CARD_COLORS[index % CARD_COLORS.length],
          };
        });
        setNotes(list);
        setErrorText('');
      },
      err => {
        setErrorText(String((err as Error)?.message ?? err));
      }
    );

    return unsubscribe;
  }, [uid]);

  // Xin quyền Android 13+, lấy FCM token và lưu lên Firestore
  useEffect(() => {
    async function initFcmToken() {
      try {
        if (Platform.OS === 'android' && Platform.Version >= 33) {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
        }

        const messagingInstance = getMessaging();
        const token = await getToken(messagingInstance);
        setFcmToken(token);

        if (token && uid) {
          await setDoc(
            doc(db, 'deviceTokens', token),
            {
              token,
              uid,
              platform: Platform.OS,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        }
      } catch (err) {
        console.error('FCM token error:', err);
      }
    }

    void initFcmToken();
  }, [uid]);

  // Xóa ghi chú khi chạm vào thẻ
  const handleDeleteNote = (item: NoteItem) => {
    Alert.alert(
      'Delete Note',
      `Delete "${item.title || 'this note'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'users', uid, 'notes', item.id));
            } catch (err) {
              Alert.alert('Delete error', String((err as Error)?.message ?? err));
            }
          },
        },
      ]
    );
  };

  const renderNoteCard = ({ item }: { item: NoteItem }) => (
    <Pressable
      style={[styles.card, { backgroundColor: item.color }]}
      onPress={() => navigation.navigate('EditNote', { uid, note: item })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title || 'Untitled'}
        </Text>
      </View>
      <Text style={styles.cardContent} numberOfLines={5}>
        {item.content}
      </Text>
      <Pressable
        onPress={() => handleDeleteNote(item)}
        style={styles.deleteBadge}
      >
        <Text style={styles.deleteBadgeText}>Delete</Text>
      </Pressable>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recent Notes</Text>
        <Text style={styles.uidText}>UID: {uid.slice(0, 8)}...</Text>
      </View>

      {fcmToken ? (
        <Text style={styles.tokenText} numberOfLines={1}>
          FCM Token: {fcmToken}
        </Text>
      ) : null}

      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

      <FlatList
        data={notes}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        renderItem={renderNoteCard}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No notes yet. Tap + to add one.</Text>
        }
      />

      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate('EditNote', { uid, note: null })}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  uidText: { fontSize: 12, color: '#64748b' },
  tokenText: {
    fontSize: 11,
    color: '#64748b',
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  errorText: { color: '#b91c1c', paddingHorizontal: 16, marginBottom: 8 },
  row: { justifyContent: 'space-between' },
  listContent: { paddingHorizontal: 14, paddingBottom: 90 },
  card: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    minHeight: 130,
    justifyContent: 'center',
    alignItems: "center"
  },
  cardHeader: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: "center",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "black"
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    textAlign: "center"
  },
  deleteBadge: {
    width: "80%",
    backgroundColor: 'rgba(231, 23, 23, 0.81)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 10
  },
  deleteBadgeText: { fontSize: 13, fontWeight: '700', color: '#fcfcfc', textAlign: "center" },
  cardContent: { fontSize: 13, color: '#334155', lineHeight: 18 },
  tapHint: { fontSize: 11, color: '#475569', marginTop: 8 },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    marginTop: 40,
    fontSize: 15,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e54d4d',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  fabText: { color: '#ffffff', fontSize: 30, lineHeight: 32 },
});