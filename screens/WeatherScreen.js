import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY = 'ta_clé_api_openweathermap'; // Remplacez par votre clé API OpenWeatherMap
const STORAGE_KEY = '@weather_data';

const WeatherScreen = () => {
  const [city, setCity] = useState('Niamey');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [consecutiveDryDays, setConsecutiveDryDays] = useState(0);

  const getEmoji = (condition) => {
    const map = {
      Clear: '☀️',
      Clouds: '☁️',
      Rain: '🌧️',
      Thunderstorm: '⛈️',
      Drizzle: '🌦️',
      Snow: '❄️',
      Mist: '🌫️',
      Smoke: '💨',
      Haze: '🌁',
      Dust: '🌬️',
      Fog: '🌫️',
      Sand: '🏜️',
      Ash: '🌋',
      Squall: '🌪️',
      Tornado: '🌪️',
    };
    return map[condition] || '❓';
  };

  const adviceDict = {
    Clear: "☀️ Journée favorable aux récoltes et au séchage.",
    Clouds: "☁️ Arrosage modéré conseillé si la pluie ne vient pas.",
    Rain: "🌧️ Préparez le système de drainage et évitez les semis.",
    Thunderstorm: "⛈️ Protégez vos cultures fragiles du vent et des pluies violentes.",
    Drizzle: "🌦️ Conditions humides, attention aux champignons.",
    Fog: "🌫️ Visibilité réduite, planifiez les activités tôt.",
  };

  // Alertes spécifiques basées sur les données météo
  const checkAlerts = (currentWeather, forecastData) => {
    let alerts = [];

    // 1. Gel : température ≤ 0°C
    if (currentWeather.main.temp <= 0) {
      alerts.push({ type: 'Gel', message: '⚠️ Risque de gel : protégez vos jeunes plants.' });
    }

    // 2. Vent violent : vitesse du vent > 10 m/s (~36 km/h)
    if (currentWeather.wind.speed > 10) {
      alerts.push({ type: 'Vent violent', message: '⚠️ Vent fort prévu, sécurisez vos cultures fragiles.' });
    }

    // 3. Fortes pluies : vérifier prévisions > 10 mm/h
    const heavyRainForecast = forecastData.some(day => {
      // rain volume peut être absent, on vérifie "rain" et "3h"
      return day.rain && day.rain['3h'] && day.rain['3h'] > 10;
    });
    if (heavyRainForecast) {
      alerts.push({ type: 'Fortes pluies', message: '⚠️ Pluies intenses attendues, préparez le drainage.' });
    }

    // 4. Sécheresse : calcul des jours consécutifs sans pluie > 3 jours
    let dryDays = 0;
    for (let i = 0; i < forecastData.length; i++) {
      const rainVol = forecastData[i].rain && forecastData[i].rain['3h'] ? forecastData[i].rain['3h'] : 0;
      if (rainVol === 0) {
        dryDays++;
      } else {
        break; // pluie détectée, on stoppe le compteur
      }
    }
    setConsecutiveDryDays(dryDays);
    if (dryDays >= 3) {
      alerts.push({ type: 'Sécheresse', message: `⚠️ ${dryDays} jours consécutifs sans pluie, arrosage conseillé.` });
    }

    // Affichage simple des alertes avec Alert de React Native
    if (alerts.length > 0) {
      // On crée un message concaténé
      const alertMessages = alerts.map(a => a.message).join('\n');
      Alert.alert('Alertes météo agricoles', alertMessages);
    }
  };

  const getAdvice = (condition) => {
    return adviceDict[condition] || "🌾 Conditions normales, surveillez régulièrement.";
  };

  const saveWeatherToStorage = async (weatherData, forecastData, cityName) => {
    try {
      const data = { weather: weatherData, forecast: forecastData, city: cityName };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Erreur sauvegarde météo:', e);
    }
  };

  const loadWeatherFromStorage = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue != null) {
        const data = JSON.parse(jsonValue);
        setWeather(data.weather);
        setForecast(data.forecast);
        setCity(data.city);
      }
    } catch (e) {
      console.warn('Erreur chargement météo:', e);
    }
  };

  const fetchWeather = async () => {
    const trimmedCity = city.trim();
    if (!trimmedCity) return;

    setLoading(true);
    setError(null);

    try {
      const resCurrent = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${trimmedCity}&appid=${API_KEY}&units=metric&lang=fr`);
      const dataCurrent = await resCurrent.json();

      if (dataCurrent.cod !== 200) {
        setError(dataCurrent.message || "Erreur inconnue");
        setWeather(null);
        setForecast([]);
        setLoading(false);
        return;
      }
      setWeather(dataCurrent);

      const resForecast = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${trimmedCity}&appid=${API_KEY}&units=metric&lang=fr`);
      const dataForecast = await resForecast.json();

      if (dataForecast.cod === "200") {
        // On récupère un forecast toutes les 8 mesures (~24h)
        const daily = dataForecast.list.filter((_, index) => index % 8 === 0);
        setForecast(daily);
        saveWeatherToStorage(dataCurrent, daily, trimmedCity);

        // On vérifie les alertes météo agricoles
        checkAlerts(dataCurrent, daily);
      } else {
        setForecast([]);
      }
    } catch (e) {
      setError("Impossible de récupérer la météo. Vérifiez votre connexion.");
      loadWeatherFromStorage();
    }
    setLoading(false);
  };

  useEffect(() => {
    loadWeatherFromStorage().then(fetchWeather);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>☀️ Météo Agricole</Text>

      <TextInput
        style={styles.input}
        placeholder="Entrer une ville"
        value={city}
        onChangeText={setCity}
        placeholderTextColor="#888"
      />
      <Button title="Rechercher" onPress={fetchWeather} disabled={!city.trim()} />

      {error ? (
        <Text style={{ marginTop: 20, color: 'red' }}>❌ {error}</Text>
      ) : loading ? (
        <ActivityIndicator size="large" color="#f4a261" style={{ marginTop: 20 }} />
      ) : weather ? (
        <>
          <View style={styles.weatherBox}>
            <Text style={styles.city}>{weather.name}, {weather.sys.country}</Text>
            <Text style={styles.condition}>{getEmoji(weather.weather[0].main)} {weather.weather[0].description}</Text>
            <Text style={styles.temp}>🌡️ {weather.main.temp}°C</Text>
            <Text style={styles.details}>💧 Humidité : {weather.main.humidity}%</Text>
            <Text style={styles.details}>🌬️ Vent : {weather.wind.speed} m/s</Text>
            <Text style={styles.advice}>{getAdvice(weather.weather[0].main)}</Text>
            {/* Afficher les jours sans pluie */}
            <Text style={[styles.advice, { marginTop: 10, fontWeight: 'bold' }]}>
              🌵 {consecutiveDryDays} jour(s) consécutif(s) sans pluie.
            </Text>
          </View>

          <Text style={styles.subtitle}>🗓️ Prévisions (5 jours)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
            {forecast.map((day, index) => (
              <View key={index} style={styles.forecastCard}>
                <Text style={styles.cardDate}>
                  {new Date(day.dt * 1000).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                </Text>
                <Text style={styles.cardCondition}>
                  {getEmoji(day.weather[0].main)} {day.weather[0].description}
                </Text>
                <Text style={styles.cardTemp}>{Math.round(day.main.temp)}°C</Text>
                <Text style={styles.cardAdvice}>{getAdvice(day.weather[0].main)}</Text>
              </View>
            ))}
          </ScrollView>
        </>
      ) : (
        <Text style={{ marginTop: 20 }}>Aucune donnée météo disponible.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff8e1',
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#e76f51',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e76f51',
    borderRadius: 8,
    padding: 10,
    fontSize: 18,
    marginBottom: 10,
    color: '#264653',
  },
  weatherBox: {
    backgroundColor: '#f4a261',
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
    alignItems: 'center',
  },
  city: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  condition: {
    fontSize: 18,
    marginTop: 5,
    color: '#fff',
  },
  temp: {
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#fff',
  },
  details: {
    fontSize: 16,
    marginTop: 5,
    color: '#fff',
  },
  advice: {
    marginTop: 15,
    fontSize: 16,
    fontStyle: 'italic',
    color: '#264653',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 30,
    color: '#2a9d8f',
  },
  forecastCard: {
    backgroundColor: '#e9c46a',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 130,
    alignItems: 'center',
  },
  cardDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#264653',
  },
  cardCondition: {
    fontSize: 14,
    marginTop: 6,
    color: '#264653',
    textAlign: 'center',
  },
  cardTemp: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#e76f51',
  },
  cardAdvice: {
    marginTop: 8,
    fontSize: 13,
    fontStyle: 'italic',
    color: '#264653',
    textAlign: 'center',
  },
});

export default WeatherScreen;
