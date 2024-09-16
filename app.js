const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let isPlaying = false;
let sources = [];
let audioBuffers = {}; // 各音素のWAVファイルをキャッシュ

// 音素と対応するWAVファイルのマッピング
const phonemeMap = {
  'あ': 'utau_samples/a.wav',
  'い': 'utau_samples/i.wav',
  'う': 'utau_samples/u.wav',
  'え': 'utau_samples/e.wav',
  'お': 'utau_samples/o.wav',
  'か': 'utau_samples/ka.wav',
  'き': 'utau_samples/ki.wav',
   'く': 'utau_samples/ku.wav',
   'け': 'utau_samples/ke.wav',
   'こ': 'utau_samples/ko.wav',
   'さ': 'utau_samples/sa.wav',
   'し': 'utau_samples/si.wav',
   'す': 'utau_samples/su.wav',
   'せ': 'utau_samples/se.wav',
   'そ': 'utau_samples/so.wav',
   'た': 'utau_samples/ta.wav',
   'ち': 'utau_samples/ti.wav',
   'つ': 'utau_samples/tu.wav',
   'て': 'utau_samples/te.wav',
   'と': 'utau_samples/to.wav',
   'な': 'utau_samples/na.wav',
   'に': 'utau_samples/ni.wav',
   'ぬ': 'utau_samples/nu.wav',
   'ね': 'utau_samples/ne.wav',
   'の': 'utau_samples/no.wav',
   'は': 'utau_samples/ha.wav',
   'ひ': 'utau_samples/hi.wav',
   'ふ': 'utau_samples/hu.wav',
   'へ': 'utau_samples/he.wav',
   'ほ': 'utau_samples/ho.wav',
   'ま': 'utau_samples/ma.wav',
   'み': 'utau_samples/mi.wav',
   'む': 'utau_samples/mu.wav',
   'め': 'utau_samples/me.wav',
   'も': 'utau_samples/mo.wav',
  
  
  
　
  // 他の50音もここに追加
};

// WAVファイルを読み込む
async function loadSample(phoneme) {
  if (audioBuffers[phoneme]) {
    return audioBuffers[phoneme];
  }

  try {
    const response = await fetch(phonemeMap[phoneme]);
    if (!response.ok) {
      throw new Error(`Failed to load ${phonemeMap[phoneme]}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    audioBuffers[phoneme] = audioBuffer; // キャッシュに保存
    return audioBuffer;
  } catch (error) {
    console.error('Error loading sample:', error);
    return null;
  }
}

// 音素を結合して再生する
async function playSequence(phonemes) {
  if (isPlaying) return; // 既に再生中の場合は無視

  isPlaying = true;
  let currentTime = audioContext.currentTime; // 現在のオーディオコンテキスト時間を取得

  for (const phoneme of phonemes) {
    if (phonemeMap[phoneme]) {
      const buffer = await loadSample(phoneme); // 音素に対応するWAVファイルをロード
      if (buffer) {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);

        // 適切なタイミングで音声を再生
        source.start(currentTime);
        sources.push(source);

        // 次の音素の再生開始時間を計算
        currentTime += buffer.duration;
      }
    }
  }

  // 全ての再生が終了したらフラグを戻す
  const lastSource = sources[sources.length - 1];
  if (lastSource) {
    lastSource.onended = () => {
      isPlaying = false;
    };
  } else {
    isPlaying = false; // 何も再生しなかった場合のため
  }
}

// 再生を停止する
function stopSound() {
  sources.forEach(source => source.stop(0)); // 全てのソースを停止
  sources = []; // ソースリストをリセット
  isPlaying = false;
}

// 初期化
window.addEventListener('load', () => {
  const playButton = document.getElementById('playButton');
  const stopButton = document.getElementById('stopButton');
  const phonemeInput = document.getElementById('phonemeInput');

  // 再生ボタンのクリック処理
  playButton.addEventListener('click', () => {
    const phonemeString = phonemeInput.value.trim(); // 入力された音素を取得
    if (phonemeString) {
      const phonemes = phonemeString.split(''); // 音素ごとに分割
      playSequence(phonemes); // 音素列を再生
    }
  });

  // 停止ボタンのクリック処理
  stopButton.addEventListener('click', stopSound);

  // 簡単なピアノロールを描画
  const canvas = document.getElementById('pianoCanvas');
  const ctx = canvas.getContext('2d');

  function drawPianoRoll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(100, 50, 20, 20); // 音符のブロックを描画
    ctx.fillRect(200, 50, 20, 20);
    ctx.fillRect(300, 50, 20, 20);
  }

  drawPianoRoll();
});
