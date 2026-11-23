import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  DeviceEventEmitter,
  Animated,
} from 'react-native';
import NativeNfcModule from './specs/NativeNfcModule';

export default function App() {
  const [activeTab, setActiveTab] = useState<'nfc' | 'compass'>('compass');

  // --- State cho Exercise 1: NFC ---
  const [nfcSupported, setNfcSupported] = useState<boolean>(false);
  const [nfcEnabled, setNfcEnabled] = useState<boolean>(false);
  const [tagData, setTagData] = useState<{ id: string; tech: string } | null>(null);

  // --- State cho Exercise 2: Compass ---
  const [heading, setHeading] = useState<number>(0);
  const rotateAnim = useState(new Animated.Value(0))[0];

  // Khởi tạo NFC Listener
  useEffect(() => {
    async function checkNfc() {
      try {
        const supported = await NativeNfcModule.isSupported();
        const enabled = await NativeNfcModule.isEnabled();
        setNfcSupported(supported);
        setNfcEnabled(enabled);
      } catch (e) {
        console.warn(e);
      }
    }
    checkNfc();

    const nfcSub = DeviceEventEmitter.addListener('onNfcTagDetected', (data) => {
      setTagData(data);
    });

    return () => nfcSub.remove();
  }, []);

  // Khởi tạo Compass Listener khi ở tab Compass
  useEffect(() => {
    if (activeTab === 'compass') {
      NativeNfcModule.startCompass();
      const compassSub = DeviceEventEmitter.addListener('onCompassChange', (data) => {
        const degree = Math.round(data.heading);
        setHeading(degree);
        Animated.timing(rotateAnim, {
          toValue: -degree, // Xoay ngược chiều kim đồng hồ để chữ N luôn chỉ hướng Bắc
          duration: 100,
          useNativeDriver: true,
        }).start();
      });

      return () => {
        NativeNfcModule.stopCompass();
        compassSub.remove();
      };
    }
  }, [activeTab, rotateAnim]);

  // Hàm tính hướng chữ (N, NE, E, SE, S, SW, W, NW)
  const getDirectionText = (deg: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  };

  const spin = rotateAnim.interpolate({
    inputRange: [-360, 360],
    outputRange: ['-360deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Thanh chuyển đổi giữa 2 Exercise */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'nfc' && styles.activeTab]}
          onPress={() => setActiveTab('nfc')}>
          <Text style={[styles.tabText, activeTab === 'nfc' && styles.activeTabText]}>
            Ex 1: NFC Reader
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'compass' && styles.activeTab]}
          onPress={() => setActiveTab('compass')}>
          <Text style={[styles.tabText, activeTab === 'compass' && styles.activeTabText]}>
            Ex 2: Compass
          </Text>
        </TouchableOpacity>
      </View>

      {/* NỘI DUNG EXERCISE 1: NFC */}
      {activeTab === 'nfc' && (
        <View style={styles.content}>
          <Text style={styles.headerTitle}>NFC Tag Reader</Text>
          <View style={styles.card}>
            <Text style={styles.statusText}>
              NFC Supported: <Text style={styles.bold}>{nfcSupported ? 'Yes' : 'No'}</Text>
            </Text>
            <Text style={styles.statusText}>
              NFC Enabled: <Text style={styles.bold}>{nfcEnabled ? 'Yes' : 'No'}</Text>
            </Text>
          </View>

          <View style={styles.scanBox}>
            <Text style={styles.scanInstruction}>
              {tagData ? 'NFC Detected!' : 'Please hold the NFC tag against your mobile phone...'}
            </Text>
            {tagData && (
              <View style={styles.tagResult}>
                <Text style={styles.tagLabel}>Tag ID (UID):</Text>
                <Text style={styles.tagValue}>{tagData.id}</Text>
                <Text style={styles.tagLabel}>Technologies:</Text>
                <Text style={styles.tagValue}>{tagData.tech}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* NỘI DUNG EXERCISE 2: COMPASS */}
      {activeTab === 'compass' && (
        <View style={styles.content}>
          <Text style={styles.headerTitle}>Compass</Text>

          <View style={styles.compassWrapper}>
            {/* Vòng xoay la bàn */}
            <Animated.View style={[styles.dial, { transform: [{ rotate: spin }] }]}>
              <Text style={[styles.cardinal, styles.north]}>N</Text>
              <Text style={[styles.cardinal, styles.east]}>E</Text>
              <Text style={[styles.cardinal, styles.south]}>S</Text>
              <Text style={[styles.cardinal, styles.west]}>W</Text>
              <View style={styles.northIndicator} />
            </Animated.View>

            {/* Vòng tròn hiển thị số độ ở tâm */}
            <View style={styles.centerCircle}>
              <Text style={styles.degreeText}>{heading}°</Text>
              <Text style={styles.directionText}>{getDirectionText(heading)}</Text>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB' },
  tabBar: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#FFFFFF', elevation: 2 },
  tabText: { fontSize: 15, fontWeight: '600', color: '#64748B' },
  activeTabText: { color: '#0F172A' },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 20, paddingTop: 20 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#1E293B', marginBottom: 30 },
  card: {
    width: '100%',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
  },
  statusText: { fontSize: 16, color: '#334155', marginVertical: 4 },
  bold: { fontWeight: '700', color: '#0284C7' },
  scanBox: {
    width: '100%',
    padding: 24,
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  scanInstruction: { fontSize: 16, color: '#475569', textAlign: 'center' },
  tagResult: { marginTop: 20, width: '100%', backgroundColor: '#F1F5F9', padding: 14, borderRadius: 10 },
  tagLabel: { fontSize: 13, color: '#64748B', marginTop: 6 },
  tagValue: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  // Styles cho Compass
  compassWrapper: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  dial: {
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  cardinal: { position: 'absolute', fontSize: 20, fontWeight: '800' },
  north: { top: 14, color: '#EF4444' },
  south: { bottom: 14, color: '#475569' },
  east: { right: 18, color: '#475569' },
  west: { left: 18, color: '#475569' },
  northIndicator: {
    position: 'absolute',
    top: 42,
    width: 4,
    height: 16,
    backgroundColor: '#EF4444',
    borderRadius: 2,
  },
  centerCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 6,
  },
  degreeText: { fontSize: 32, fontWeight: '800', color: '#1E293B' },
  directionText: { fontSize: 16, fontWeight: '600', color: '#64748B', marginTop: 2 },
});