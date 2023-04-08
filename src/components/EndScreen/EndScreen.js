import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { colors, CLEAR, ENTER, colorsToEmoji } from '../../constants';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Number = ({ number, label }) => (
  <View style={{ alignItems: 'center', margin: 10 }}>
    <Text style={{ color: colors.lightgrey, fontSize: 30, fontWeight: 'bold' }}>
      {number}
    </Text>
    <Text style={{ color: colors.lightgrey, fontSize: 16 }}>{label}</Text>
  </View>
);

const GuessDistributionLine = ({ position, amount, percentage }) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
      <Text style={{ color: colors.lightgrey }}>{position}</Text>
      <View
        style={{
          backgroundColor: colors.grey,
          margin: 5,
          padding: 5,
          alignSelf: 'stretch',
          width: `${percentage}%`,
          minWidth: 20,
        }}
      >
        <Text style={{ color: colors.lightgrey }}>{amount}</Text>
      </View>
    </View>
  );
};

const GuessDistribution = ({ distribution }) => {
  if (!distribution) {
    return null;
  }
  const sum = distribution.reduce((total, dist) => dist + total, 0);
  return (
    <>
      <View style={{ width: '100%', padding: 20 }}>
        {distribution.map((dist, index) => (
          <GuessDistributionLine
            position={index + 1}
            amount={dist}
            percentage={(100 * dist) / sum}
          />
        ))}
      </View>
    </>
  );
};

const EndScreen = ({ won = false, rows, getCellBGColor }) => {
  // count time to tomorow
  const [secondsTillTomorow, setSecondsTillTomorow] = useState(0);
  const [played, setPlayed] = useState(0);
  const [winRate, setWinRate] = useState(0);
  const [curStreak, setCurStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [distribution, setDistribution] = useState(null);

  const share = () => {
    const textMap = rows
      .map((row, i) =>
        row.map((cell, j) => colorsToEmoji[getCellBGColor(i, j)]).join(''),
      )
      .filter((row) => row)
      .join('\n');
    const textToShare = `Wordle \n${textMap}`;
    Clipboard.setString(textToShare);
    Alert.alert('Copied successfully', 'Share your score on you social media');
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const tomorow = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
      );

      setSecondsTillTomorow((tomorow - now) / 1000);
    };

    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    readState();
  }, []);

  const readState = async () => {
    const dataString = await AsyncStorage.getItem('@game');
    let data;
    // for some reasons the data is corrupt => use try catch
    try {
      const data = JSON.parse(dataString);

      // Statistics
      const keys = Object.keys(data);
      const values = Object.values(data);
      let _curStreak = 0;
      let _maxStreak = 0;
      let prevDay = 0;

      setPlayed(keys.length);
      const numberOfWins = values.filter(
        (game) => game.gameState == 'won',
      ).length;
      setWinRate(Math.floor((100 * numberOfWins) / keys.length));

      keys.forEach((key) => {
        const day = parseInt(key.split('-')[1]);
        if (data[key].gameState == 'won' && _curStreak == 0) {
          _curStreak += 1;
        } else if (data[key].gameState == 'won' && prevDay + 1 == day) {
          _curStreak += 1;
        } else {
          if (_curStreak > _maxStreak) {
            _maxStreak = _curStreak;
          }
          _curStreak = data[key].gameState == 'won' ? 1 : 0;
        }
        prevDay = day;
      });
      setCurStreak(_curStreak);
      setMaxStreak(_maxStreak);

      // Guess Distribution

      const dist = [0, 0, 0, 0, 0, 0];
      values.map((game) => {
        if (game.gameState == 'won') {
          const tries = game.rows.filter((row) => row[0]).length;
          dist[tries] = dist[tries] + 1;
        }
      });
      setDistribution(dist);
    } catch (error) {
      console.log("Couldn't parse the state", error);
    }
  };

  const formatSeconds = () => {
    const hours = Math.floor(secondsTillTomorow / (60 * 60));
    const minutes = Math.floor((secondsTillTomorow % (60 * 60)) / 60);
    const seconds = Math.floor(secondsTillTomorow % 60);

    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <View style={{ width: '100%', alignItems: 'center' }}>
      <Text style={styles.title}>
        {won ? 'Congrats!' : 'Try again tomorow'}
      </Text>

      <Text style={styles.subtitile}>STATISTICS</Text>

      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        <Number number={played} label={'Played'} />
        <Number number={winRate} label={'Win %'} />
        <Number number={curStreak} label={'Current Streak'} />
        <Number number={maxStreak} label={'Max Streak'} />
      </View>

      <Text style={styles.subtitile}>GUESS DISTRIBUTION</Text>
      <GuessDistribution distribution={distribution} />

      <View style={{ flexDirection: 'row', padding: 10 }}>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={{ color: colors.lightgrey, fontSize: 24 }}>
            Next Wordle
          </Text>
          <Text
            style={{
              color: colors.lightgrey,
              fontSize: 24,
              fontWeight: 'bold',
            }}
          >
            {formatSeconds()}
          </Text>
        </View>

        <Pressable
          onPress={share}
          style={{
            flex: 1,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 25,
          }}
        >
          <Text style={{ color: colors.lightgrey, fontWeight: 'bold' }}>
            Share
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    color: 'white',
    textAlign: 'center',
    marginVertical: 20,
  },
  subtitile: {
    fontSize: 20,
    color: colors.lightgrey,
    textAlign: 'center',
    marginVertical: 15,
    fontWeight: 'bold',
  },
});

export default EndScreen;
