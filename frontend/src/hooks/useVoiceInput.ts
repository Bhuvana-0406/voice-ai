'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface VoiceInputHook {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useVoiceInput(onFinalTranscript?: (text: string) => void): VoiceInputHook {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const maxTimerRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedTextRef = useRef<string>('');

  const SILENCE_THRESHOLD_MS = 1800; // 1.8 seconds pause threshold

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
      }
    }
  }, []);

  const clearAllTimers = useCallback(() => {
    if (maxTimerRef.current) {
      clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const stopListening = useCallback(() => {
    clearAllTimers();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (err) {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript('');
  }, [clearAllTimers]);

  const handleSpeechFinished = useCallback((textToSend: string) => {
    clearAllTimers();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (err) {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript('');
    if (textToSend.trim() && onFinalTranscript) {
      onFinalTranscript(textToSend.trim());
    }
  }, [clearAllTimers, onFinalTranscript]);

  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;
    setError(null);
    setTranscript('');
    setInterimTranscript('');
    accumulatedTextRef.current = '';
    clearAllTimers();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (err) {
        // ignore
      }
      recognitionRef.current = null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Voice search is not supported in this browser. Please type your query below.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Push-to-talk mode
      recognition.interimResults = true;
      recognition.lang = typeof navigator !== 'undefined' ? (navigator.language || 'en-US') : 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            final += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }

        const currentCombined = (final || interim).trim();
        if (currentCombined) {
          accumulatedTextRef.current = currentCombined;
        }

        if (interim) setInterimTranscript(interim);

        // Immediate submission on browser final result
        if (final) {
          setTranscript(final);
          handleSpeechFinished(final);
          return;
        }

        // 1.35-second Natural Silence Pause Detection
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        silenceTimerRef.current = setTimeout(() => {
          if (accumulatedTextRef.current.trim()) {
            setTranscript(accumulatedTextRef.current);
            handleSpeechFinished(accumulatedTextRef.current);
          }
        }, SILENCE_THRESHOLD_MS);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        clearAllTimers();
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setError('Microphone permission denied. Please allow mic access in your browser address bar.');
        } else if (event.error === 'network') {
          setError('Google Speech Service is unreachable on your network. You can type your request in the search bar below!');
        }
      };

      recognition.onend = () => {
        clearAllTimers();
        setIsListening(false);
      };

      recognitionRef.current = recognition;

      // 15-second max audio capture fallback timeout
      maxTimerRef.current = setTimeout(() => {
        if (accumulatedTextRef.current.trim()) {
          handleSpeechFinished(accumulatedTextRef.current);
        } else {
          stopListening();
        }
      }, 15000);

      recognition.start();
    } catch (err) {
      console.error('Speech recognition exception:', err);
      clearAllTimers();
      setIsListening(false);
      setError('Could not start voice search. You can type your query in the input bar below.');
    }
  }, [onFinalTranscript, stopListening, clearAllTimers, handleSpeechFinished]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    accumulatedTextRef.current = '';
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
