// intents.js

export const intents = [
  {
      name: 'translate',
      pattern: /translate\s*['"]([^'"]+)['"] to (\w+)/i,
      handler: async (match, dependencies) => {
          const { query, languageEndpoints } = dependencies;
          const wordToTranslate = match[1];
          const targetLanguage = match[2].toLowerCase();

          let endpoint = null;
          const languagePairs = {
              'en-fr': ['english', 'french', 'en', 'fr'],
              'en-es': ['english', 'spanish', 'en', 'es'],
              'fr-en': ['french', 'english', 'fr', 'en'],
              'es-en': ['spanish', 'english', 'es', 'en'],
              'fr-es': ['french', 'spanish', 'fr', 'es'],
              'es-fr': ['spanish', 'french', 'es', 'fr'],
              'en-de': ['english', 'german', 'en', 'de'],
              'de-en': ['german', 'english', 'de', 'en']
          };

          for (const [pair, validLanguages] of Object.entries(languagePairs)) {
              if (validLanguages.includes(targetLanguage)) {
                  endpoint = languageEndpoints[pair];
                  break;
              }
          }

          if (endpoint) {
              try {
                  const data = { inputs: wordToTranslate };
                  const result = await query(data, endpoint);

                  return result.translation ||
                      result[0]?.translation_text ||
                      'Translation failed';
              } catch (error) {
                  return `Translation error: ${error.message}`;
              }
          } else {
              return 'Unsupported language. Try English, French, or Spanish.';
          }
      },
  },
  {
      name: 'greeting',
      pattern: /^(hello|hi|hey|greetings)/i,
      handler: () => 'Hello! How can I assist you today?',
  },
  {
      name: 'help',
      pattern: /^(help|what can you do|commands|features)/i,
      handler: () => 'I can help you translate words or sentences. Try typing: "Translate \'apple\' to French".',
  },
  {
      name: 'unknown',
      pattern: /.*/,
      handler: () => 'Sorry, I didn\'t understand that. Can you try rephrasing?',
  },
];
