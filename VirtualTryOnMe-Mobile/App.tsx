import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import 'react-native-url-polyfill/auto';

export default function App() {
  // Allow overriding API base via EXPO_PUBLIC_API_BASE or app.json extra.apiBase
  const defaultApiBase = (global as any).expo?.expoConfig?.extra?.apiBase || process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:3000'
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [clothingPhotos, setClothingPhotos] = useState<string[]>([]);
  const [scene, setScene] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const pickUser = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, quality: 1 });
    if (!res.canceled && res.assets && res.assets[0]?.uri) setUserPhoto(res.assets[0].uri);
  };

  const pickClothing = async () => {
    if (clothingPhotos.length >= 3) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, quality: 1 });
    if (!res.canceled && res.assets && res.assets[0]?.uri) setClothingPhotos(prev => [...prev, res.assets[0].uri].slice(0, 3));
  };

  const removeClothingAt = (idx: number) => setClothingPhotos(prev => prev.filter((_, i) => i !== idx));

  const toBlob = async (uri: string) => {
    const info = await FileSystem.getInfoAsync(uri);
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    const mime = uri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mime });
  };

  const generate = async () => {
    if (!userPhoto || clothingPhotos.length === 0) return;
    setIsGenerating(true);
    setResultUrl(null);
    try {
      const form = new FormData();
      const userBlob = await toBlob(userPhoto);
      form.append('userPhoto', userBlob as any, `user.${Platform.OS === 'ios' ? 'jpg' : 'jpg'}`);
      for (let i = 0; i < clothingPhotos.length; i++) {
        const blob = await toBlob(clothingPhotos[i]);
        form.append(`clothingPhoto${i}`, blob as any, `cloth_${i}.jpg`);
      }
      if (scene) form.append('scene', scene);

      // NOTE: replace with your deployed API base if not running on same LAN
      const apiBase = defaultApiBase;
      const res = await fetch(`${apiBase}/api/generate-outfit`, { method: 'POST', body: form as any });
      const data = await res.json();
      if (data?.success && data?.imageUrl) setResultUrl(data.imageUrl);
    } catch (e) {
      // noop
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>VirtualTryOnMe</Text>
      <View style={styles.block}>
        <Text style={styles.label}>Фото пользователя</Text>
        {userPhoto ? (
          <Image source={{ uri: userPhoto }} style={styles.preview} />
        ) : (
          <TouchableOpacity style={styles.btn} onPress={pickUser}>
            <Text style={styles.btnText}>Выбрать фото</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.block}>
        <Text style={styles.label}>Фото одежды (до 3)</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {clothingPhotos.map((uri, i) => (
            <TouchableOpacity key={i} onLongPress={() => removeClothingAt(i)}>
              <Image source={{ uri }} style={styles.previewSmall} />
            </TouchableOpacity>
          ))}
          {clothingPhotos.length < 3 && (
            <TouchableOpacity style={styles.btnSmall} onPress={pickClothing}>
              <Text style={styles.btnText}>+</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.block}>
        <Text style={styles.label}>Сцена (опционально)</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {['office','restaurant','street','home','beach','gym','party','wedding','studio','nature'].map(s => (
            <TouchableOpacity key={s} style={[styles.chip, scene === s && styles.chipActive]} onPress={() => setScene(scene === s ? '' : s)}>
              <Text style={[styles.chipText, scene === s && styles.chipTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={[styles.btn, isGenerating && { opacity: 0.6 }]} onPress={generate} disabled={isGenerating || !userPhoto || clothingPhotos.length === 0}>
        {isGenerating ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Создать образ</Text>}
      </TouchableOpacity>

      {resultUrl && (
        <View style={styles.block}>
          <Text style={styles.label}>Результат</Text>
          <Image source={{ uri: resultUrl }} style={styles.result} resizeMode="contain" />
        </View>
      )}

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', paddingTop: 60, paddingHorizontal: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 16 },
  block: { marginBottom: 16 },
  label: { color: '#cbd5e1', marginBottom: 8 },
  btn: { backgroundColor: '#7c3aed', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center' },
  btnSmall: { width: 64, height: 64, backgroundColor: '#334155', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
  preview: { width: 160, height: 160, borderRadius: 12 },
  previewSmall: { width: 64, height: 64, borderRadius: 8 },
  chip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 9999, backgroundColor: '#334155' },
  chipActive: { backgroundColor: '#7c3aed' },
  chipText: { color: '#cbd5e1' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  result: { width: '100%', height: 320, backgroundColor: '#111827', borderRadius: 12 },
});
