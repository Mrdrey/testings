from transformers import MarianMTModel, MarianTokenizer
import torch

# Load MarianMT model and tokenizer
model_name = "dreyyyy/EN-FR"  # Replace with your desired model
model = MarianMTModel.from_pretrained(model_name)
tokenizer = MarianTokenizer.from_pretrained(model_name)

# Beam Search Parameters
BEAM_WIDTH = 3  # Number of beams to keep
MAX_LENGTH = 50  # Maximum output length

# Beam Search Implementation
def beam_search_translate(source_text, beam_width=BEAM_WIDTH, max_length=MAX_LENGTH):
    """Performs beam search to generate translations."""
    # Tokenize input text
    inputs = tokenizer(source_text, return_tensors="pt", truncation=True)
    encoder_outputs = model.get_encoder()(**inputs)

    # Initialize beams (each beam is a tuple of (tokens, score))
    beams = [(inputs["input_ids"].squeeze(0)[:1], 0.0)]  # Start with the first token
    completed_beams = []

    for _ in range(max_length):
        new_beams = []

        for tokens, score in beams:
            # Stop if beam ends with <eos>
            if tokens[-1].item() == tokenizer.eos_token_id:
                completed_beams.append((tokens, score))
                continue

            # Prepare input for decoder
            decoder_inputs = tokens.unsqueeze(0)

            # Generate logits for next token
            outputs = model.decoder(
                input_ids=decoder_inputs,
                encoder_hidden_states=encoder_outputs.last_hidden_state
            )
            logits = model.lm_head(outputs.last_hidden_state[:, -1, :])
            probs = torch.nn.functional.log_softmax(logits, dim=-1)

            # Get top-k tokens and their scores
            top_k_probs, top_k_tokens = torch.topk(probs, beam_width, dim=-1)

            # Add new beams
            for k in range(beam_width):
                new_tokens = torch.cat([tokens, top_k_tokens[0, k].unsqueeze(0)])
                new_score = score + top_k_probs[0, k].item()
                new_beams.append((new_tokens, new_score))

        # Keep top-k beams based on score
        beams = sorted(new_beams, key=lambda x: x[1], reverse=True)[:beam_width]

        # If all beams end with <eos>, stop early
        if all(tokens[-1].item() == tokenizer.eos_token_id for tokens, _ in beams):
            break

    # Add remaining beams to completed_beams
    completed_beams.extend(beams)

    # Select the best beam
    best_beam = max(completed_beams, key=lambda x: x[1])
    decoded_translation = tokenizer.decode(best_beam[0], skip_special_tokens=True)

    return decoded_translation

# Example usage
if __name__ == "__main__":
    source_text = "Bonjour le monde"  # Example source text
    translation = beam_search_translate(source_text)
    print("Translation:", translation)
