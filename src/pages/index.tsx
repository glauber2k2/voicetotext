import { useEffect, useRef, useState } from 'react';
import styles from '../styles/Home.module.css';

import {
  Microphone,
  MicrophoneSlash,
  DownloadSimple,
  Trash,
} from 'phosphor-react';
import Image from 'next/image';

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

function App(): JSX.Element {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const btnGravarRef = useRef<HTMLButtonElement>(null);
  const btnPararRef = useRef<HTMLButtonElement>(null);
  const btnBaixarRef = useRef<HTMLButtonElement>(null);
  const btnLimparRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    class SpeechApi {
      speechApi: SpeechRecognition | undefined; // Made speechApi property public
      private output: HTMLTextAreaElement | null = null; // Marked as optional with default value

      constructor() {
        const SpeechToText =
          (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition;

        if (!SpeechToText) {
          console.log(
            'Este navegador não é compatível com o reconhecimento de fala.'
          );
          return;
        }

        this.speechApi = new SpeechToText() as SpeechRecognition;
        this.output = textareaRef.current!;
        this.speechApi.continuous = true;
        this.speechApi.lang = 'pt-BR';

        this.speechApi.onresult = (e) => {
          const resultIndex = e.resultIndex;
          const transcript = e.results[resultIndex][0].transcript as string;

          if (this.output) {
            this.output.value += transcript;
          }
        };
      }

      start() {
        if (this.speechApi) {
          this.speechApi.start();
        }
      }

      stop() {
        if (this.speechApi) {
          this.speechApi.stop();
        }
      }
    }

    const speech = new SpeechApi();

    if (!speech.speechApi) {
      return;
    }

    btnGravarRef.current!.addEventListener('click', () => {
      btnGravarRef.current!.disabled = true;
      btnPararRef.current!.disabled = false;
      speech.start();
    });

    btnPararRef.current!.addEventListener('click', () => {
      btnGravarRef.current!.disabled = false;
      btnPararRef.current!.disabled = true;
      speech.stop();
    });

    btnBaixarRef.current!.addEventListener('click', () => {
      const text = textareaRef.current!.value;
      const filename = 'speech.txt';

      download(text, filename);
    });

    btnLimparRef.current!.addEventListener('click', () => {
      textareaRef.current!.value = '';
      btnGravarRef.current!.disabled = false;
      btnPararRef.current!.disabled = true;
      speech.stop();
    });

    return () => {
      speech.stop();
    };
  }, []);
  function download(text: string, filename: string) {
    const element = document.createElement('a');

    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(text)
    );

    element.setAttribute('download', filename);

    element.style.display = 'none';

    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  const [isRec, setIsRec] = useState(false);

  function handleActiveRec() {
    setIsRec(true);
  }

  function handleDisableRec() {
    setIsRec(false);
  }

  return (
    <div className={styles.container}>
      <h1>Transcrição</h1>
      <h2>Áudio para texto</h2>

      <label>Observe o campo abaixo:</label>
      <textarea ref={textareaRef} id='textarea'></textarea>
      <div className={styles.buttons}>
        <button
          className={isRec ? styles.rec : styles.noRec}
          onClick={handleActiveRec}
          ref={btnGravarRef}
          id='btnGravar'
        >
          <Microphone weight='fill' />
        </button>
        <button ref={btnPararRef} id='btnParar' onClick={handleDisableRec}>
          <MicrophoneSlash weight='fill' />
        </button>
        <button ref={btnBaixarRef} id='btnBaixar'>
          <DownloadSimple weight='regular' />
        </button>
        <button ref={btnLimparRef} id='btnLimpar'>
          <Trash weight='bold' />
        </button>
      </div>

      <Image
        src='/images/CONTE_LOGO_REDUZIDO_BRANCO.png'
        width={1280}
        height={1280}
        alt=' '
      />
    </div>
  );
}

export default App;
