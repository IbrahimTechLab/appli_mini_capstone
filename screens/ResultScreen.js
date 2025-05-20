import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const ResultScreen = ({ route, navigation }) => {
  const { maladie, prediction } = route.params;

  const maladieStr = maladie ? maladie.toLowerCase() : '';

  const getConseils = (maladie) => {
    switch (maladie) {
      case 'fusariose':
        return `🌱 Conseils :
- Utiliser des semences résistantes.
- Éviter l’excès d’humidité.
- Appliquer du compost bien décomposé.
- Faire une rotation des cultures.`;

      case 'nématodose':
        return `🌿 Conseils :
- Planter des tagètes (œillets d’Inde).
- Éviter les cultures sensibles pendant 2–3 ans.
- Travailler le sol profondément.
- Utiliser des bio-nématicides.`;

      case 'flutariose':
        return `🌿 Conseils :
- Éliminer les feuilles et fruits infectés.
- Éviter d’arroser par aspersion pour limiter l’humidité sur les plantes.
- Appliquer des fongicides à base de cuivre en prévention.
- Espacer les plants pour améliorer la circulation de l’air.`;

      case 'mildiou':
        return `🌧️ Conseils :
- Espacer les cultures.
- Traiter avec la bouillie bordelaise.
- Éviter l’irrigation par aspersion.
- Enlever les plantes infectées.`;

      case 'chlorose':
        return `🍃 Conseils :
- Vérifier le pH du sol (éviter les sols trop alcalins).
- Apporter du fer sous forme de chélate si carence détectée.
- Ajouter du compost ou de la matière organique pour améliorer la structure du sol.
- Éviter l'excès d'arrosage qui bloque l’absorption des nutriments.`;

      default:
        return `Aucun conseil spécifique trouvé.`;
    }
  };

  const conseils = getConseils(maladieStr);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Résultat de la prédiction</Text>

      <View style={styles.resultBox}>
        <Text style={styles.label}>✅ Maladie prédite :</Text>
        <Text style={styles.maladie}>{maladie || 'N/A'}</Text>

        <Text style={styles.label}>🧬 Code prédictif :</Text>
        <Text style={styles.prediction}>{prediction ?? 'N/A'}</Text>

        <Text style={styles.label}>📋 Conseils agronomiques :</Text>
        <Text style={styles.conseils}>{conseils}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>⬅️ Retour à la saisie</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ResultScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
  },
  title: {
    fontSize: 24,
    color: '#006400',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  resultBox: {
    backgroundColor: '#ffffffcc',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    elevation: 4,
  },
  label: {
    fontSize: 18,
    color: '#333',
    marginTop: 15,
    fontWeight: '600',
  },
  maladie: {
    fontSize: 22,
    color: '#FFA500',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  prediction: {
    fontSize: 20,
    color: '#444',
    fontWeight: '500',
    marginBottom: 10,
  },
  conseils: {
    fontSize: 16,
    color: '#2e2e2e',
    lineHeight: 24,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#FFA500',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
