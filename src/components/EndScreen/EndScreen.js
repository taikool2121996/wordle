import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { colors, CLEAR, ENTER, colorsToEmoji } from '../../constants';
import * as Clipboard from 'expo-clipboard';

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
        }}
      >
        <Text style={{ color: colors.lightgrey }}>{amount}</Text>
      </View>
    </View>
  );
};

const GuessDistribution = () => {
  return (
    <>
      <View style={{ width: '100%', padding: 20 }}>
        <GuessDistributionLine position={0} amount={2} percentage={50} />
      </View>
    </>
  );
};

const EndScreen = ({ won = false, rows, getCellBGColor }) => {
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

  // count time to tomorow
  const [secondsTillTomorow, setSecondsTillTomorow] = useState(0);
  useEffect(() => {
    const updateTime = () => {
      const now = new Date ();
      const tomorow = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      );

      setSecondsTillTomorow((tomorow - now) / 1000);
    }

    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, []);

  const formatSeconds = () => {
    const hours = Math.floor(secondsTillTomorow / (60 * 60));
    const minutes = Math.floor((secondsTillTomorow % (60 * 60)) / 60);
    const seconds = Math.floor(secondsTillTomorow % 60);


    return `${hours}:${minutes}:${seconds}`
  }

  return (
    <View style={{ width: '100%', alignItems: 'center' }}>
      <Text style={styles.title}>
        {won ? 'Congrats!' : 'Try again tomorow'}
      </Text>

      <Text style={styles.subtitile}>STATISTICS</Text>

      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        <Number number={2} label={'Played'} />
        <Number number={2} label={'Win %'} />
        <Number number={2} label={'Current Streak'} />
        <Number number={2} label={'Max Streak'} />
      </View>

      <Text style={styles.subtitile}>GUESS DISTRIBUTION</Text>
      <GuessDistribution />

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
          <Text style={{ color: colors.lightgrey, fontWeight: 'bold'}}>Share</Text>
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
