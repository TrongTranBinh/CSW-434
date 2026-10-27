import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, NativeModules } from 'react-native';

const { BatteryModule } = NativeModules;

const BatteryScreen = () => {
  const [batteryLevel, setBatteryLevel] = useState(80);

  useEffect(() => {
    fetchBatteryLevel();
  }, []);

  const fetchBatteryLevel = async () => {
    try {
      if (
        BatteryModule &&
        typeof BatteryModule.getBatteryLevel === 'function'
      ) {
        const level = await BatteryModule.getBatteryLevel();
        setBatteryLevel(Math.round(level));
      }
    } catch (error) {
      console.error('Lỗi lấy phần trăm pin:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Battery</Text>

        <View style={styles.batteryContainer}>
          <View style={styles.batteryBody}>
            {/* Vạch phát sáng đỉnh pin */}
            <View style={styles.batteryCapGlow} />

            {/* Mức pin dâng lên */}
            <View style={[styles.batteryFill, { height: `${batteryLevel}%` }]}>
              <Text style={styles.percentageText}>{batteryLevel}</Text>
              <Text style={styles.percentSymbol}>%</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7FB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: 240,
    height: 420,
    backgroundColor: '#162320',
    borderRadius: 24,
    paddingTop: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  batteryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 20,
  },
  batteryBody: {
    width: 150,
    height: 240,
    backgroundColor: '#0F1816',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#213833',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    position: 'relative',
  },
  batteryCapGlow: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    width: 40,
    height: 4,
    backgroundColor: '#00E5A3',
    borderRadius: 2,
    elevation: 5,
    zIndex: 2,
  },
  batteryFill: {
    width: '100%',
    backgroundColor: '#00E5A3',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  percentageText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  percentSymbol: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: -4,
  },
});

export default BatteryScreen;
