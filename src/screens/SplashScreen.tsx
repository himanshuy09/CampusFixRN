import React, {useEffect, useRef} from 'react';
import {Animated, Easing, StyleSheet, Text, View} from 'react-native';

type Props = {onFinish: () => void};

const SplashScreen = ({onFinish}: Props) => {
  const cScale = useRef(new Animated.Value(0.65)).current;
  const cOpacity = useRef(new Animated.Value(0)).current;
  const capScale = useRef(new Animated.Value(0.92)).current;
  const capOpacity = useRef(new Animated.Value(0)).current;
  const capY = useRef(new Animated.Value(70)).current;
  const leafScale = useRef(new Animated.Value(0)).current;
  const leafRotate = useRef(new Animated.Value(-25)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textY = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    let finished = false;
    const timer = setTimeout(() => {
      if (!finished) {
        finished = true;
        onFinish();
      }
    }, 3000);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(cOpacity, {toValue: 1, duration: 350, useNativeDriver: true}),
        Animated.spring(cScale, {toValue: 1, friction: 6, tension: 90, useNativeDriver: true}),
      ]),
      // Graduation cap: swipe upward as one rigid logo element.
      // It finishes in exactly the same straight position as the supplied logo.
      Animated.parallel([
        Animated.timing(capOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(capY, {
          toValue: 0,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(capScale, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(leafScale, {toValue: 1, friction: 5, tension: 100, useNativeDriver: true}),
        Animated.timing(leafRotate, {
          toValue: 0, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, {toValue: 1, duration: 350, useNativeDriver: true}),
        Animated.timing(textY, {
          toValue: 0, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true,
        }),
      ]),
    ]).start();

    return () => {
      finished = true;
      clearTimeout(timer);
      [cScale, cOpacity, capScale, capOpacity, capY,
        leafScale, leafRotate, textOpacity, textY]
        .forEach(a => a.stopAnimation());
    };
  }, [
    cScale, cOpacity, capScale, capOpacity, capY,
    leafScale, leafRotate, textOpacity, textY, onFinish,
  ]);


  const leafRotation = leafRotate.interpolate({
    inputRange: [-25, 0], outputRange: ['-25deg', '0deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.logoArea}>
        <Animated.View style={[styles.cShape, {
          opacity: cOpacity, transform: [{scale: cScale}],
        }]}>
          <View style={styles.cCutout} />
        </Animated.View>

        <Animated.View style={[styles.capGroup, {
          opacity: capOpacity,
          transform: [{translateY: capY}, {scale: capScale}],
        }]}>
          {/* Flat mortarboard like the supplied CampusFix logo */}
          <View style={styles.capTopDiamond} />
          <View style={styles.capWhiteBand} />
          <View style={styles.capBase} />
          <View style={styles.tasselGroup}>
            <View style={styles.tasselLine} />
            <View style={styles.tassel} />
          </View>
        </Animated.View>

        <Animated.View style={[styles.leaf, {
          opacity: leafScale,
          transform: [{scale: leafScale}, {rotate: leafRotation}],
        }]}>
          <View style={styles.leafVein} />
        </Animated.View>
      </View>

      <Animated.View style={[styles.titleWrap, {
        opacity: textOpacity, transform: [{translateY: textY}],
      }]}>
        <Text style={styles.title}>CampusFix</Text>
        <Text style={styles.subtitle}>Campus Complaint Management System</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center'},
  logoArea: {width: 240, height: 230, alignItems: 'center', justifyContent: 'center'},

  cShape: {
    position: 'absolute', width: 184, height: 184, borderRadius: 92,
    borderWidth: 21, borderColor: '#0878E8', transform: [{rotate: '-12deg'}],
  },
  cCutout: {
    position: 'absolute', width: 105, height: 130, right: -28, top: 7,
    backgroundColor: '#FFFFFF',
  },

  capGroup: {
    position: 'absolute', width: 132, height: 112, top: 53, left: 54,
    alignItems: 'center', justifyContent: 'center',
  },

  // Shallow horizontal rhombus, closer to the original logo.
  capTopDiamond: {
    position: 'absolute',
    width: 96,
    height: 96,
    top: 1,
    backgroundColor: '#202020',
    borderRadius: 2,
    transform: [{rotate: '45deg'}, {scaleY: 0.52}],
  },

  capWhiteBand: {
    position: 'absolute', top: 50, width: 74, height: 8,
    backgroundColor: '#FFFFFF', zIndex: 3,
  },

  capBase: {
    position: 'absolute', top: 52, width: 68, height: 49,
    backgroundColor: '#202020',
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
    borderTopLeftRadius: 6, borderTopRightRadius: 6, zIndex: 2,
  },

  tasselGroup: {
    position: 'absolute',
    width: 30,
    height: 55,
    right: 0,
    top: 25,
    zIndex: 5,
    transformOrigin: 'center top',
  },
  tasselLine: {
    position: 'absolute',
    width: 2,
    height: 28,
    left: 9,
    top: 0,
    backgroundColor: '#202020',
  },
  tassel: {
    position: 'absolute',
    width: 7,
    height: 12,
    left: 6,
    top: 25,
    backgroundColor: '#202020',
    borderRadius: 3,
  },

  leaf: {
    position: 'absolute', width: 70, height: 40, right: 14, bottom: 37,
    backgroundColor: '#55B85F',
    borderTopLeftRadius: 45, borderTopRightRadius: 8,
    borderBottomLeftRadius: 8, borderBottomRightRadius: 45,
  },
  leafVein: {
    position: 'absolute', width: 50, height: 2, left: 10, top: 20,
    backgroundColor: '#2F8E46', transform: [{rotate: '-24deg'}], borderRadius: 2,
  },

  titleWrap: {alignItems: 'center', marginTop: 8, paddingHorizontal: 24},
  title: {fontSize: 28, fontWeight: '900', color: '#111827', letterSpacing: -0.6},
  subtitle: {marginTop: 6, fontSize: 11, color: '#6B7280', textAlign: 'center'},
});

export default SplashScreen;
