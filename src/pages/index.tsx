import React, { useEffect, useRef, useState } from 'react';
import styles from '../styles/Home.module.css';

import { Microphone, DownloadSimple, Trash } from 'phosphor-react';
import Image from 'next/image';

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onaudiostart?: () => void;
  onaudioend?: () => void;
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
      speechApi: SpeechRecognition | undefined;
      private output: HTMLTextAreaElement | null = null;

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

        this.speechApi.onaudiostart = () => {
          console.log('Captura de áudio iniciada.');
        };

        this.speechApi.onaudioend = () => {
          console.log('Captura de áudio encerrada.');
          setIsRec(false);
          postText();
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
      // Verifique se o botão está desabilitado
      if (!btnGravarRef.current!.disabled) {
        // Desabilite o botão
        btnGravarRef.current!.disabled = true;

        // Execute a ação desejada (iniciar gravação)
        speech.start();

        // Aguarde um período de tempo antes de habilitar o botão novamente
        setTimeout(() => {
          btnGravarRef.current!.disabled = false;
        }, 2000); // Defina o tempo desejado em milissegundos (2 segundos neste exemplo)
      }
    });

    btnPararRef.current!.addEventListener('click', () => {
      // Verifique se o botão está desabilitado
      if (!btnPararRef.current!.disabled) {
        // Desabilite o botão
        btnPararRef.current!.disabled = true;

        // Execute a ação desejada (parar gravação)
        speech.stop();

        // Aguarde um período de tempo antes de habilitar o botão novamente
        setTimeout(() => {
          btnPararRef.current!.disabled = false;
        }, 2000); // Defina o tempo desejado em milissegundos (2 segundos neste exemplo)
      }
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

  const handleDownload = () => {
    const formattedData = text.join('\n');
    const element = document.createElement('a');
    const file = new Blob([formattedData], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'data.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  const [isRec, setIsRec] = useState(false);
  const [text, setText] = useState<string[]>([]);

  function handleActiveRec() {
    setIsRec(true);
  }

  function handleDisableRec() {
    setIsRec(false);
  }

  function postText() {
    const word = textareaRef.current!.value;

    if (word != '') {
      setText((prevText) => [...prevText, word]);
      textareaRef.current!.value = '';
    }
  }

  return (
    <div className={styles.container}>
      <h1>Transcrição</h1>
      <h2>Áudio para texto</h2>
      <div></div>

      <label className={styles.simpleButtons}>
        Observe o campo abaixo:
        <button onClick={handleDownload}>
          <DownloadSimple weight='regular' />
        </button>
        <button ref={btnLimparRef} id='btnLimpar'>
          <Trash weight='bold' />
        </button>
      </label>
      <textarea ref={textareaRef} id='textarea'></textarea>
      <div className={styles.recButton}>
        <button
          className={isRec ? styles.noDisplay : styles.noRec}
          onClick={handleActiveRec}
          ref={btnGravarRef}
          id='btnGravar'
        >
          <Microphone weight='fill' />
        </button>
        <button
          ref={btnPararRef}
          id='btnParar'
          onClick={handleDisableRec}
          className={isRec ? styles.rec : styles.noDisplay}
        >
          <Microphone weight='fill' />
        </button>
      </div>
      {text.length > 0 && (
        <ul>
          <h2>Foi falado:</h2>
          {text.map((item, index) => (
            <li key={index}>
              <p>{item}</p>
            </li>
          ))}
        </ul>
      )}
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
