import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';

const API_KEY = '2a1e4ae9dbf6db0e5ac01d71e9783582';

const WeatherScreen = () => {
  const [city, setCity] = useState('Niamey');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const getAdvice = (condition) => {
    return adviceDict[condition] || "🌾 Conditions normales, surveillez régulièrement.";
  };

  const fetchWeather = async () => {
    const trimmedCity = city.trim();
    if (!trimmedCity) return;

    setLoading(true);
    try {
      const resCurrent = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${trimmedCity}&appid=${API_KEY}&units=metric&lang=fr`);
      const dataCurrent = await resCurrent.json();
      setWeather(dataCurrent.cod === 200 ? dataCurrent : null);

      const resForecast = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${trimmedCity}&appid=${API_KEY}&units=metric&lang=fr`);
      const dataForecast = await resForecast.json();
      if (dataForecast.cod === "200") {
        const daily = dataForecast.list.filter((item, index) => index % 8 === 0);
        setForecast(daily);
      } else {
        setForecast([]);
      }

    } catch (error) {
      console.error(error);
      setWeather(null);
      setForecast([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>☀️ Météo Agricole</Text>

      <TextInput
        style={styles.input}
        placeholder="Entrer une ville"
        value={city}
        onChangeText={setCity}
      />
      <Button title="Rechercher" onPress={fetchWeather} />

      {loading ? (
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
          </View>

          <Text style={styles.subtitle}>📅 Prévisions (7 jours)</Text>
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
        <Text style={{ marginTop: 20, color: 'red' }}>❌ Ville introuvable !</Text>
      )}
    </ScrollView>
  );
};

export default WeatherScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fffdf2',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#f4a261',
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    marginTop: 25,
    color: '#2a9d8f',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    width: '100%',
    backgroundColor: '#fff',
  },
  weatherBox: {
    marginTop: 20,
    backgroundColor: '#e9f5f2',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 2, height: 4 },
    shadowRadius: 5,
  },
  city: {
    fontSize: 22,
    fontWeight: '600',
    color: '#264653',
  },
  condition: {
    fontSize: 18,
    marginVertical: 5,
    color: '#e76f51',
  },
  temp: {
    fontSize: 18,
    color: '#000',
  },
  details: {
    fontSize: 16,
    color: '#333',
  },
  advice: {
    marginTop: 5,
    fontStyle: 'italic',
    color: '#6a994e',
    textAlign: 'center',
  },
  forecastCard: {
    backgroundColor: '#f4f9f4',
    padding: 15,
    marginHorizontal: 8,
    borderRadius: 15,
    width: 200,
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
  },
  cardDate: {
    fontWeight: 'bold',
    color: '#264653',
    marginBottom: 5,
  },
  cardCondition: {
    fontSize: 14,
    color: '#e76f51',
    textAlign: 'center',
  },
  cardTemp: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  cardAdvice: {
    marginTop: 5,
    fontSize: 12,
    fontStyle: 'italic',
    color: '#6a994e',
    textAlign: 'center',
  },
});
