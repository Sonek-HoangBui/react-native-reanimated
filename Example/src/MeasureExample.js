import React, { useRef } from 'react';
import { 
  StyleSheet, 
  View,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  measure,
  withTiming,
  getTag,
  Easing,
  useDerivedValue,
} from 'react-native-reanimated';
import { TapGestureHandler } from 'react-native-gesture-handler';

const labels = ['apple', 'banana', 'kiwi', 'milk', 'water'];
const sectionHeaderHeight = 40;

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const indices = [0, 1, 2, 3, 4];

function createSharedVariables() {
  const contentHeights = useRef(null);
  if (contentHeights.current == null) {
    contentHeights.current = indices.map(i => useSharedValue(0));
  }

  const heights = useRef(null);
  if (heights.current == null) {
    const contentHeightsCopy = contentHeights.current;
    const result = [useSharedValue(0)];
    for (let i = 1; i < indices.length; i++) {
      const previousHeight = result[i-1];
      const previousContentHeight = contentHeightsCopy[i-1];
      result.push(
        useDerivedValue(
          () => {
            return previousHeight.value + previousContentHeight.value + sectionHeaderHeight + 1;
          }
        )
      )
    }
    heights.current = result;
  }

  return {
    contentHeights: contentHeights.current,
    heights: heights.current,
  }
}

export default function MeasureExample() {
  const {heights, contentHeights} = createSharedVariables();

  return (
    <View>
      <SafeAreaView>
        <View>
          {
            indices.map(i => {
              return (
                <Section title={days[i]} key={i} height={heights[i]} contentHeight={contentHeights[i]} z={i} >
                  <View>
                   <RandomContent/>
                  </View>
                </Section>
              );
            })
          }
        </View>
      </SafeAreaView>
    </View>
  ); 
}

function Section({title, children, height, contentHeight, z}) {
  const randomContentRef = useRef(null);

  const stylez = useAnimatedStyle(
    () => {
      //console.log(`wys ${z}`, height.value);
      return {
        transform: [
          { translateY: height.value}
        ],
      }
    }
  );

  return (
    <Animated.View style={[styles.section, stylez, {zIndex: z}]} >
      { (randomContentRef.current == null)? null : <SectionHeader title={title} tag={getTag(randomContentRef.current)} contentHeight={contentHeight} />}
      <View>
        { 
          React.Children.map(children, (element, idx) => {
            return React.cloneElement(element, { ref: randomContentRef });
          })
        }
      </View>
    </Animated.View>
  );
}

function SectionHeader({title, tag, contentHeight}) {
  const handler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      const height = measure(tag).height;
      if (contentHeight.value === 0) {
        contentHeight.value = withTiming(height, {
          duration: 500,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        })
      } else {
        contentHeight.value = withTiming(0, {
          duration: 100,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        })
      }
    },
  });

  return (
    <View style={styles.sectionHeader}>
      <View style={{height: sectionHeaderHeight, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}} >
        <Text>{ title }</Text>
        <TapGestureHandler onGestureEvent={handler} >
          <View> style={{backgroundColor: 'gray', borderRadius: 10, padding: 5}}> 
            <Text style={{color: 'white'}}>
              trigger
            </Text> 
          </View>
        </TapGestureHandler>  
      </View>
    </View>
  );
}

function RandomContent() {
  const randomElements = useRef(null);
  if (randomElements.current == null) {
    randomElements.current = [];
    const numberOfRandomElements = Math.round(Math.random() * 9 + 1);
    for (let i = 0; i < numberOfRandomElements; i++) {
      randomElements.current.push(
        <RandomElement key={i} />
      );
    }
  }
  
  return (
    <View style={styles.randomContent} >
      { randomElements.current }
    </View>
  );
}

function RandomElement() {
  const randomHeight = useRef(Math.round(Math.random() * 40 + 30));
  const label = useRef(labels[Math.round(Math.random() * 4)] );
  
  return (
    <View style={[styles.randomElement, {height: randomHeight.current}]}>
      <View style={{flex:1, alignItems:'center', flexDirection:'row'}} >
        <Text>
          { label.current }
        </Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
    randomElement: {
      backgroundColor: '#EFEFF4',
      borderRadius: 10,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'green',
    },
    randomContent: {
      borderColor: 'red',
      borderWidth: 1,
    },
    section: {
      position: 'absolute',
      width: '100%',
    },
    sectionHeader: {
      backgroundColor: 'azure',
      paddingLeft:20,
      paddingRight: 20,
      borderBottomColor: 'black',
      borderBottomWidth: 1, 
    },
});