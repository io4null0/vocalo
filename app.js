const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let isPlaying = false;
let source = null;
let audioBuffers = {}; // 各音素のWAVファイルを格納する

// 音素と対応するWAVファイル名のマッピング
const phonemeMap = {
  'a': 'utau_samples/a.wav',
  'i': 'utau_samples/i.wav',
  'u': 'utau_samples/u.wav',
  'e': 'utau_samples/e.wav',
  'o': 'utau_samples/o.wav',
  'ka': 'utau_samples/ka.wav',
  'ki': 'utau_samples/ki.wav',
  // 残りの50音もここに追加
};

// WAVファイルを読み込む
async function loadSample(phoneme) {
  if (audioBuffers[phoneme]) {
    return audioBuffers[phoneme];
  }
  const response = await fetch(phonemeMap[phoneme]);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  audioBuffers[phoneme] = audioBuffer; // キャッシュに保存
  return audioBuffer;
}

// 音声を再生
function playSound(buffer) {
  if (isPlaying) return;

  source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start(0);
  isPlaying = true;

  source.onended = () => {
    isPlaying = false;
  };
}

// 音声を停止
function stopSound() {
  if (source) {
    source.stop(0);
    isPlaying = false;
  }
}

// 初期化
window.addEventListener('load', async () => {
  const phonemeSelector = document.getElementById('phonemeSelector');
  const selectedPhoneme = phonemeSelector.value;

  // 選択された音素を表示
  document.getElementById('selectedPhoneme').textContent = phonemeSelector.options[phonemeSelector.selectedIndex].text;

  // 初期音素をロード
  let audioBuffer = await loadSample(selectedPhoneme);

  // 音素選択時の処理
  phonemeSelector.addEventListener('change', async (event) => {
    const phoneme = event.target.value;
    document.getElementById('selectedPhoneme').textContent = event.target.options[event.target.selectedIndex].text;
    audioBuffer = await loadSample(phoneme);
  });

  // 再生ボタンの処理
  document.getElementById('playButton').addEventListener('click', () => {
    playSound(audioBuffer);
  });

  // 停止ボタンの処理
  document.getElementById('stopButton').addEventListener('click', stopSound);

  // ピアノロールを描画
  const canvas = document.getElementById('pianoCanvas');
  const ctx = canvas.getContext('2d');

  function drawPianoRoll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(100, 50, 20, 20); // シンプルな音符ブロックの描画
    ctx.fillRect(200, 50, 20, 20);
    ctx.fillRect(300, 50, 20, 20);
  }

  drawPianoRoll();
});
