import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, MicOff, Square, Play, Pause, Trash2, RotateCcw, 
  Sparkles, Award, AlertCircle, Volume2, BookOpen, 
  FileText, Clock, HelpCircle, Check, Info, ChevronRight, 
  Bookmark, PlayCircle, Star, Sparkle
} from 'lucide-react';
import AssessmentScorecard from './AssessmentScorecard';

interface SpeakingPracticeProps {
  testId?: string;
  testTitle?: string;
  cueCardTopic?: string;
}

interface SavedAttempt {
  id: string;
  date: string;
  audioUrl: string;
  transcript: string;
  durationSeconds: number;
  wordCount: number;
  fillerCount: number;
  wpm: number;
  tempoStatus: 'Slow' | 'Optimal' | 'Fast';
}

export default function SpeakingPractice({
  testId = 'custom_speaking',
  testTitle = 'Speaking Assessment',
  cueCardTopic = 'Describe a historical building or heritage structure you visited. You should say: where it is, what it looks like, what you did there, and explain why you think it is important.'
}: SpeakingPracticeProps) {
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Web Speech & MediaRecorder references
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Audio elements & Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Live audio visualization heights (for beautiful visual waves)
  const [visualizerHeights, setVisualizerHeights] = useState<number[]>(Array.from({ length: 24 }, () => 8));
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  // Saved Attempts state
  const [attempts, setAttempts] = useState<SavedAttempt[]>(() => {
    const saved = localStorage.getItem(`speaking_attempts_${testId}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Current selected historical attempt for playback review
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

  // IELTS speaking analysis computations
  const wordCount = transcript.trim() === '' ? 0 : transcript.trim().split(/\s+/).length;
  
  // Detect IELTS filler words
  const detectFillers = (text: string) => {
    const fillers = ['um', 'uh', 'ah', 'like', 'basically', 'actually', 'you know'];
    const lowerText = text.toLowerCase();
    let count = 0;
    fillers.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) count += matches.length;
    });
    return count;
  };

  const fillerCount = detectFillers(transcript);
  const wpm = recordingSeconds > 0 ? Math.round((wordCount / recordingSeconds) * 60) : 0;
  
  const getTempoStatus = (currentWpm: number): 'Slow' | 'Optimal' | 'Fast' => {
    if (currentWpm === 0) return 'Optimal';
    if (currentWpm < 110) return 'Slow';
    if (currentWpm > 165) return 'Fast';
    return 'Optimal';
  };

  const tempoStatus = getTempoStatus(wpm);

  // Check SpeechRecognition support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSimulationMode(true);
    }
    return () => {
      cleanupAudio();
    };
  }, []);

  const cleanupAudio = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
    }
  };

  // Recording timer tick
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Handle Playback audio timing & state sync
  useEffect(() => {
    const player = audioPlayerRef.current;
    if (!player) return;

    const handleTimeUpdate = () => {
      setCurrentTime(player.currentTime);
    };

    const handleLoadedMetadata = () => {
      setAudioDuration(player.duration || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    player.addEventListener('timeupdate', handleTimeUpdate);
    player.addEventListener('loadedmetadata', handleLoadedMetadata);
    player.addEventListener('ended', handleEnded);

    return () => {
      player.removeEventListener('timeupdate', handleTimeUpdate);
      player.removeEventListener('loadedmetadata', handleLoadedMetadata);
      player.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl, selectedAttemptId]);

  // Start Real Microphone and Transcriber
  const startRecording = async () => {
    setErrorMessage(null);
    setTranscript('');
    setRecordingSeconds(0);
    setAudioUrl(null);
    setSelectedAttemptId(null);
    audioChunksRef.current = [];

    if (isSimulationMode) {
      startSimulatedRecording();
      return;
    }

    try {
      // 1. Setup Media Stream for Audio recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => {
        throw new Error('Microphone permission denied or blocked by browser frame restrictions. Switching to simulation mode.');
      });

      // 2. Setup AudioAnalyser for Visual representation
      setupAudioAnalyser(stream);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Stop all tracks in stream
        stream.getTracks().forEach(track => track.stop());
      };

      // 3. Setup Web Speech API Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setTranscript((prev) => prev + finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage('Speech recognition permission denied.');
        }
      };

      recognitionRef.current = recognition;

      // Start recording & transcription
      mediaRecorder.start();
      recognition.start();
      setIsRecording(true);

    } catch (err: any) {
      console.warn(err.message);
      setErrorMessage(err.message);
      setIsSimulationMode(true);
      // Fallback to Simulation Mode seamlessly
      startSimulatedRecording();
    }
  };

  // Audio Context Visualizer Hookup
  const setupAudioAnalyser = (stream: MediaStream) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      
      source.connect(analyser);
      analyser.fftSize = 64;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;

      const drawWave = () => {
        if (!analyserRef.current || !dataArrayRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        
        // Map frequencies to height bounds [4, 45]
        const heights = Array.from(dataArrayRef.current).slice(0, 24).map(val => {
          const numVal = Number(val);
          return Math.max(4, Math.min(48, Math.round((numVal / 255) * 44) + 4));
        });
        
        // Padding if shorter than 24
        while (heights.length < 24) heights.push(4);
        
        setVisualizerHeights(heights);
        animationFrameRef.current = requestAnimationFrame(drawWave);
      };

      drawWave();
    } catch (e) {
      console.warn('Could not initialize web audio context analyzer, using simulated wave heights', e);
    }
  };

  // Playback simulated waveform update
  const animateSimulatedWave = () => {
    if (!isRecording) return;
    setVisualizerHeights(Array.from({ length: 24 }, () => Math.floor(Math.random() * 32) + 6));
    animationFrameRef.current = requestAnimationFrame(animateSimulatedWave);
  };

  // Simulate Recording (useful for testing when browser permissions are sandbox-blocked)
  const startSimulatedRecording = () => {
    setIsRecording(true);
    setTranscript('');
    setRecordingSeconds(0);
    setAudioUrl(null);
    
    // Simulate real-time wave heights
    animationFrameRef.current = requestAnimationFrame(function loop() {
      setVisualizerHeights(Array.from({ length: 24 }, () => Math.floor(Math.random() * 38) + 6));
      animationFrameRef.current = requestAnimationFrame(loop);
    });

    // Simulate progressive transcript typing
    const textSnippets = [
      "Well, regarding a historical building, ",
      "I would like to describe the ancient Taj Mahal, located in Agra, India. ",
      "It is an absolute architectural marvel made of gorgeous white marble. ",
      "I visited it last autumn with my family, and I was genuinely mesmerized. ",
      "Actually, we spent about four hours exploring the gardens, you know, ",
      "and capturing breathtaking photos. It was constructed by Emperor Shah Jahan in memory of his favorite wife. ",
      "Essentially, it stands as a sublime symbol of historical love, and of course, cultural heritage."
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < textSnippets.length) {
        setTranscript((prev) => prev + textSnippets[index]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 4500);

    // Keep reference to clear on stop
    (recognitionRef as any).current = {
      stop: () => clearInterval(interval)
    };
  };

  // Stop Recording (both real and simulated)
  const stopRecording = () => {
    setIsRecording(false);
    cleanupAudio();

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (isSimulationMode) {
      // Set a mock audio URL so they can click and listen to a premium sample playback
      // We will use an elegant default audio track or mock experience
      setAudioUrl('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
    }
  };

  // Cancel Recording without saving
  const cancelRecording = () => {
    setIsRecording(false);
    cleanupAudio();
    setTranscript('');
    setRecordingSeconds(0);
    setAudioUrl(null);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Custom Audio player triggers
  const togglePlayPlayback = () => {
    const player = audioPlayerRef.current;
    if (!player) return;

    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.playbackRate = playbackSpeed;
      player.play().catch(e => console.warn('Audio playback failed', e));
      setIsPlaying(true);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.playbackRate = speed;
    }
  };

  // Reset progress and play from start
  const handleResetPlayback = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.currentTime = 0;
      setCurrentTime(0);
      if (!isPlaying) {
        audioPlayerRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  // Save the recorded attempt locally
  const saveAttempt = () => {
    if (!audioUrl) return;

    const newAttempt: SavedAttempt = {
      id: `attempt_${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      audioUrl: audioUrl,
      transcript: transcript || 'No transcribed speech captured.',
      durationSeconds: recordingSeconds,
      wordCount: wordCount,
      fillerCount: fillerCount,
      wpm: wpm,
      tempoStatus: tempoStatus
    };

    const updated = [newAttempt, ...attempts];
    setAttempts(updated);
    localStorage.setItem(`speaking_attempts_${testId}`, JSON.stringify(updated));
    setSelectedAttemptId(newAttempt.id);
  };

  // Delete saved attempt
  const deleteAttempt = (id: string) => {
    const updated = attempts.filter(a => a.id !== id);
    setAttempts(updated);
    localStorage.setItem(`speaking_attempts_${testId}`, JSON.stringify(updated));
    if (selectedAttemptId === id) {
      setSelectedAttemptId(null);
      setAudioUrl(null);
    }
  };

  // Select older attempt for review
  const selectAttemptForReview = (attempt: SavedAttempt) => {
    setSelectedAttemptId(attempt.id);
    setAudioUrl(attempt.audioUrl);
    setTranscript(attempt.transcript);
    setRecordingSeconds(attempt.durationSeconds);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-5 text-left" id="speaking-practice-component">
      {/* Hidden native audio element */}
      {audioUrl && (
        <audio 
          ref={audioPlayerRef} 
          src={audioUrl} 
          preload="auto"
        />
      )}

      {/* 1. Header showing Speaking Cue Card Card */}
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2 text-left relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-rose-50 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center gap-2">
          <span className="p-1 bg-rose-100 text-rose-700 rounded-md">
            <BookOpen className="h-3.5 w-3.5" />
          </span>
          <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">IELTS Part 2 Cue Card Topic</span>
        </div>
        <p className="text-xs font-semibold text-gray-800 leading-relaxed bg-white/70 backdrop-blur-xs p-3 rounded-xl border border-gray-150/40">
          "{cueCardTopic}"
        </p>
        <div className="flex items-center gap-3 text-[10px] text-gray-400 font-medium pl-1">
          <span>● Speaking Target: 1 to 2 minutes</span>
          <span>● Preparation Time: 1 minute</span>
        </div>
      </div>

      {/* Sandbox mode notice / Web Speech mode */}
      {isSimulationMode && !errorMessage && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-50/50 border border-amber-100 rounded-xl text-[10px] text-amber-800 font-medium">
          <Info className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
          <span>IFrame sandboxing detected: Using high-fidelity Web Speech & Audio simulator mode.</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50/50 border border-red-100 rounded-xl text-[10px] text-red-800 font-medium">
          <AlertCircle className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />
          <span>Microphone access unavailable or blocked: {errorMessage}. Running simulator instead.</span>
        </div>
      )}

      {/* 2. Primary Speaking Stage */}
      <div className="bg-white border border-gray-150/80 rounded-2xl p-5 shadow-sm space-y-5">
        
        {/* Visualizer and Controller Panel */}
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          
          {/* Visual Waveform */}
          <div className="flex items-end justify-center gap-1.5 h-14 w-full max-w-xs px-2 border-b border-gray-100 pb-2">
            {visualizerHeights.map((h, index) => (
              <motion.div
                key={index}
                animate={{ height: isRecording ? h : 6 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className={`w-1 rounded-full transition-all ${
                  isRecording 
                    ? 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.2)]' 
                    : isPlaying
                      ? 'bg-blue-500'
                      : 'bg-gray-200'
                }`}
                style={{ height: '6px' }}
              />
            ))}
          </div>

          {/* Time & State Label */}
          <div className="text-center space-y-1">
            <span className="text-2xl font-black font-mono tracking-tight text-gray-800">
              {formatTime(recordingSeconds)}
            </span>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
              {isRecording 
                ? 'RECORDING ACTIVE • SPEECH API TRANSCRIBING' 
                : audioUrl 
                  ? 'RECORDING COMPLETE • READY TO REVIEW' 
                  : 'READY TO RECORD RESPONSE'}
            </p>
          </div>

          {/* Primary Action Button Bar */}
          <div className="flex items-center gap-3">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex items-center justify-center h-14 w-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-100 active:scale-95 transition-all"
                title="Start Recording"
              >
                <Mic className="h-6 w-6" />
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={cancelRecording}
                  className="flex items-center justify-center h-10 w-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 active:scale-95 transition-all"
                  title="Cancel Recording"
                >
                  <RotateCcw className="h-4.5 w-4.5" />
                </button>
                
                <button
                  onClick={stopRecording}
                  className="flex items-center justify-center h-14 w-14 rounded-full bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-200 animate-pulse active:scale-95 transition-all"
                  title="Stop and Save"
                >
                  <Square className="h-5 w-5 fill-current text-white" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Live Transcript / Speech to text Preview Area */}
        {transcript && (
          <div className="space-y-1.5 text-left">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <FileText className="h-3.5 w-3.5 text-gray-500" />
              <span>Speech-to-Text Live Transcript</span>
            </span>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 max-h-36 overflow-y-auto text-xs leading-relaxed text-gray-700 font-sans">
              {transcript}
              {isRecording && <span className="inline-block w-1.5 h-3.5 ml-1 bg-rose-500 animate-pulse rounded" />}
            </div>
          </div>
        )}

        {/* Player Review Component (Only if recording exists) */}
        {audioUrl && !isRecording && (
          <div className="bg-gray-50/60 rounded-xl p-4 border border-gray-150 space-y-3.5 text-left">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Candidate Audio Review</span>
            
            {/* Playback player tracks */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlayPlayback}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white hover:bg-gray-800 shadow-sm transition-all flex-shrink-0"
              >
                {isPlaying ? <Pause className="h-4.5 w-4.5 fill-current" /> : <Play className="h-4.5 w-4.5 fill-current" />}
              </button>

              <div className="flex-1 space-y-1">
                {/* Track progress */}
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden relative cursor-pointer" onClick={(e) => {
                  if (audioPlayerRef.current) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const percent = (e.clientX - rect.left) / rect.width;
                    audioPlayerRef.current.currentTime = percent * audioDuration;
                  }
                }}>
                  <div 
                    className="h-full bg-rose-500 rounded-full transition-all duration-100" 
                    style={{ width: `${audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0}%` }} 
                  />
                </div>
                
                <div className="flex justify-between items-center text-[9px] text-gray-400 font-mono font-bold">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(audioDuration || recordingSeconds)}</span>
                </div>
              </div>
            </div>

            {/* Speeds controller */}
            <div className="flex items-center justify-between border-t border-gray-150/50 pt-2.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Speed:</span>
                {[0.8, 1.0, 1.25, 1.5].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    className={`px-2 py-1 text-[9px] font-bold font-mono rounded-md border transition-all ${
                      playbackSpeed === speed
                        ? 'bg-rose-50 border-rose-200 text-rose-700'
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>

              {/* Action buttons to save attempt or retry */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetPlayback}
                  className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
                  title="Replay from start"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                
                {!selectedAttemptId && (
                  <button
                    onClick={saveAttempt}
                    className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-bold shadow-sm transition-all"
                  >
                    <Bookmark className="h-3 w-3" />
                    <span>Save Attempt</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Real-time speech analytics dashboard (WPM, Hesitations, Tempo) */}
        {wordCount > 0 && (
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="bg-gray-50/50 rounded-xl p-2.5 border border-gray-100 text-left">
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">Speech Rate</span>
              <span className="text-sm font-black text-gray-800 font-mono">{wpm} <span className="text-[9px] font-semibold text-gray-400">WPM</span></span>
              <span className={`text-[8px] font-bold uppercase block mt-0.5 ${
                tempoStatus === 'Optimal' ? 'text-emerald-600' : 'text-amber-500'
              }`}>{tempoStatus} Tempo</span>
            </div>

            <div className="bg-gray-50/50 rounded-xl p-2.5 border border-gray-100 text-left">
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">Word Count</span>
              <span className="text-sm font-black text-gray-800 font-mono">{wordCount}</span>
              <span className="text-[8px] font-bold text-gray-400 uppercase block mt-0.5">Academic Words</span>
            </div>

            <div className="bg-gray-50/50 rounded-xl p-2.5 border border-gray-100 text-left">
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">Filler Words</span>
              <span className={`text-sm font-black font-mono ${fillerCount > 4 ? 'text-amber-600' : 'text-emerald-600'}`}>{fillerCount}</span>
              <span className="text-[8px] font-bold text-gray-400 uppercase block mt-0.5">Um / Ah / Like</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Official 4-Criteria Speaking Assessment Scorecard */}
      <div className="pt-2">
        <AssessmentScorecard
          module="speaking"
          editable={true}
          studentSubmissionText={transcript}
        />
      </div>

      {/* 4. attempts History Section */}
      {attempts.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Saved Practice History</span>
            <span className="text-[9px] text-gray-400 font-mono font-medium">{attempts.length} Attempt{attempts.length > 1 ? 's' : ''} saved</span>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto">
            {attempts.map((item) => (
              <div
                key={item.id}
                onClick={() => selectAttemptForReview(item)}
                className={`flex flex-col text-left p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedAttemptId === item.id
                    ? 'border-rose-600 bg-rose-50/10 shadow-xs'
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-gray-400 uppercase font-mono">{item.date}</span>
                    <h5 className="text-[11px] font-bold text-gray-800 line-clamp-1">{item.transcript}</h5>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                      {formatTime(item.durationSeconds)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAttempt(item.id);
                      }}
                      className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      title="Delete attempt"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-2 text-[9px] text-gray-400 border-t border-gray-50 pt-2 font-mono">
                  <span>WPM: <strong className="text-gray-700 font-bold">{item.wpm}</strong></span>
                  <span>Fillers: <strong className={item.fillerCount > 4 ? 'text-amber-600' : 'text-emerald-600 font-bold'}>{item.fillerCount}</strong></span>
                  <span>Tempo: <strong className={item.tempoStatus === 'Optimal' ? 'text-emerald-600' : 'text-amber-500'}>{item.tempoStatus}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
