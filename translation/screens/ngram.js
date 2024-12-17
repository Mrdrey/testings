// Function to calculate n-grams from a given text
export function getNGrams(text, n) {
    const ngrams = [];
    for (let i = 0; i <= text.length - n; i++) {
      ngrams.push(text.substring(i, i + n).toLowerCase());
    }
    return ngrams;
  }
  
  // Function to calculate the frequency of n-grams
  export function calculateNGramFrequency(text, n) {
    const ngrams = getNGrams(text, n);
    const frequencyMap = {};
  
    ngrams.forEach((ngram) => {
      if (frequencyMap[ngram]) {
        frequencyMap[ngram] += 1;
      } else {
        frequencyMap[ngram] = 1;
      }
    });
  
    return frequencyMap;
  }
  
  // Language profiles with sample n-gram frequencies
  export const languageProfiles = {
    en: {
      "he": 0.03, "she": 0.03, "it": 0.02, "i": 0.03, "we": 0.02, "the": 0.03, "of": 0.03, "to": 0.03,
      "and": 0.02, "is": 0.02, "in": 0.02, "on": 0.02, "at": 0.02, "there": 0.03, "them": 0.03, "thank": 0.02,
      "this": 0.02, "that": 0.03, "these": 0.03, "those": 0.03, "for": 0.03, "they": 0.03, "take": 0.02, "then": 0.02,
      "when": 0.02, "where": 0.02, "how": 0.02, "it's": 0.02, "what": 0.03, "who": 0.03, "why": 0.03, "if": 0.01, 
      "i'm": 0.03, "i'll": 0.01, "okay": 0.01, "ok": 0.01, "or": 0.02, "out": 0.02, "oh": 0.01, "say": 0.02, "see": 0.02, 
      "so": 0.02,"some": 0.02, "somebody": 0.01, "something":0.01, "someone": 0.01, "sometimes": 0.01, "somewhere": 0.01, 
      "so": 0.01, "stop": 0.01,"such": 0.02, "here": 0.02, "his": 0.03, "her": 0.03, "hi": 0.01, "hello": 0.01, "him": 0.02, 
      "have": 0.02, "any": 0.02, "are": 0.02, "an": 0.03, "as": 0.02, "be": 0.02, "but": 0.02, "a": 0.03, "am": 0.02, "ask": 0.01, 
      "all": 0.02, "away": 0.01, "me": 0.02, "mine": 0.01, "may": 0.02, "might": 0.01, "must": 0.01, "know": 0.02, "keep": 0.01, 
      "was": 0.02, "way": 0.01, "will": 0.02, "would": 0.01, "wait": 0.01, "well": 0.01, "were": 0.02, "with": 0.03, "without": 0.01, 
      "within": 0.01, "let": 0.01, "look": 0.01, "just": 0.01, "love": 0.02, "us": 0.02, "up": 0.01, "no": 0.02, "nice": 0.02, "not": 0.02, 
      "now": 0.02, "new": 0.01, "you": 0.02, "don't": 0.02, "does": 0.02, "do": 0.02, "did": 0.02, "go": 0.02, "get": 0.02, "got": 0.01, 
      "give": 0.01, "given": 0.01, "gives": 0.01, "gave": 0.02, "can": 0.02, "come": 0.02, "came": 0.02, "could": 0.02, "call": 0.01, 
      "called": 0.01, "cannot": 0.01
    },

    es: {
        "él": 0.03, "ella": 0.03, "nosotros": 0.02, "vosotros": 0.02, "tú": 0.03, "de": 0.03, "la": 0.03, 
        "es": 0.03, "en": 0.03, "el": 0.03, "y": 0.03, "por": 0.03, "eso": 0.02, "a": 0.03, "allí": 0.02, 
        "gracias": 0.02, "esto": 0.02, "estos": 0.02, "esos": 0.02, "para": 0.03, "ellos": 0.03, "tomar": 0.02, 
        "entonces": 0.02, "cuando": 0.02, "donde": 0.02, "cómo": 0.02, "qué": 0.03, "quién": 0.03, 
        "por qué": 0.03, "si": 0.02, "soy": 0.03, "voy a": 0.02, "vale": 0.01, "ok": 0.01, "o": 0.02, 
        "fuera": 0.02, "oh": 0.01, "decir": 0.02, "ver": 0.02, "así que": 0.02, "algunos": 0.02, "alguien": 0.02, 
        "algo": 0.02, "a veces": 0.02, "en algún lugar": 0.01, "detente": 0.01, "tal": 0.02, "aquí": 0.02, 
        "su": 0.03, "hola": 0.02, "tener": 0.02, "cualquiera": 0.02, "son": 0.03, "un": 0.03, "como": 0.02, 
        "ser": 0.03, "pero": 0.02, "preguntar": 0.01, "todos": 0.02, "lejos": 0.01, "mío": 0.01, "puede": 0.02, 
        "debe": 0.01, "saber": 0.02, "mantener": 0.01, "era": 0.02, "camino": 0.01, "quiero": 0.03, "debería": 0.01, 
        "espera": 0.01, "bien": 0.02, "eran": 0.02, "con": 0.03, "sin": 0.02, "dentro": 0.01, "dejar": 0.01, 
        "mirar": 0.01, "solo": 0.02, "amar": 0.02, "nosotros": 0.02, "arriba": 0.01, "no": 0.03, "agradable": 0.02, 
        "ahora": 0.02, "nuevo": 0.02, "hace": 0.02, "hizo": 0.02, "fue": 0.03, "obtuvo": 0.01, "dio": 0.01, 
        "viene": 0.02, "vino": 0.02, "podría": 0.02, "llamó": 0.01, "no puede": 0.01, "un": 0.02
    },
          
    de: {
        "er": 0.03, "sie": 0.03, "es": 0.03, "ich": 0.03, "der": 0.03, "die": 0.03, "von": 0.03, "zu": 0.03, "alt": 0.03,
        "ist": 0.03, "mit": 0.03, "für": 0.03, "an": 0.02, "bei": 0.02, "wir": 0.02, "und": 0.03, "in": 0.03, "bin": 0.03,
        "auf": 0.02, "um": 0.02, "dort": 0.02, "danke": 0.02, "dies": 0.02, "das": 0.03, "diese": 0.02, "wonhe": 0.03,
        "jene": 0.02, "nehmen": 0.02, "dann": 0.02, "wann": 0.02, "wo": 0.02, "wie": 0.02, "es ist": 0.02, 
        "was": 0.03, "wer": 0.03, "warum": 0.03, "wenn": 0.01, "ich bin": 0.03, "ich werde": 0.01, 
        "okay": 0.01, "ok": 0.01, "oder": 0.02, "raus": 0.02, "oh": 0.01, "sagen": 0.02, "sehen": 0.02, 
        "also": 0.02, "einige": 0.02, "jemand": 0.02, "etwas": 0.02, "manchmal": 0.01, "irgendwo": 0.01, 
        "stopp": 0.01, "so": 0.02, "hier": 0.02, "sein": 0.03, "ihr": 0.03, "hallo": 0.02, "ihn": 0.02, 
        "habe": 0.02, "irgendein": 0.02, "sind": 0.03, "eine": 0.03, "als": 0.02, "aber": 0.02, "ein": 0.03, 
        "bin": 0.02, "fragen": 0.01, "alle": 0.02, "weg": 0.01, "mein": 0.01, "kann": 0.02, "könnte": 0.01, 
        "muss": 0.01, "wissen": 0.02, "behalten": 0.01, "war": 0.02, "wird": 0.02, "würde": 0.01, 
        "warten": 0.01, "gut": 0.01, "waren": 0.02, "ohne": 0.01, "innerhalb": 0.01, "lassen": 0.01, 
        "schauen": 0.01, "nur": 0.02, "lieben": 0.02, "uns": 0.02, "oben": 0.01, "nein": 0.02, "nett": 0.02, 
        "nicht": 0.03, "jetzt": 0.02, "neu": 0.01, "du": 0.02, "tut": 0.02, "tun": 0.02, "hat": 0.02, 
        "gehen": 0.02, "bekommen": 0.02, "bekam": 0.01, "gab": 0.01, "gibt": 0.02, "kam": 0.02, "kann nicht": 0.01
      }, 
  };
  
  // Function to detect language using n-gram analysis
  export function detectLanguageUsingNGrams(text) {
    const n = Math.min(3, Math.max(1, Math.floor(text.trim().length / 5)));
    const textNGramFrequency = calculateNGramFrequency(text, n);
  
    let detectedLanguage = "unknown";
    let highestScore = -Infinity;
  
    Object.keys(languageProfiles).forEach((language) => {
      const profile = languageProfiles[language];
      let score = 0;
  
      Object.keys(textNGramFrequency).forEach((ngram) => {
        if (profile[ngram]) {
          score += profile[ngram] * textNGramFrequency[ngram];
        }
      });
  
      if (score > highestScore) {
        highestScore = score;
        detectedLanguage = language;
      }
    });
  
    return detectedLanguage;
  }