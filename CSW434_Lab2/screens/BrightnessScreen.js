import React, { useState } from 'react';
import { View, Text, StyleSheet, NativeModules } from 'react-native';
import Slider from '@react-native-community/slider';

const { BrightnessModule } = NativeModules;

const BrightnessScreen = () => {
  const [brightness, setBrightness] = useState(0.5); // Nên để khởi tạo 0.5 (50%) cho tự nhiên

  const handleValueChange = value => {
    setBrightness(value);

    // Gọi trực tiếp khi kéo để thấy độ sáng thay đổi realtime
    if (
      BrightnessModule &&
      typeof BrightnessModule.setBrightness === 'function'
    ) {
      BrightnessModule.setBrightness(value);
    }
  };

  const percentValue = Math.round(brightness * 100);

  return (
    <View style={styles.container}>
      <View style={styles.topCard}>
        <View style={styles.sunOuterContainer}>
          <View style={styles.sunRaysCircle}>
            <View style={styles.sunInnerCircle}>
              <Text style={styles.percentageText}>{percentValue}%</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.bottomCard}>
        <Text style={styles.label}>Brightness</Text>
        <View style={styles.sliderRow}>
          <Text style={styles.icon}>☀️</Text>

          <Slider
            style={styles.slider}
            minimumValue={0.01} // Đánh trống giá trị 0 tuyệt đối để tránh màn hình tối đen
            maximumValue={1}
            value={brightness}
            onValueChange={handleValueChange}
            minimumTrackTintColor="#3B82F6"
            maximumTrackTintColor="#F87171"
            thumbTintColor="#3B82F6"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7FB',
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  topCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  sunOuterContainer: {
    width: 170,
    height: 170,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sunRaysCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: '#8E8E93',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sunInnerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#6E6E73',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3A3A3C',
  },
  bottomCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3A3A3C',
    marginBottom: 16,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  slider: {
    flex: 1,
    height: 30,
  },
});

export default BrightnessScreen;
