import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Camera as ExpoCamera, CameraType } from 'expo-camera';
import { Camera, Camera as FlipCamera } from 'lucide-react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { OpenAI } from 'openai';

const OPENAI_API_KEY = 'your-api-key-here'; // Replace with your actual API key
const openai = new OpenAI({ 
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export default function AnalyzeScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(CameraType.back);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const cameraRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ExpoCamera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      } else {
        // For web, we'll use the browser's media API
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasPermission(true);
          // Clean up the stream when component unmounts
          return () => {
            stream.getTracks().forEach(track => track.stop());
          };
        } catch (err) {
          console.error('Error accessing camera:', err);
          setHasPermission(false);
        }
      }
    })();

    return () => {
      isMounted.current = false;
    };
  }, []);

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No access to camera</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => {
            if (Platform.OS === 'web') {
              navigator.mediaDevices.getUserMedia({ video: true })
                .then(() => setHasPermission(true))
                .catch(err => console.error('Error accessing camera:', err));
            } else {
              ExpoCamera.requestCameraPermissionsAsync()
                .then(({ status }) => setHasPermission(status === 'granted'));
            }
          }}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const analyzeImage = async (base64Image) => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this water test strip image and compare it to the standard color chart. Provide readings for pH, ammonia, nitrite, and nitrate levels. Format the response as a JSON object with these parameters and their values.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw error;
    }
  };

  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        setAnalyzing(true);
        const photo = await cameraRef.current.takePictureAsync();
        
        // Resize and compress the image
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 800 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
        );

        const analysisResults = await analyzeImage(manipulatedImage.base64);
        if (isMounted.current) {
          setResults(analysisResults);
        }
      } catch (error) {
        console.error('Error capturing image:', error);
        if (isMounted.current) {
          // Handle error state if needed
        }
      } finally {
        if (isMounted.current) {
          setAnalyzing(false);
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      <ExpoCamera
        ref={cameraRef}
        style={styles.camera}
        type={type}
        ratio="16:9"
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.flipButton}
            onPress={() => setType(type === CameraType.back
              ? CameraType.front
              : CameraType.back)}>
            <FlipCamera color="white" size={24} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleCapture}
            disabled={analyzing}>
            {analyzing ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <Camera color="white" size={32} />
            )}
          </TouchableOpacity>
        </View>

        {results && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Analysis Results:</Text>
            <Text style={styles.resultText}>pH: {results.pH}</Text>
            <Text style={styles.resultText}>Ammonia: {results.ammonia} ppm</Text>
            <Text style={styles.resultText}>Nitrite: {results.nitrite} ppm</Text>
            <Text style={styles.resultText}>Nitrate: {results.nitrate} ppm</Text>
          </View>
        )}
      </ExpoCamera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    width: '100%',
    padding: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  flipButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    margin: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  resultsContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 10,
  },
  resultsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
});