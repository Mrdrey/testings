import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, AsyncStorage, Image, Text, TouchableOpacity, View } from 'react-native';

const frenchFlag = { uri: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c3/Flag_of_France.svg/255px-Flag_of_France.svg.png'}; 
const spanishFlag = { uri:'https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/Flag_of_Spain.svg/800px-Flag_of_Spain.svg.png'};
const germanFlag = { uri: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/ba/Flag_of_Germany.svg/640px-Flag_of_Germany.svg.png'};

export default function MatchingGames() {
  const [language, setLanguage] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [cards, setCards] = useState([]);
  const [openCards, setOpenCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0); // Add highScore state
  const navigation = useNavigation();

  const wordsData = {
  French: {
    1: [
      { left: 'Bonjour', right: 'Hello', difficulty: 'easy', points: 10 },
      { left: 'Chat', right: 'Cat', difficulty: 'easy', points: 10 },
      { left: 'Livre', right: 'Book', difficulty: 'easy', points: 10 }
    ],
    2: [
      { left: 'Chien', right: 'Dog', difficulty: 'medium', points: 20 },
      { left: 'Soleil', right: 'Sun', difficulty: 'medium', points: 20 },
      { left: 'Lune', right: 'Moon', difficulty: 'medium', points: 20 },
  
    ],
    3: [
      { left: 'Pomme', right: 'Apple', difficulty: 'hard', points: 30 },
      { left: 'Voiture', right: 'Car', difficulty: 'hard', points: 30 },
      { left: 'Arbre', right: 'Tree', difficulty: 'hard', points: 30 },
 
    ],
    4: [
      { left: 'Ordinateur', right: 'Computer', difficulty: 'challenging', points: 40 },
      { left: 'Téléphone', right: 'Phone', difficulty: 'challenging', points: 40 },
      { left: 'Fenêtre', right: 'Window', difficulty: 'challenging', points: 40 },
   
    ]
  },
  Spanish: {
    1: [
      { left: 'Hola', right: 'Hello', difficulty: 'easy', points: 10 },
      { left: 'Gato', right: 'Cat', difficulty: 'easy', points: 10 },
      { left: 'Libro', right: 'Book', difficulty: 'easy', points: 10 }
    ],
    2: [
      { left: 'Perro', right: 'Dog', difficulty: 'medium', points: 20 },
      { left: 'Sol', right: 'Sun', difficulty: 'medium', points: 20 },
      { left: 'Luna', right: 'Moon', difficulty: 'medium', points: 20 },
      { left: 'Escuela', right: 'School', difficulty: 'medium', points: 20 },

    ],
    3: [
      { left: 'Manzana', right: 'Apple', difficulty: 'hard', points: 30 },
      { left: 'Coche', right: 'Car', difficulty: 'hard', points: 30 },
      { left: 'Árbol', right: 'Tree', difficulty: 'hard', points: 30 },
      { left: 'Biblioteca', right: 'Library', difficulty: 'hard', points: 30 },
    
    ],
    4: [
      { left: 'Computadora', right: 'Computer', difficulty: 'challenging', points: 40 },
      { left: 'Teléfono', right: 'Phone', difficulty: 'challenging', points: 40 },
      { left: 'Ventana', right: 'Window', difficulty: 'challenging', points: 40 },
      { left: 'Jardín', right: 'Garden', difficulty: 'challenging', points: 40 },
     
    ]
  },
  German: {
    1: [
      { left: 'Hallo', right: 'Hello', difficulty: 'easy', points: 10 },
      { left: 'Katze', right: 'Cat', difficulty: 'easy', points: 10 },
      { left: 'Buch', right: 'Book', difficulty: 'easy', points: 10 }
    ],
    2: [
      { left: 'Hund', right: 'Dog', difficulty: 'medium', points: 20 },
      { left: 'Sonne', right: 'Sun', difficulty: 'medium', points: 20 },
      { left: 'Mond', right: 'Moon', difficulty: 'medium', points: 20 },
 
    ],
    3: [
      { left: 'Apfel', right: 'Apple', difficulty: 'hard', points: 30 },
      { left: 'Auto', right: 'Car', difficulty: 'hard', points: 30 },
      { left: 'Baum', right: 'Tree', difficulty: 'hard', points: 30 },
      { left: 'Bibliothek', right: 'Library', difficulty: 'hard', points: 30 },
 
    ],
    4: [
      { left: 'Computer', right: 'Computer', difficulty: 'challenging', points: 40 },
      { left: 'Telefon', right: 'Phone', difficulty: 'challenging', points: 40 },
      { left: 'Fenster', right: 'Window', difficulty: 'challenging', points: 40 },
      { left: 'Garten', right: 'Garden', difficulty: 'challenging', points: 40 },
    
    ]
  }
};

 // Load high score from AsyncStorage when component mounts
 useEffect(() => {
    const loadHighScore = async () => {
      const savedHighScore = await AsyncStorage.getItem('highScore');
      if (savedHighScore) {
        setHighScore(Number(savedHighScore));
      }
    };

    loadHighScore();
  }, []);

  // Save high score to AsyncStorage
  const saveHighScore = async (score) => {
    await AsyncStorage.setItem('highScore', score.toString());
    setHighScore(score);
  };

  const handleLanguageSelection = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    setLesson(null);
    setGameStarted(false);
    setGameOver(false);
    setMatchedCards([]);
  };

  const handleLessonSelection = (selectedLesson) => {
    setLesson(selectedLesson);
    setGameStarted(true);
    setMatchedPairs(0);
    setOpenCards([]);
    setMatchedCards([]);
    setTimeLeft(30);
    setGameOver(false);
  };
  const backBtn=()=>{
    setLanguage(null);
    setTimeLeft(0);
  }
  const shuffleCards = useCallback(() => {
    if (!language || !lesson) return;

    const words = wordsData[language][lesson];
    const pairedWords = words.flatMap(word => [
      { value: word.left, type: 'left', translation: word.right, id: Math.random() },
      { value: word.right, type: 'right', translation: word.left, id: Math.random() }
    ]);
    const shuffledCards = pairedWords.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
  }, [language, lesson]);

  useEffect(() => {
    if (gameStarted) {
      shuffleCards();
    }
  }, [gameStarted, lesson, shuffleCards]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 0) {
          clearInterval(timer);
          setGameOver(true);
          Alert.alert("Time's up!", 'The game has ended!');
          return 0;
        }
        return prevTime - 1;
      });
    }, 500);

    return () => clearInterval(timer);
  }, [gameStarted, gameOver]);

  const handleSelectCard = (card) => {
    // Prevent selecting already matched or already open cards
    if (
      matchedCards.includes(card) || 
      openCards.includes(card)
    ) return;

    // Open the card
    const updatedOpenCards = [...openCards, card];
    setOpenCards(updatedOpenCards);

    // If two cards are open, check for a match
    if (updatedOpenCards.length === 2) {
      const [firstCard, secondCard] = updatedOpenCards;
      
      // Check if cards are a matching pair
      const isPair = 
        firstCard.translation === secondCard.value;

      if (isPair) {
        // Mark these cards as matched
        const newMatchedCards = [...matchedCards, firstCard, secondCard];
        setMatchedCards(newMatchedCards);
        setMatchedPairs(prevPairs => prevPairs + 1);
        setOpenCards([]);

        // Check if all cards are matched
        if (newMatchedCards.length === cards.length) {
          setGameOver(true);
          const totalTime = 30 - timeLeft;
          Alert.alert('Congratulations!', `You matched all words in ${30 - timeLeft} seconds!`);
          // Update and save high score
          if (totalTime > highScore) {
            saveHighScore(totalTime);
          }

        }
      } else {
        // Close cards if not a match after a short delay
        setTimeout(() => setOpenCards([]), 500);
      }
    }
  };

  const renderButton = (title, onPress) => (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  const renderSelectionScreen = () => (
    <View style={styles.container}>
      
      <View style={styles.buttonContainer}>
      {renderButtonWithFlag(' French', frenchFlag, () => handleLanguageSelection('French'))}
        {renderButtonWithFlag('Spanish', spanishFlag, () => handleLanguageSelection('Spanish'))}
        {renderButtonWithFlag('German', germanFlag, () => handleLanguageSelection('German'))}
      </View>
  
    </View>
  );

  const renderButtonWithFlag = (label, flagSource, onPress) => (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <View style={styles.buttonContent}>
        <Image source={flagSource} style={styles.flagImage} />
        <Text style={styles.buttonText}>{label}</Text>
      </View>
    </TouchableOpacity>
  );

const renderLessonScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Select a Exercises:</Text>
    <View style={styles.buttonContainer}>
      {[1, 2, 3, 4].map((lesson) =>
        renderButton(`Lesson ${lesson}`, () => handleLessonSelection(lesson))
      )}
    </View>
    <TouchableOpacity
      style={styles.backButton}
      onPress={() => setLanguage(null)} // Navigate back to language selection
    >
      <Text style={styles.backButtonText}>Back</Text>
    </TouchableOpacity>
  </View>
);


  const renderGameScreen = () => (
  <View style={styles.container}>
    <View style={styles.statusContainer}>
      <Text style={styles.statusText}>Time left: {timeLeft}s</Text>
      <Text style={styles.statusText}>Matched pairs: {matchedPairs}</Text>
    </View>
    <View style={styles.grid}>
      {cards.map((card, index) => {
        const isOpen = openCards.includes(card);
        const isMatched = matchedCards.includes(card);

        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.cell,
              isOpen && styles.openCell,
              isMatched && styles.matchedCell,
            ]}
            onPress={() => handleSelectCard(card)}
          >
            <Text style={styles.cardText}>{isOpen || isMatched ? card.value : '?'}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
    <TouchableOpacity
      style={styles.backButton}
      onPress={backBtn}
    >
      <Text style={styles.backButtonText}>Back</Text>
    </TouchableOpacity>
    {gameOver && (
      <View style={styles.overlay}>
      <View style={styles.gameOverCard}>
        <Text style={styles.gameOverTitle}>🎉 Game Over! 🎉</Text>
        <Text style={styles.gameOverScore}>Your Score: <Text style={styles.highlight}>{matchedPairs}</Text> pairs</Text>
        <Text style={styles.gameOverTime}>Time Taken: <Text style={styles.highlight}>{30 - timeLeft}</Text> seconds</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => handleLanguageSelection(null)}>
          <Text style={styles.backButtonText}>Back to Menu</Text>
        </TouchableOpacity>
      </View>
      </View>
    )}
  </View>
);


  return language === null
    ? renderSelectionScreen()
    : lesson === null
    ? renderLessonScreen()
    : renderGameScreen();
}

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white', // Light background
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a73e8', // Primary color
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#0A3981', // Blue for action buttons
    paddingVertical: 20,
    paddingHorizontal: 70,
    borderRadius: 25,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    justifyContent: 'center',
    marginLeft:16,
    
  },
  flagImage: {
    width: 100,
    height: 100,
    marginBottom: 1,
    resizeMode: 'contain', // Resize image to fit
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  cell: {
    width: 110,              // Adjusted width to ensure cards are wider
    height: 110,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#1a73e8',
  },
  openCell: {
    backgroundColor: '#34a853', // Matched cards green
  },
  matchedCell: {
    backgroundColor: '#fbbc05', // Highlighted cards yellow
  },
  cardText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',  // Center the text
    flexWrap: 'wrap',      // Allow text to wrap if too long
    paddingHorizontal: 5,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  overlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)', // Dark semi-transparent overlay
  justifyContent: 'center',
  alignItems: 'center',
},
gameOverCard: {
  width: '85%',
  backgroundColor: '#fff', // White card background
  borderRadius: 20,
  padding: 25,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.4,
  shadowRadius: 6,
  elevation: 8,
},
gameOverTitle: {
  fontSize: 30,
  fontWeight: 'bold',
  color: '#34a853', // Green for celebration
  marginBottom: 20,
  textAlign: 'center',
},
gameOverScore: {
  fontSize: 20,
  marginBottom: 10,
  color: '#333',
  textAlign: 'center',
},
gameOverTime: {
  fontSize: 20,
  marginBottom: 20,
  color: '#333',
  textAlign: 'center',
},
backButton: {
  backgroundColor: '#f44336', // Red color for the back button
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 20,
  marginTop: 20,
},
backButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
  textAlign: 'center',
},
};

