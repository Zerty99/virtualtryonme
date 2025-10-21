import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  Platform, 
  ScrollView, 
  Animated, 
  Dimensions,
  Alert,
  Share
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import 'react-native-url-polyfill/auto';

const { width: screenWidth } = Dimensions.get('window');

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
  const [generationHistory, setGenerationHistory] = useState<string[]>([]);
  
  // Анимации
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    // Анимация появления
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Анимация пульсации для кнопки генерации
    if (isGenerating) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isGenerating]);

  const compressImage = async (uri: string, quality: number = 0.8): Promise<string> => {
    try {
      const compressedUri = await FileSystem.getInfoAsync(uri);
      if (compressedUri.exists) {
        // Для простоты возвращаем оригинальный URI
        // В реальном приложении здесь можно добавить сжатие
        return uri;
      }
      return uri;
    } catch (error) {
      console.error('Ошибка сжатия изображения:', error);
      return uri;
    }
  };

  const pickUser = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Ошибка', 'Необходимо разрешение для доступа к галерее');
        return;
      }
      
      const res = await ImagePicker.launchImageLibraryAsync({ 
        mediaTypes: ImagePicker.MediaTypeOptions.Images, 
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false
      });
      
      if (!res.canceled && res.assets && res.assets[0]?.uri) {
        const compressedUri = await compressImage(res.assets[0].uri);
        setUserPhoto(compressedUri);
        setError(null);
      }
    } catch (error) {
      setError('Ошибка при выборе изображения');
      console.error('Ошибка pickUser:', error);
    }
  };

  const pickClothing = async () => {
    if (clothingPhotos.length >= 3) {
      Alert.alert('Предупреждение', 'Можно выбрать максимум 3 предмета одежды');
      return;
    }
    
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Ошибка', 'Необходимо разрешение для доступа к галерее');
        return;
      }
      
      const res = await ImagePicker.launchImageLibraryAsync({ 
        mediaTypes: ImagePicker.MediaTypeOptions.Images, 
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false
      });
      
      if (!res.canceled && res.assets && res.assets[0]?.uri) {
        const compressedUri = await compressImage(res.assets[0].uri);
        setClothingPhotos(prev => [...prev, compressedUri].slice(0, 3));
        setError(null);
      }
    } catch (error) {
      setError('Ошибка при выборе изображения одежды');
      console.error('Ошибка pickClothing:', error);
    }
  };

  const removeClothingAt = (idx: number) => setClothingPhotos(prev => prev.filter((_, i) => i !== idx));

  const saveToHistory = (url: string) => {
    setGenerationHistory(prev => [url, ...prev.slice(0, 9)]); // Сохраняем последние 10 результатов
  };

  const shareResult = async () => {
    if (!resultUrl) return;
    try {
      await Share.share({
        message: 'Посмотрите на мой новый образ, созданный с помощью VirtualTryOnMe!',
        url: resultUrl,
      });
    } catch (error) {
      console.error('Ошибка при попытке поделиться:', error);
    }
  };

  const clearAll = () => {
    Alert.alert(
      'Очистить все',
      'Вы уверены, что хотите очистить все данные?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Очистить',
          style: 'destructive',
          onPress: () => {
            setUserPhoto(null);
            setClothingPhotos([]);
            setScene('');
            setResultUrl(null);
            setError(null);
            setDebugInfo('');
          },
        },
      ]
    );
  };

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

  const validateInputs = (): string | null => {
    if (!userPhoto) {
      return 'Пожалуйста, выберите фото пользователя';
    }
    if (clothingPhotos.length === 0) {
      return 'Пожалуйста, выберите хотя бы одно фото одежды';
    }
    if (clothingPhotos.length > 3) {
      return 'Можно выбрать максимум 3 предмета одежды';
    }
    return null;
  };

  const generate = async () => {
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsGenerating(true);
    setResultUrl(null);
    setError(null);
    setDebugInfo('Начинаем генерацию...');
    
    try {
      // Проверяем доступность API
      const apiBase = defaultApiBase;
      setDebugInfo(`Подключаемся к API: ${apiBase}`);
      
      // Обрабатываем изображение пользователя
      setDebugInfo('Обрабатываем фото пользователя...');
      if (!userPhoto) {
        throw new Error('Фото пользователя не выбрано');
      }
      const userImageData = await FileSystem.readAsStringAsync(userPhoto, { 
        encoding: FileSystem.EncodingType.Base64 
      });
      const userMime = userPhoto.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
      
      // Обрабатываем фото одежды
      setDebugInfo('Обрабатываем фото одежды...');
      const clothingImagesData = [];
      for (let i = 0; i < clothingPhotos.length; i++) {
        try {
          const base64 = await FileSystem.readAsStringAsync(clothingPhotos[i], { 
            encoding: FileSystem.EncodingType.Base64 
          });
          const mime = clothingPhotos[i].toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
          clothingImagesData.push({
            data: base64,
            mime: mime,
            name: `cloth_${i}.${mime.split('/')[1]}`
          });
        } catch (error) {
          throw new Error(`Ошибка обработки изображения одежды ${i + 1}: ${error}`);
        }
      }

      setDebugInfo('Отправляем запрос на сервер...');
      
      const requestBody = {
        userPhoto: {
          data: userImageData,
          mime: userMime,
          name: `user.${userMime.split('/')[1]}`
        },
        clothingPhotos: clothingImagesData,
        scene: scene || null
      };
      
      // Добавляем таймаут для запроса
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 минуты
      
      const res = await fetch(`${apiBase}/api/generate-outfit`, { 
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      setDebugInfo(`Получен ответ: ${res.status} ${res.statusText}`);
      
      if (!res.ok) {
        let errorMessage = `Ошибка сервера: ${res.status}`;
        try {
          const errorData = await res.json();
          errorMessage += ` - ${errorData.error || errorData.message || 'Неизвестная ошибка'}`;
        } catch {
          const errorText = await res.text();
          errorMessage += ` - ${errorText}`;
        }
        throw new Error(errorMessage);
      }
      
      const data = await res.json();
      setDebugInfo(`Данные получены успешно`);
      
      if (data?.success && data?.imageUrl) {
        setResultUrl(data.imageUrl);
        saveToHistory(data.imageUrl);
        setDebugInfo('✨ Образ успешно создан!');
        setError(null);
      } else {
        throw new Error(data?.error || 'Сервер не вернул изображение');
      }
    } catch (e) {
      let errorMessage = 'Неизвестная ошибка';
      
      if (e instanceof Error) {
        if (e.name === 'AbortError') {
          errorMessage = 'Превышено время ожидания. Попробуйте еще раз.';
        } else {
          errorMessage = e.message;
        }
      }
      
      setError(`❌ ${errorMessage}`);
      setDebugInfo(`Ошибка: ${errorMessage}`);
      console.error('Ошибка генерации:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Заголовок с градиентом */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Text style={styles.title}>✨ VirtualTryOnMe</Text>
        <Text style={styles.subtitle}>Создайте идеальный образ с ИИ</Text>
        <TouchableOpacity style={styles.clearBtn} onPress={clearAll}>
          <Text style={styles.clearBtnText}>🗑️ Очистить</Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Фото пользователя */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>👤 Фото пользователя</Text>
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
              <TouchableOpacity style={styles.btnPrimary} onPress={pickUser}>
                <Text style={styles.btnText}>📷 Выбрать фото</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Фото одежды */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>👕 Фото одежды (до 3)</Text>
            <View style={styles.clothingGrid}>
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

          {/* Сцена */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🎭 Сцена (опционально)</Text>
            <View style={styles.chipContainer}>
              {['office','restaurant','street','home','beach','gym','party','wedding','studio','nature'].map(s => (
                <TouchableOpacity 
                  key={s} 
                  style={[styles.chip, scene === s && styles.chipActive]} 
                  onPress={() => setScene(scene === s ? '' : s)}
                >
                  <Text style={[styles.chipText, scene === s && styles.chipTextActive]}>
                    {s === 'office' ? '🏢' : 
                     s === 'restaurant' ? '🍽️' :
                     s === 'street' ? '🚶' :
                     s === 'home' ? '🏠' :
                     s === 'beach' ? '🏖️' :
                     s === 'gym' ? '💪' :
                     s === 'party' ? '🎉' :
                     s === 'wedding' ? '💒' :
                     s === 'studio' ? '📸' :
                     s === 'nature' ? '🌿' : ''} {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Кнопка генерации */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity 
              style={[
                styles.btnGenerate, 
                (!userPhoto || clothingPhotos.length === 0) && styles.btnDisabled
              ]} 
              onPress={generate} 
              disabled={isGenerating || !userPhoto || clothingPhotos.length === 0}
            >
              {isGenerating ? (
                <View style={styles.generatingContainer}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.btnText}>Создаем образ...</Text>
                </View>
              ) : (
                <Text style={styles.btnText}>✨ Создать образ</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Ошибки */}
          {error && (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>❌ {error}</Text>
            </View>
          )}

          {/* Отладочная информация */}
          {debugInfo && (
            <View style={styles.debugCard}>
              <Text style={styles.debugText}>🔍 {debugInfo}</Text>
            </View>
          )}

          {/* Результат */}
          {resultUrl && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🎨 Результат</Text>
              <Image source={{ uri: resultUrl }} style={styles.result} resizeMode="contain" />
              <TouchableOpacity style={styles.btnSecondary} onPress={shareResult}>
                <Text style={styles.btnText}>📤 Поделиться</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* История */}
          {generationHistory.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📚 История образов</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.historyContainer}>
                  {generationHistory.map((url, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.historyItem}
                      onPress={() => setResultUrl(url)}
                    >
                      <Image source={{ uri: url }} style={styles.historyImage} />
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0a0a0a',
  },
  header: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: { 
    color: '#fff', 
    fontSize: 28, 
    fontWeight: '800', 
    textAlign: 'center',
    marginBottom: 5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    color: '#e2e8f0',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '500',
  },
  clearBtn: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  clearBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
  },
  previewContainer: { 
    position: 'relative', 
    alignSelf: 'center',
    marginTop: 10,
  },
  clothingPreviewContainer: { 
    position: 'relative',
    marginRight: 10,
  },
  preview: { 
    width: 180, 
    height: 180, 
    borderRadius: 15,
    backgroundColor: '#2a2a2a',
  },
  previewSmall: { 
    width: 90, 
    height: 90, 
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
  },
  clothingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  btnPrimary: { 
    backgroundColor: '#7c3aed', 
    paddingVertical: 15, 
    paddingHorizontal: 25, 
    borderRadius: 15, 
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  btnSecondary: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  btnGenerate: {
    backgroundColor: '#dc2626',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 20,
    alignItems: 'center',
    marginVertical: 20,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  btnDisabled: {
    backgroundColor: '#6b7280',
    shadowOpacity: 0.1,
  },
  btnSmall: { 
    width: 90, 
    height: 90, 
    backgroundColor: '#374151', 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4b5563',
    borderStyle: 'dashed',
  },
  btnText: { 
    color: '#fff', 
    fontWeight: '700',
    fontSize: 16,
  },
  generatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  removeBtn: { 
    position: 'absolute', 
    top: -10, 
    right: -10, 
    width: 30, 
    height: 30, 
    backgroundColor: '#ef4444', 
    borderRadius: 15, 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  removeBtnSmall: { 
    position: 'absolute', 
    top: -5, 
    right: -5, 
    width: 24, 
    height: 24, 
    backgroundColor: '#ef4444', 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  removeBtnText: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: 'bold' 
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  chip: { 
    paddingVertical: 8, 
    paddingHorizontal: 15, 
    borderRadius: 20, 
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  chipActive: { 
    backgroundColor: '#7c3aed',
    borderColor: '#8b5cf6',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  chipText: { 
    color: '#d1d5db',
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextActive: { 
    color: '#fff', 
    fontWeight: '700' 
  },
  result: { 
    width: '100%', 
    height: 350, 
    backgroundColor: '#111827', 
    borderRadius: 15,
    marginTop: 10,
  },
  errorCard: {
    backgroundColor: '#1f2937',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorText: { 
    color: '#fca5a5', 
    fontSize: 14, 
    fontWeight: '600',
  },
  debugCard: {
    backgroundColor: '#1f2937',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  debugText: { 
    color: '#93c5fd', 
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  historyContainer: {
    flexDirection: 'row',
    gap: 15,
    paddingVertical: 10,
  },
  historyItem: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  historyImage: {
    width: 80,
    height: 80,
    backgroundColor: '#2a2a2a',
  },
});
