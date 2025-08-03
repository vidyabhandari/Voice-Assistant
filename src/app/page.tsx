'use client';

import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const sttWorkerRef = useRef<Worker | null>(null);
  const ttsWorkerRef = useRef<Worker | null>(null);
  const [transcript, setTranscript] = useState('');
  const [reply, setReply] = useState<string>('');
  const [timing, setTiming] = useState({
    stt: 0,
    llm: 0,
    tts: 0,
    total: 0,
  });

  useEffect(() => {
    const start = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      // Workers should be loaded from the public directory
      sttWorkerRef.current = new Worker('/workers/sttWorker.js');
      ttsWorkerRef.current = new Worker('/workers/ttsWorker.js'); // Fix: Corrected path and file name

      recorder.ondataavailable = (e) => {
        const t0 = performance.now();
        sttWorkerRef.current?.postMessage(e.data);
        (sttWorkerRef.current as any).startTime = t0;
      };

      sttWorkerRef.current.onmessage = async (e: MessageEvent) => {
        const sttEnd = performance.now();
        const t0 = (sttWorkerRef.current as any).startTime;
        const sttTime = sttEnd - t0;

        // Use optional chaining for safer access
        const result = e.data?.text || e.data?.error || '';
        const prompt = typeof result === 'string' ? result : JSON.stringify(result);
        
        setTranscript(prompt);
        const llmStart = performance.now();

        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
          });

          const llmEnd = performance.now();
          const data = await res.json();
          const llmTime = llmEnd - llmStart;

          (ttsWorkerRef.current as any).startTime = llmEnd;

          if (!res.ok || data?.error) {
            const errorMsg = data?.error?.message || data?.error?.toString() || 'Unknown error from LLM';
            console.error('LLM Error:', JSON.stringify(data, null, 2));
            setReply(`Error: ${errorMsg}`);
          } else {
            setReply(data.reply);
            ttsWorkerRef.current?.postMessage(data.reply);
          }

          setTiming(prev => ({
            ...prev,
            stt: parseFloat(sttTime.toFixed(2)),
            llm: parseFloat(llmTime.toFixed(2)),
          }));
        } catch (err: any) {
          console.error('Fetch error:', err.message);
          setReply(`Fetch error: ${err.message}`);
        }
      };

      ttsWorkerRef.current.onmessage = async (e: MessageEvent) => {
        const ttsEnd = performance.now();
        const ttsStart = (ttsWorkerRef.current as any).startTime || ttsEnd;
        const ttsTime = ttsEnd - ttsStart;

        const totalTime = ttsEnd - (sttWorkerRef.current as any).startTime;

        const { audioData } = e.data;
        const context = new AudioContext();

        try {
          if (context.state === 'suspended') await context.resume();

          let bufferData: ArrayBuffer;

          if (audioData instanceof Blob) {
            bufferData = await audioData.arrayBuffer();
          } else if (audioData instanceof ArrayBuffer) {
            bufferData = audioData;
          } else if (audioData?.buffer instanceof ArrayBuffer) {
            bufferData = audioData.buffer;
          } else {
            throw new Error('Unsupported audioData format');
          }

          const buffer = await context.decodeAudioData(bufferData);
          const source = context.createBufferSource();
          source.buffer = buffer;
          source.connect(context.destination);
          source.start();
        } catch (err) {
          console.error('TTS playback error:', err);
        }

        setTiming(prev => ({
          ...prev,
          tts: parseFloat(ttsTime.toFixed(2)),
          total: parseFloat(totalTime.toFixed(2)),
        }));
      };

      recorder.start(3000); // 3-second chunks
    };

    start();
  }, []);

  return (
    <main>
      <h1>🎙️ Voice Assistant</h1>
      <p><strong>You said:</strong> {transcript}</p>
      <p><strong>Assistant replied:</strong> {reply}</p>

      <div style={{ marginTop: '1rem' }}>
        <h2>⏱️ Timing (ms)</h2>
        <p><strong>STT:</strong> {timing.stt}</p>
        <p><strong>LLM:</strong> {timing.llm}</p>
        <p><strong>TTS:</strong> {timing.tts}</p>
        <p><strong>Total:</strong> {timing.total}</p>
      </div>
    </main>
  );
}