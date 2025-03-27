import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Water Quality Analyzer</Text>
        <Text style={styles.subtitle}>Test your water quality instantly</Text>
      </View>

      <View style={styles.content}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1544950111-d91f0f0b2e37?q=80&w=1000&auto=format&fit=crop' }}
          style={styles.image}
        />

        <Text style={styles.description}>
          Get instant analysis of your water quality parameters including pH, ammonia, nitrite, and nitrate levels using AI-powered image recognition.
        </Text>

        <Link href="/analyze" style={styles.link}>
          <Text style={styles.linkText}>Start Analysis</Text>
        </Link>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Features:</Text>
          <View style={styles.feature}>
            <Text style={styles.featureTitle}>• Instant Results</Text>
            <Text style={styles.featureDescription}>Get immediate analysis of your test strips</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureTitle}>• Multiple Parameters</Text>
            <Text style={styles.featureDescription}>Measure pH, ammonia, nitrite, and nitrate levels</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureTitle}>• AI-Powered</Text>
            <Text style={styles.featureDescription}>Advanced image recognition for accurate results</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#007AFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    marginTop: 5,
  },
  content: {
    padding: 20,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 20,
  },
  link: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  linkText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  featuresContainer: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 10,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  feature: {
    marginBottom: 15,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    paddingLeft: 15,
  },
});