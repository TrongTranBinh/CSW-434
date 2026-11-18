import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ScrollView,
} from 'react-native';
import NativeNfcModule from './specs/NativeNfcModule';

function App(): React.JSX.Element {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [tagData, setTagData] = useState<string | null>(null);

  // Kiểm tra NFC khi app khởi động
  useEffect(() => {
    const checkNfc = async () => {
      try {
        const supported = await NativeNfcModule.isSupported();
        setIsSupported(supported);
        if (supported) {
          const enabled = await NativeNfcModule.isEnabled();
          setIsEnabled(enabled);
        }
      } catch (e) {
        console.error('Lỗi kiểm tra NFC:', e);
      }
    };
    checkNfc();
  }, []);

  const handleStartReading = async () => {
    try {
      setTagData(null);
      setIsReading(true);
      const result = await NativeNfcModule.startReading();
      if (result.success) {
        setTagData(result.payload ?? 'Không có dữ liệu NDEF');
      } else {
        Alert.alert('Lỗi', result.error ?? 'Không đọc được thẻ');
      }
    } catch (e: any) {
      Alert.alert('Lỗi', e.message);
    } finally {
      setIsReading(false);
    }
  };

  const handleStopReading = async () => {
    await NativeNfcModule.stopReading();
    setIsReading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>NFC Reader</Text>

        {/* Trạng thái thiết bị */}
        <View style={styles.card}>
          <Text style={styles.label}>Thiết bị hỗ trợ NFC:</Text>
          <Text style={styles.value}>
            {isSupported === null ? 'Đang kiểm tra...' : isSupported ? '✅ Có' : '❌ Không'}
          </Text>

          <Text style={styles.label}>NFC đang bật:</Text>
          <Text style={styles.value}>
            {isEnabled === null ? 'Đang kiểm tra...' : isEnabled ? '✅ Có' : '❌ Chưa bật'}
          </Text>
        </View>

        {/* Nút điều khiển */}
        {isSupported && (
          <TouchableOpacity
            style={[styles.button, isReading && styles.buttonActive]}
            onPress={isReading ? handleStopReading : handleStartReading}
            disabled={!isEnabled}>
            <Text style={styles.buttonText}>
              {isReading ? '⏹ Dừng đọc' : '📡 Bắt đầu đọc thẻ NFC'}
            </Text>
          </TouchableOpacity>
        )}

        {isReading && (
          <Text style={styles.hint}>
            👉 Đưa thẻ NFC lại gần điện thoại...
          </Text>
        )}

        {/* Hiển thị dữ liệu đọc được */}
        {tagData !== null && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>📄 Dữ liệu từ thẻ:</Text>
            <Text style={styles.resultText}>{tagData}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#1a1a1a',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  label: { fontSize: 14, color: '#666', marginTop: 8 },
  value: { fontSize: 18, fontWeight: '600', color: '#1a1a1a', marginBottom: 8 },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonActive: { backgroundColor: '#FF3B30' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  hint: { textAlign: 'center', color: '#666', fontStyle: 'italic', marginBottom: 16 },
  resultCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  resultTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#2E7D32' },
  resultText: { fontSize: 15, color: '#1a1a1a', fontFamily: 'monospace' },
});

export default App;