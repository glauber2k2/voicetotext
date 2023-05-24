import { useEffect, useRef } from 'react';
import styles from '../styles/Home.module.css';

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
  return (
    <div className={styles.container}>
      <div className={styles.textBox}>
        <h1>VOZ PARA TEXTO</h1>
        <textarea ref={textareaRef} id='textarea'></textarea>
        <div>
          <button ref={btnGravarRef} id='btnGravar'>
            GRAVAR
          </button>
          <button ref={btnPararRef} id='btnParar'>
            PARAR
          </button>
          <button ref={btnBaixarRef} id='btnBaixar'>
            BAIXAR
          </button>
          <button ref={btnLimparRef} id='btnLimpar'>
            LIMPAR
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
