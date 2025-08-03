/// <reference lib="webworker" />

import * as ort from 'onnxruntime-web';

let session: ort.InferenceSession | null = null;

async function loadModel() {
  session = await ort.InferenceSession.create('/tts-model/model.onnx');
}

async function synthesize(text: string, session: ort.InferenceSession): Promise<Float32Array> {
  // Basic example — assumes your model accepts a string as input
  const inputTensor = new ort.Tensor('string', [text], [1]);
  const feeds: Record<string, ort.Tensor> = { input: inputTensor };

  const results = await session.run(feeds);
  const output = results[Object.keys(results)[0]];

  return output.data as Float32Array;
}

onmessage = async (e) => {
  const text = e.data;

  try {
    if (!session) {
  await loadModel();
  if (!session) {
    postMessage({ error: 'TTS model failed to load' });
    return;
  }
}
const audioData = await synthesize(text, session);

    self.postMessage({ audioData });
  } catch (error: any) {
    self.postMessage({ error: error.message });
  }
};
