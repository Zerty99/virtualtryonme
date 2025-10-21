import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import 'react-native-url-polyfill/auto';

export default function App() {
  // Allow overriding API base via EXPO_PUBLIC_API_BASE or app.json extra.apiBase
  const defaultApiBase = (global as any).expo?.expoConfig?.extra?.apiBase || process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:3000'
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [clothingPhotos, setClothingPhotos] = useState<string[]>([]);
  const [scene, setScene] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

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
    try {
      // Используем более простой подход - отправляем base64 напрямую
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const mime = uri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
      
      // Возвращаем объект, который можно использовать в FormData
      return {
        uri: uri,
        type: mime,
        name: uri.split('/').pop() || 'image.jpg'
      };
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  };

  const generate = async () => {
    if (!userPhoto || clothingPhotos.length === 0) {
      setError('Пожалуйста, выберите фото пользователя и хотя бы одно фото одежды');
      return;
    }
    
    setIsGenerating(true);
    setResultUrl(null);
    setError(null);
    setDebugInfo('Начинаем генерацию...');
    
    try {
      // Используем более простой подход - отправляем JSON с base64
      const userImageData = await FileSystem.readAsStringAsync(userPhoto, { encoding: FileSystem.EncodingType.Base64 });
      const userMime = userPhoto.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
      
      setDebugInfo('Обрабатываем фото одежды...');
      const clothingImagesData = [];
      for (let i = 0; i < clothingPhotos.length; i++) {
        const base64 = await FileSystem.readAsStringAsync(clothingPhotos[i], { encoding: FileSystem.EncodingType.Base64 });
        const mime = clothingPhotos[i].toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
        clothingImagesData.push({
          data: base64,
          mime: mime,
          name: `cloth_${i}.jpg`
        });
      }

      const apiBase = defaultApiBase;
      setDebugInfo(`Отправляем запрос на: ${apiBase}/api/generate-outfit`);
      
      const requestBody = {
        userPhoto: {
          data: userImageData,
          mime: userMime,
          name: 'user.jpg'
        },
        clothingPhotos: clothingImagesData,
        scene: scene || null
      };
      
      const res = await fetch(`${apiBase}/api/generate-outfit`, { 
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      setDebugInfo(`Получен ответ: ${res.status} ${res.statusText}`);
      
      if (!res.ok) {
        const errorText = await res.text();
        setError(`Ошибка сервера: ${res.status} - ${errorText}`);
        return;
      }
      
      const data = await res.json();
      setDebugInfo(`Данные получены: ${JSON.stringify(data).substring(0, 100)}...`);
      
      if (data?.success && data?.imageUrl) {
        setResultUrl(data.imageUrl);
        setDebugInfo('Образ успешно создан!');
      } else {
        setError(`Ошибка генерации: ${data?.error || 'Неизвестная ошибка'}`);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Неизвестная ошибка';
      setError(`Ошибка: ${errorMessage}`);
      setDebugInfo(`Исключение: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>VirtualTryOnMe</Text>
      <Text style={styles.apiInfo}>API: {defaultApiBase}</Text>
      <View style={styles.block}>
        <Text style={styles.label}>Фото пользователя</Text>
        {userPhoto ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: userPhoto }} style={styles.preview} />
            <TouchableOpacity 
              style={styles.removeBtn} 
              onPress={() => setUserPhoto(null)}
            >
              <Text style={styles.removeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.btn} onPress={pickUser}>
            <Text style={styles.btnText}>Выбрать фото</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.block}>
        <Text style={styles.label}>Фото одежды (до 3)</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {clothingPhotos.map((uri, i) => (
            <View key={i} style={styles.clothingPreviewContainer}>
              <Image source={{ uri }} style={styles.previewSmall} />
              <TouchableOpacity 
                style={styles.removeBtnSmall} 
                onPress={() => removeClothingAt(i)}
              >
                <Text style={styles.removeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
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

      {error && (
        <View style={styles.block}>
          <Text style={styles.errorText}>❌ {error}</Text>
        </View>
      )}

      {debugInfo && (
        <View style={styles.block}>
          <Text style={styles.debugText}>🔍 {debugInfo}</Text>
        </View>
      )}

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
  apiInfo: { color: '#64748b', fontSize: 12, marginBottom: 16 },
  block: { marginBottom: 16 },
  label: { color: '#cbd5e1', marginBottom: 8 },
  btn: { backgroundColor: '#7c3aed', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center' },
  btnSmall: { width: 80, height: 80, backgroundColor: '#334155', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
  previewContainer: { position: 'relative', alignSelf: 'flex-start' },
  clothingPreviewContainer: { position: 'relative' },
  preview: { width: 160, height: 160, borderRadius: 12 },
  previewSmall: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#f8fafc' },
  removeBtn: { 
    position: 'absolute', 
    top: -8, 
    right: -8, 
    width: 24, 
    height: 24, 
    backgroundColor: '#ef4444', 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  removeBtnSmall: { 
    position: 'absolute', 
    top: -4, 
    right: -4, 
    width: 20, 
    height: 20, 
    backgroundColor: '#ef4444', 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  removeBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  chip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 9999, backgroundColor: '#334155' },
  chipActive: { backgroundColor: '#7c3aed' },
  chipText: { color: '#cbd5e1' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  result: { width: '100%', height: 320, backgroundColor: '#111827', borderRadius: 12 },
  errorText: { color: '#ef4444', fontSize: 14, marginBottom: 8 },
  debugText: { color: '#94a3b8', fontSize: 12, marginBottom: 8 },
});
