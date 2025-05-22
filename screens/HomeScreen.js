import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  Pressable,
  Image,
  ToastAndroid,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'predictions_list';

export default function HomeScreen({ navigation }) {
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);

  // Charge l'historique depuis AsyncStorage à l'ouverture de la modal
  const loadHistory = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue) {
        const data = JSON.parse(jsonValue);
        setHistory(Array.isArray(data) ? data : [data]);
      } else {
        setHistory([]);
      }
    } catch (e) {
      console.error('Erreur lecture AsyncStorage:', e);
      setHistory([]);
    }
  };

  useEffect(() => {
    if (showHistory) loadHistory();
  }, [showHistory]);

  // Fonction pour afficher un toast sur Android ou alert sur iOS
  const showMessage = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('', message);
    }
  };

  // Supprime une prédiction avec confirmation
  const deletePrediction = (index) => {
    Alert.alert(
      "Confirmer la suppression",
      "Voulez-vous vraiment supprimer cette prédiction ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              const newHistory = [...history];
              newHistory.splice(index, 1);
              setHistory(newHistory);
              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
              showMessage('Prédiction supprimée');
            } catch (e) {
              console.error('Erreur suppression AsyncStorage:', e);
              showMessage('Erreur lors de la suppression');
            }
          },
        },
      ]
    );
  };

  // Rend chaque élément de l'historique
  const renderItem = ({ item, index }) => (
    <View style={styles.historyItem}>
      <View style={{ flex: 1 }}>
        <Text style={styles.historyMaladie}>Maladie : {item.maladie}</Text>
        <Text style={styles.historyPrediction}>Prédiction : {item.prediction}</Text>
      </View>
      <TouchableOpacity onPress={() => deletePrediction(index)} style={styles.deleteButton}>
        <Ionicons name="trash-outline" size={24} color="#c0392b" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Animation soleil en arrière-plan */}
      <LottieView
        source={require('../assets/animations/sun.json')}
        autoPlay
        loop
        style={styles.sunAnimation}
      />

      {/* Barre de navigation */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => setShowHistory(true)} style={styles.hamburgerButton}>
          <Ionicons name="menu-outline" size={30} color="#0b8457" />
        </TouchableOpacity>
        <View style={{ width: 30 }} />
        <TouchableOpacity onPress={() => navigation.navigate('Weather')} style={styles.weatherButton}>
          <Ionicons name="cloud-outline" size={28} color="#0b8457" />
        </TouchableOpacity>
      </View>

      {/* Contenu principal */}
      <View style={styles.contentCenter}>
        <Animated.Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          entering={FadeInUp.delay(200).duration(800)}
        />
        <Animated.Text style={styles.title} entering={FadeInUp.delay(400).duration(800)}>
          Bienvenue sur AgroAI
        </Animated.Text>
        <Animated.Text style={styles.subtitle} entering={FadeInUp.delay(600).duration(800)}>
          Votre assistant agricole intelligent
        </Animated.Text>
        <Animated.View entering={FadeInUp.delay(800).duration(800)}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Prediction')}
          >
            <Text style={styles.buttonText}>Commencer</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Modal Historique */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showHistory}
        onRequestClose={() => setShowHistory(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Historique des prédictions</Text>
              <Pressable onPress={() => setShowHistory(false)} style={styles.closeButton}>
                <Ionicons name="close" size={28} color="#0b8457" />
              </Pressable>
            </View>

            {history.length === 0 ? (
              <Text style={styles.emptyText}>Aucune ancienne prédiction</Text>
            ) : (
              <FlatList
                data={history}
                keyExtractor={(_, index) => index.toString()} // on peut améliorer si items ont un id unique
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff7e6',
  },
  navBar: {
    width: '100%',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
    backgroundColor: '#e6fff2',
    borderBottomWidth: 1,
    borderBottomColor: '#a3d9b1',
    position: 'absolute',
    top: 0,
    zIndex: 10,
  },
  hamburgerButton: {
    padding: 5,
  },
  weatherButton: {
    padding: 5,
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
  contentCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 60,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0b8457',
    marginBottom: 12,
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
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#f0fff9',
    borderRadius: 20,
    maxHeight: '80%',
    padding: 20,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0b8457',
  },
  closeButton: {
    padding: 5,
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: '#d1f2eb',
    padding: 15,
    marginBottom: 10,
    borderRadius: 15,
    alignItems: 'center',
  },
  historyMaladie: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0b8457',
  },
  historyPrediction: {
    fontSize: 14,
    color: '#333',
  },
  deleteButton: {
    marginLeft: 15,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontStyle: 'italic',
  },
});
