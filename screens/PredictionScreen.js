import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';

import { Picker } from '@react-native-picker/picker';

const PredictionScreen = ({ navigation }) => {
  const [ph, setPh] = useState('');
  const [temperature, setTemperature] = useState('');
  const [humidity, setHumidity] = useState('');
  const [organicCarbon, setOrganicCarbon] = useState('');
  const [sodium, setSodium] = useState('');
  const [potassium, setPotassium] = useState('');
  const [nitrogen, setNitrogen] = useState('');
  const [phosphorus, setPhosphorus] = useState('');
  const [soilType, setSoilType] = useState(null);

  const [soilTypes, setSoilTypes] = useState({});
  const [loading, setLoading] = useState(false);

  // Charger les types de sol depuis le backend
  useEffect(() => {
    fetch("https://9a21-162-43-193-233.ngrok-free.app/api/soil-types")
      .then(response => response.json())
      .then(data => setSoilTypes(data))
      .catch(error => {
        console.log("Erreur lors du chargement des types de sol :", error);
        alert("Impossible de charger les types de sol.");
      });
  }, []);

  const validateFields = () => {
    const fields = [ph, temperature, humidity, organicCarbon, sodium, potassium, nitrogen, phosphorus];
    if (fields.some(val => isNaN(val) || val.trim() === '')) {
      alert("Tous les champs doivent être remplis avec des valeurs numériques valides.");
      return false;
    }
    if (soilType === null) {
      alert("Veuillez sélectionner un type de sol.");
      return false;
    }
    return true;
  };

  const handlePredictPress = async () => {
    if (!validateFields()) return;

    setLoading(true);
    try {
      const response = await fetch("https://9a21-162-43-193-233.ngrok-free.app/api/predict-disease", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soil_pH: parseFloat(ph),
          temperature: parseFloat(temperature),
          humidity: parseFloat(humidity),
          organic_carbon: parseFloat(organicCarbon),
          sodium: parseFloat(sodium),
          potassium: parseFloat(potassium),
          nitrogen: parseFloat(nitrogen),
          phosphorus: parseFloat(phosphorus),
          soil_type: soilType,
        }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        // ✅ Correction ici : navigation vers l'écran de résultat avec son nom entre guillemets
        navigation.navigate('ResultScreen', {
          maladie: data.maladie,
          prediction: data.prediction,
        });
      } else {
        alert(`Erreur : ${data.error}`);
      }
    } catch (error) {
      setLoading(false);
      alert('Erreur réseau. Vérifiez la connexion au serveur.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>🔬 Prédiction des maladies du sol</Text>

          {/* Champs de saisie */}
          <TextInput
  style={styles.input}
  placeholder="pH du sol (0 - 14)"
  keyboardType="numeric"
  value={ph}
  onChangeText={val => {
    const num = parseFloat(val);
    if (isNaN(num)) {
      setPh(''); // permet vider le champ
    } else if (num >= 0 && num <= 14) {
      setPh(val);
    }
    // sinon ne fait rien, ignore la valeur hors limite
  }}
/>

          <TextInput style={styles.input} placeholder="Température (°C)" keyboardType="numeric" value={temperature} onChangeText={setTemperature} />
          <TextInput style={styles.input} placeholder="Humidité (%)" keyboardType="numeric" value={humidity} onChangeText={setHumidity} />
          <TextInput style={styles.input} placeholder="Matière organique (%)" keyboardType="numeric" value={organicCarbon} onChangeText={setOrganicCarbon} />
          <TextInput style={styles.input} placeholder="Sodium (mg/kg)" keyboardType="numeric" value={sodium} onChangeText={setSodium} />
          <TextInput style={styles.input} placeholder="Potassium (mg/kg)" keyboardType="numeric" value={potassium} onChangeText={setPotassium} />
          <TextInput style={styles.input} placeholder="Azote (mg/kg)" keyboardType="numeric" value={nitrogen} onChangeText={setNitrogen} />
          <TextInput style={styles.input} placeholder="Phosphore (mg/kg)" keyboardType="numeric" value={phosphorus} onChangeText={setPhosphorus} />

          <Text style={styles.label}>Type de sol</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={soilType}
              onValueChange={(itemValue) => setSoilType(itemValue)}
              mode="dropdown"
              style={styles.picker}
            >
              {Object.entries(soilTypes).map(([index, label]) => (
                <Picker.Item key={index} label={`${index} - ${label}`} value={parseInt(index)} />
              ))}
            </Picker>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#FFA500" style={{ marginTop: 20 }} />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handlePredictPress}>
              <Text style={styles.buttonText}>Prédire</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default PredictionScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    color: '#006400',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    marginTop: 10,
    marginBottom: 5,
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#FFA500',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  input: {
    borderColor: '#FFA500',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#FFA500',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000', // ✅ Ombre ajoutée
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8, // ✅ Ombre Android
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
