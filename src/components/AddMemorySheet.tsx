import { Mic, Square, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ChildProfile, MemoryFormState } from '../types';

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{
    0: {
      transcript: string;
    };
    isFinal: boolean;
  }>;
};

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

type AddMemorySheetProps = {
  children: ChildProfile[];
  form: MemoryFormState;
  isEditing?: boolean;
  memoryTypes: string[];
  onClose: () => void;
  onDelete?: () => void;
  onSave: () => void;
  onUpdateForm: (field: keyof MemoryFormState, value: string) => void;
};

export function AddMemorySheet({ children, form, isEditing = false, memoryTypes, onClose, onDelete, onSave, onUpdateForm }: AddMemorySheetProps) {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState('');
  const isVoiceNote = form.type === 'Voice note';

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  function startVoiceCapture() {
    const SpeechRecognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceMessage('Voice capture is not supported in this browser. On iPhone, you can still tap the text box and use the keyboard microphone.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    const startingText = form.body.trim();
    let finalTranscript = startingText;

    recognition.onresult = (event) => {
      let interimTranscript = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0].transcript.trim();

        if (event.results[index].isFinal) {
          finalTranscript = [finalTranscript, transcript].filter(Boolean).join(' ');
        } else {
          interimTranscript = transcript;
        }
      }

      onUpdateForm('body', [finalTranscript, interimTranscript].filter(Boolean).join(' '));
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setVoiceMessage(event.error === 'not-allowed' ? 'Microphone permission was blocked. Allow microphone access in Safari, then try again.' : 'Voice capture stopped. You can try again or type the memory.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    setVoiceMessage('Listening...');
    setIsListening(true);
    recognition.start();
  }

  function stopVoiceCapture() {
    recognitionRef.current?.stop();
    setIsListening(false);
    setVoiceMessage('Voice capture stopped.');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 px-0 sm:px-4" role="dialog" aria-modal="true" aria-label={isEditing ? 'Edit memory' : 'Add memory'}>
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-[2rem] bg-[#fffdf8] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl shadow-slate-950/30 sm:mb-4 sm:rounded-[2rem]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Quick capture</p>
            <h2 className="mt-1 text-xl font-semibold">{isEditing ? 'Edit memory' : 'Add a memory'}</h2>
          </div>
          <button className="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-700" onClick={onClose} aria-label="Close" title="Close">
            <X size={19} />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Child</span>
            <select
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none focus:border-slate-400"
              value={form.child}
              onChange={(event) => onUpdateForm('child', event.target.value)}
            >
              {children.map((child) => (
                <option key={child.name} value={child.name}>
                  {child.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Type</span>
            <select
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none focus:border-slate-400"
              value={form.type}
              onChange={(event) => onUpdateForm('type', event.target.value)}
            >
              {memoryTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">What happened?</span>
            {isVoiceNote && (
              <div className="mt-2 rounded-3xl border border-slate-200 bg-white p-3">
                <button
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white"
                  type="button"
                  onClick={isListening ? stopVoiceCapture : startVoiceCapture}
                >
                  {isListening ? <Square size={17} /> : <Mic size={17} />}
                  {isListening ? 'Stop voice capture' : 'Start voice capture'}
                </button>
                <p className="mt-2 text-xs leading-5 text-slate-500">{voiceMessage || 'Tap start, allow microphone access, and speak your memory.'}</p>
              </div>
            )}
            <textarea
              className="mt-2 min-h-32 w-full resize-none rounded-3xl border border-slate-200 bg-white px-4 py-3 text-base leading-6 outline-none focus:border-slate-400"
              placeholder={isVoiceNote ? 'Your transcript will appear here...' : 'Ellie asked why the moon follows our car...'}
              value={form.body}
              onChange={(event) => onUpdateForm('body', event.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Tags</span>
            <input
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
              placeholder="bedtime, funny, firsts"
              value={form.tags}
              onChange={(event) => onUpdateForm('tags', event.target.value)}
            />
          </label>

          <div className="flex gap-3">
            {isEditing && onDelete && (
              <button className="h-13 flex-1 rounded-2xl border border-rose-200 bg-white px-4 text-sm font-semibold text-rose-700" type="button" onClick={onDelete}>
                Delete
              </button>
            )}
            <button
              className="h-13 flex-[2] rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              type="button"
              onClick={onSave}
              disabled={!form.body.trim()}
            >
              Save memory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
