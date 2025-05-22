import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'predictions_list';

const ResultScreen = ({ route, navigation }) => {
  const { maladie: routeMaladie, prediction: routePrediction } = route.params || {};
  const [maladie, setMaladie] = useState(routeMaladie || '');
  const [prediction, setPrediction] = useState(routePrediction || '');
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [history, setHistory] = useState([]);

  const getConseils = (maladie) => {
    switch ((maladie || '').toLowerCase()) {
      case 'fusariose':
        return `🌱 Conseils :
🦠 Cause : Infection par des champignons du genre Fusarium. Ces champignons se développent dans le sol et se propagent par l’eau, les semences contaminées ou le matériel agricole
🌾 Culture attaquée: tomate, banane, pois, coton, blé, maïs, haricot, betterave.
- Fongicides triazoles — Utilisation préventive de produits comme le prothioconazole pour limiter le développement du champignon.
- Rotation des cultures — Alterner les cultures pour réduire la présence du pathogène dans le sol.
- Labour — Incorporer les résidus de culture pour favoriser leur dégradation et limiter l'inoculum.
- Désinfection des outils — Nettoyer et désinfecter les outils pour éviter la propagation du champignon.
- Amendements organiques — Appliquer du compost ou du soufre pour améliorer la santé du sol et réduire la pression fongique.`;
      case 'nématodose':
        return `🌿 Conseils :
🦠 Cause : Infestation par des nématodes parasites (vers microscopiques) vivant dans le sol, qui attaquent les racines des plantes, provoquant des lésions, un mauvais développement racinaire et des symptômes de stress hydrique ou nutritionnel.
🌾 Culture attaquée: pomme de terre, carotte, tomate, poivron, légumineuses, melon, coton, céréales.
- Rotation des cultures — Alterner les cultures pour réduire la population de nématodes spécifiques dans le sol.
- Utilisation de nématodes entomopathogènes (ex. Steinernema feltiae, Heterorhabditis bacteriophora) — Nématodes bénéfiques qui parasitent et tuent les nématodes nuisibles du sol.
- Amendements organiques — Appliquer du compost, fumier ou matières organiques pour améliorer la santé du sol et favoriser les micro-organismes antagonistes aux nématodes.
- Solarisation du sol — Recouvrir le sol plastique transparent pendant plusieurs semaines pour augmenter la température et tuer les nématodes.
- Application de biofumigants — Utilisation de plantes biofumigantes (comme la moutarde ou le radis fourrager) dont les composés libérés dans le sol réduisent la population de nématodes.`;
      case 'flutariose':
        return `🌿 Conseils :
🦠 Cause : Infection par des champignons du genre Colletotrichum qui pénètrent par des blessures ou via l’humidité excessive. Le champignon attaque feuilles, fruits et tiges, surtout dans des conditions humides et chaudes.
🌾 Culture attaquée: haricot, cacao, mangue, avocatier, agrumes, pommes, fraises, papaye.
- Fongicides à base de cuivre — Traitements préventifs et curatifs utilisant la bouillie bordelaise ou autres composés cupriques.
- Fongicides systémiques — Produits comme le thiophanate-méthyl ou le chlorothalonil pour contrôler le champignon.
- Élimination des parties infectées — Couper et détruire les feuilles, fruits ou branches malades pour limiter la propagation.
- Bonne circulation d’air — Espacer les plants et tailler pour réduire l’humidité favorable au développement du champignon.
- Rotation des cultures — Eviter de cultiver la même espèce au même endroit pour diminuer la présence du champignon dans le sol.
- Désinfection des outils — Nettoyer régulièrement le matériel de jardinage pour ne pas transmettre le champignon.`;
      case 'mildiou':
        return `🌧️ Conseils :
🦠 Cause : Infection par des oomycètes (ex. Phytophthora infestans ou Plasmopara viticola), qui se développent dans des conditions humides et fraîches. Le pathogène attaque les feuilles, tiges et fruits, provoquant des lésions et la pourriture.
🌾 Culture attaquée:pomme de terre, tomate, vigne, concombre, courgette, melon, laitue, pois.
- Fongicides à base de cuivre — Bouillie bordelaise et autres composés cupriques utilisés en prévention et en curatif.
- Fongicides systémiques — Produits comme le diméthomorphe, le mancozèbe ou le métalaxyl, très efficaces pour lutter contre le mildiou.
- Élimination des parties infectées — Retirer et détruire feuilles, tiges ou fruits malades pour limiter la propagation.
- Amélioration de l’aération — Tailler les plants et espacer les plantations pour diminuer l’humidité propice au développement du champignon.
- Rotation des cultures — Alterner les cultures sensibles pour réduire la présence du pathogène dans le sol.`;
      case 'chlorose':
        return `🍃 Conseils :
🔍 Cause : Carence nutritionnelle, principalement en fer, souvent liée à un pH trop élevé (sol calcaire), une mauvaise disponibilité du fer, ou des blocages dus à un excès d’autres éléments (phosphore, calcium). Cela empêche la synthèse de chlorophylle, d’où le jaunissement des feuilles.
🌾 Culture attaquée : vigne, agrumes, oliviers, figuier, pommiers, rosiers, palmiers, arbustes ornementaux.
- Apport de chélates de fer — Application foliaire ou au sol de chélates de fer (ex. EDDHA, DTPA) pour corriger la carence rapidement.
- Amendement du sol — Ajuster le pH du sol (par exemple en acidifiant les sols calcaires) pour améliorer la disponibilité du fer.
- Apport de compost ou matières organiques — Favorise l’activité microbienne et la disponibilité des nutriments.
- Irrigation contrôlée — Éviter l’excès d’eau qui peut limiter l’absorption du fer par les racines.
-  Greffage sur porte-greffes tolérants — Utilisé notamment en arboriculture pour améliorer la résistance à la chlorose.`;
      default:
        return `Aucun conseil spécifique trouvé.`;
    }
  };

  // Charge l'historique complet
  const loadHistory = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = data ? JSON.parse(data) : [];
      setHistory(parsed);
    } catch (e) {
      console.error('Erreur lecture historique:', e);
      setHistory([]);
    }
  };

  // Ajoute une nouvelle prédiction à l'historique
  const addPredictionToList = async () => {
    if (!maladie || !prediction) return;

    try {
      const existing = await AsyncStorage.getItem(STORAGE_KEY);
      let list = existing ? JSON.parse(existing) : [];

      const formattedDate = new Date().toLocaleString('fr-FR', {
        dateStyle: 'short',
        timeStyle: 'short',
      });

      const newEntry = { maladie, prediction, date: formattedDate };

      // Empêche doublons consécutifs (optionnel)
      if (list.length === 0 || JSON.stringify(list[0]) !== JSON.stringify(newEntry)) {
        list.unshift(newEntry);
      }

      if (list.length > 20) list = list.slice(0, 20);

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));

      setConfirmationMessage("✅ Prédiction enregistrée !");
      setTimeout(() => setConfirmationMessage(''), 4000);

      // Recharge l'historique pour mise à jour affichage
      setHistory(list);
    } catch (e) {
      console.error('Erreur AsyncStorage:', e);
    }
  };

  // Au montage et à chaque changement des params, on met à jour états et historique
  useEffect(() => {
    if (routeMaladie && routePrediction) {
      setMaladie(routeMaladie);
      setPrediction(routePrediction);
      // Pas besoin de charger historique dans ce cas, on est en mode résultat
    } else {
      // Pas de params => mode historique
      setMaladie('');
      setPrediction('');
      loadHistory();
    }
  }, [routeMaladie, routePrediction]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {maladie && prediction ? (
        <>
          <Text style={styles.title}>Résultat de la prédiction</Text>

          {confirmationMessage ? (
            <View style={styles.confirmationBox}>
              <Text style={styles.confirmationText}>{confirmationMessage}</Text>
            </View>
          ) : null}

          <View style={styles.resultBox}>
            <Text style={styles.label}>✅ Maladie prédite :</Text>
            <Text style={styles.maladie}>{maladie}</Text>

            <Text style={styles.label}>🧬 Code prédictif :</Text>
            <Text style={styles.prediction}>{prediction}</Text>

            <Text style={styles.label}>📋 Conseils :</Text>
            <Text style={styles.conseils}>{getConseils(maladie)}</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={addPredictionToList}>
            <Text style={styles.buttonText}>💾 Enregistrer cette prédiction</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>📜 Historique des prédictions</Text>
          {history.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: 20 }}>Aucune prédiction enregistrée.</Text>
          ) : (
            history.map((item, index) => (
              <View key={index} style={styles.historyItem}>
                <Text style={styles.maladie}>{item.maladie}</Text>
                <Text style={styles.prediction}>{item.prediction}</Text>
                <Text style={{ fontSize: 12, color: '#555' }}>{item.date}</Text>
              </View>
            ))
          )}
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>⬅️ Retour</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ResultScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f0fdf4',
  },
  title: {
    fontSize: 24,
    color: '#006400',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  confirmationBox: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  confirmationText: {
    color: '#155724',
    fontWeight: '600',
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
    fontSize: 20,
    color: '#FFA500',
    fontWeight: 'bold',
  },
  prediction: {
    fontSize: 18,
    color: '#444',
  },
  conseils: {
    fontSize: 16,
    color: '#2e2e2e',
    lineHeight: 24,
    marginBottom: 10,
  },
  historyItem: {
    backgroundColor: '#ffffffdd',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  button: {
    backgroundColor: '#FFA500',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
