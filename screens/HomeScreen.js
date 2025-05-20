import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Soleil animé en fond */}
      <LottieView
        source={require('../assets/animations/sun.json')}
        autoPlay
        loop
        style={styles.sunAnimation}
      />

      {/* Icône météo simple (plus d'animation) */}
      <View style={styles.weatherButton}>
        <TouchableOpacity onPress={() => navigation.navigate('Weather')}>
          <Ionicons name="cloud-outline" size={28} color="#0b8457" />
        </TouchableOpacity>
      </View>

      {/* Logo */}
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
      />

      {/* Titres avec animation d’entrée */}
      <Animated.View entering={FadeInUp.delay(200).duration(800)}>
        <Text style={styles.title}>Bienvenue sur AgroAI</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(400).duration(800)}>
        <Text style={styles.subtitle}>Votre assistant agricole intelligent</Text>
      </Animated.View>

      {/* Bouton animé */}
      <Animated.View entering={FadeInUp.delay(600).duration(800)}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Prediction')}
        >
          <Text style={styles.buttonText}>Commencer</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff7e6',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
   weatherButton: {
    position: 'absolute',
    top: 10,          // plus haut, proche du bord supérieur
    right: 10,        // proche du bord droit
    backgroundColor: '#e6fff2',
    borderRadius: 20,
    padding: 6,       // un peu moins de padding pour que ça soit plus serré
    elevation: 2,
  },

  sunAnimation: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 200,
    height: 200,
    opacity: 0.25,
    zIndex: -1,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0b8457',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#0b8457',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
