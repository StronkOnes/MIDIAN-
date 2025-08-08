
# MIDIAN - AI MIDI Creator

MIDIAN

MIDIAN is your AI-powered music production partner. It crafts professional-grade MIDI for any genre, generating inspired drum loops, emotional chord progressions, and expressive melodies in seconds. A perfect tool for producers, beatmakers, and composers to accelerate their creative workflow.

Key Features

- **🤖 Virtuoso AI Engine**: Powered by Google's Gemini Pro, the AI understands music theory, genre conventions, and the nuances that create human-like feel and musicality.
- **🎹 Multi-Layer Generation**: Create individual tracks for Drums, Chords, Melody, Bass, and textural Layers (Arpeggios), or generate a full, harmonically-aware song arrangement at once.
- **🎛️ Granular Creative Control**: You're the producer. Dictate the genre, key, tempo, complexity, instrument, scale, and style. The AI adapts to your vision.
- **🎼 Perfect, Musical Loops**: Our core focus is on creating loops that are not only technically perfect but also musically satisfying, with phrases that resolve gracefully and flow seamlessly.
- **🎧 High-Quality In-Browser Preview**: Audition your creations instantly with a suite of custom-designed synths built with `Tone.js`, providing studio-quality sound design directly in the browser.
- **💾 DAW-Ready MIDI Export**: Download your selected tracks as a single `.zip` file containing perfectly-looped, sanitized `.mid` files, ready to be dropped into any Digital Audio Workstation (DAW).

How It Works: From Idea to MIDI in Seconds

1.  **Set Your Canvas**: Select your desired genre, key, tempo, and loop/song length. Dial in the core feel of your track before the first note is even played.
2.  **Generate with Intent**: Use the 'Generate Full Song' button for a cohesive arrangement, or craft your track layer-by-layer. When generating melody, bass, or layers, the AI is aware of the existing chords to ensure harmonic compatibility.
3.  **Export & Integrate**: Preview your creation, select the tracks you love, and download a single ZIP file containing perfect, loopable MIDI ready for any DAW.

Technical Highlights

This project demonstrates several advanced techniques for building a robust and creative AI application.

#### 1. Schema-Enforced AI Output

To ensure reliability, we leverage Gemini's `responseSchema` feature. For every request, we define the exact JSON structure we expect, including data types and descriptions for each field. This forces the AI to return clean, predictable, and immediately parsable data, eliminating the need for fragile string parsing or complex error correction.



2. Advanced, Musically-Aware Prompt Engineering

The prompts sent to the AI are highly detailed, instructing it to act as a "virtuoso musician." Crucially, the prompt contains strict rules about musicality and looping, demanding that phrases resolve gracefully within the loop's duration rather than being abruptly cut off.

3. Bulletproof Loop Sanitization

As a final quality-control gate, a `sanitizeNotesForLooping` function in `Tool.tsx` processes all AI-generated data.
- It uses **integer-based tick calculations** instead of floating-point seconds to avoid precision errors.
- It precisely **truncates any note** that overflows the loop boundary.
- It intelligently **discards any resulting note fragment** that is too short to be musically meaningful (e.g., less than a 64th note), preventing audible "blips" at the end of a loop.

4. MIDI Timing Synchronization
A key challenge was ensuring the timing from the in-browser `Tone.js` preview perfectly matched the exported `@tonejs/midi` file. We solved this by scaling the note tick values to synchronize the PPQ (Pulses Per Quarter) between the two libraries, guaranteeing that what you hear is exactly what you get.

Technology Stack

- **Framework**: React with TypeScript
- **AI**: Google Gemini API (`@google/genai`)
- **Audio & MIDI**:
  - `Tone.js`: For Web Audio scheduling, transport, and in-browser synthesis.
  - `@tonejs/midi`: For creating and exporting `.mid` files.
- **Styling**: Tailwind CSS
- **Utilities**:
  - `JSZip`: For creating `.zip` archives in the browser.
  - `file-saver`: For triggering file downloads.
- **Module Loading**: The project uses `importmap` in `index.html` to handle ES module dependencies directly in the browser without a build step.

Getting Started

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/google/genai-patterns.git
    cd genai-patterns/experimental/midian-creator
    ```

2.  **Set up your API Key:**
    - Get an API key
    - This project loads the key from the environment. In a local development environment (like the one provided by `pnpm start`), it will automatically load from a `.env` file. Create this file in the project root:
      ```
      # .env
      API_KEY=YOUR_API_KEY_HERE
      ```
    > **Note**: This file is included in `.gitignore` and should never be committed to version control.

3.  **Install dependencies and run the server:**
    This project uses `pnpm` to manage dependencies.
    ```bash
    pnpm install
    pnpm start
    ```
    This will start a local development server. Open your browser to the URL provided (usually `http://localhost:5173`).


## License

No License

