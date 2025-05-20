import React, { useState, useRef } from 'react';
import { ScrollView, View, Text, TextInput, Button, StyleSheet, Animated } from 'react-native';

const CropRecommendationScreen = () => {
  const [ph, setPh] = useState('');
  const [azote, setAzote] = useState('');
  const [phosphore, setPhosphore] = useState('');
  const [potassium, setPotassium] = useState('');
  const [humidite, setHumidite] = useState('');
  const [textureSol, setTextureSol] = useState('');
  const [result, setResult] = useState(null);
  const [advice, setAdvice] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Conseils agronomiques améliorés
  const agronomicAdvice = {
    sableux: "Les sols sableux sont légers et bien drainés, mais retiennent peu l'eau et les nutriments. Ajoutez du compost ou du fumier pour améliorer leur fertilité. Privilégiez les cultures comme l’arachide, le manioc ou la pastèque.",
    argileux: "Les sols argileux sont riches mais lourds. Ils ont tendance à se gorger d’eau, ce qui peut étouffer les racines. Pensez à bien les aérer et à éviter les excès d’arrosage. Cultures adaptées : riz, patate douce, ou mil.",
    limoneux: "Les sols limoneux sont équilibrés en eau et en nutriments, ce qui les rend idéaux pour une grande variété de cultures comme le maïs, le coton ou le niébé. Veillez tout de même à un bon drainage.",
    laterite: "Les sols latéritiques, riches en fer, nécessitent souvent une amélioration de leur teneur en matière organique. Utilisez des engrais verts et cultivez des espèces rustiques comme le sorgho ou l’anacardier.",
    noir: "Les sols noirs sont très fertiles et riches en matière organique. Ils conviennent parfaitement à des cultures exigeantes comme le riz, le maïs ou la canne à sucre. Attention toutefois à leur gestion hydrique.",
  };

  const handleRecommendation = async () => {
    if (ph && azote && phosphore && potassium && humidite && textureSol) {
      try {
        const response = await fetch('http://192.168.13.53:8000/recommend_crop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ph: parseFloat(ph),
            azote: parseFloat(azote),
            phosphore: parseFloat(phosphore),
            potassium: parseFloat(potassium),
            humidite: parseFloat(humidite),
            texture: textureSol.toLowerCase().trim(),
          }),
        });

        const data = await response.json();
        setResult(`Culture recommandée : ${data.culture}`);

        const conseil = agronomicAdvice[textureSol.toLowerCase().trim()];
        setAdvice(conseil || 'Aucun conseil disponible pour ce type de sol.');

        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        setResult("Erreur de connexion au serveur.");
        setAdvice('');
      }
    } else {
      setResult("Veuillez remplir tous les champs.");
      setAdvice('');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Recommandation de cultures</Text>

      <TextInput style={styles.input} placeholder="pH" keyboardType="numeric" value={ph} onChangeText={setPh} />
      <TextInput style={styles.input} placeholder="Azote (ppm)" keyboardType="numeric" value={azote} onChangeText={setAzote} />
      <TextInput style={styles.input} placeholder="Phosphore (ppm)" keyboardType="numeric" value={phosphore} onChangeText={setPhosphore} />
      <TextInput style={styles.input} placeholder="Potassium (ppm)" keyboardType="numeric" value={potassium} onChangeText={setPotassium} />
      <TextInput style={styles.input} placeholder="Humidité (%)" keyboardType="numeric" value={humidite} onChangeText={setHumidite} />

      <TextInput 
        style={styles.input} 
        placeholder="Type de sol (ex: sableux, argileux...)" 
        value={textureSol} 
        onChangeText={setTextureSol} 
      />

      <Button title="Recommander une culture" onPress={handleRecommendation} />

      {result && (
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.result}>{result}</Text>
          <Text style={styles.advice}>{advice}</Text>
        </Animated.View>
      )}
    </ScrollView>
  );
};

export default CropRecommendationScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f0fff4',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007f5f',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  result: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007f5f',
    textAlign: 'center',
  },
  advice: {
    marginTop: 10,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
});
