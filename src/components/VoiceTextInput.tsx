import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

interface VoiceTextInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  className?: string;
  isSingleLine?: boolean;
}

// Global declaration for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const VoiceTextInput: React.FC<VoiceTextInputProps> = ({
  id,
  value,
  onChange,
  placeholder,
  rows = 3,
  required = false,
  className = '',
  isSingleLine = false,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!isSupported) {
      alert('O reconhecimento de voz não é suportado pelo seu navegador.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = 'pt-BR';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setInterimText('');
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          const space = value && !value.endsWith(' ') ? ' ' : '';
          onChange(value + space + finalTranscript.trim());
          setInterimText('');
        } else {
          setInterimText(currentInterim);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setInterimText('');
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Error starting voice recognition:', err);
      setIsListening(false);
    }
  };

  return (
    <div className="relative w-full">
      {isSingleLine ? (
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={`w-full text-xs p-3 pr-11 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-slate-800 ${className}`}
        />
      ) : (
        <textarea
          id={id}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={`w-full text-xs p-3 pr-11 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-slate-800 leading-relaxed ${className}`}
        />
      )}

      {/* Voice Record Toggle Button */}
      <button
        type="button"
        onClick={toggleListening}
        title={isListening ? 'Parar gravação por voz' : 'Gravar por voz'}
        className={`absolute right-2.5 top-2.5 p-2 rounded-xl transition-all flex items-center justify-center ${
          isListening
            ? 'bg-red-600 text-white animate-pulse shadow-md ring-2 ring-red-400'
            : 'bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-900 border border-slate-200'
        }`}
      >
        {isListening ? (
          <MicOff className="w-4 h-4" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>

      {/* Live speech feedback pill */}
      {isListening && (
        <div className="mt-1 flex items-center space-x-1.5 text-[11px] font-bold text-red-600 bg-red-50 p-2 rounded-xl border border-red-200 animate-in fade-in">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping shrink-0" />
          <span>Ouvindo voz em tempo real... {interimText ? `"${interimText}"` : ''}</span>
        </div>
      )}
    </div>
  );
};
