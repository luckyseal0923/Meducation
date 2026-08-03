const bank = [
  ['anatomy','Study of body structure'],['abdomen','Belly region between chest and pelvis'],['allergy','Immune reaction to a substance'],['analgesia','Pain relief'],['anemia','Low red blood cell condition'],
  ['antibody','Protein that recognizes an antigen'],['antibiotic','Drug used against bacteria'],['anticoagulant','Drug that prevents clotting'],['artery','Blood vessel carrying blood away from heart'],['asthma','Chronic airway narrowing condition'],
  ['atrium','Upper chamber of the heart'],['bacteria','Single-celled microorganisms'],['bandage','Material used to cover a wound'],['bladder','Organ that stores urine'],['blood','Fluid that circulates through vessels'],
  ['bone','Hard tissue forming the skeleton'],['brain','Organ that controls the nervous system'],['bronchus','Large airway leading to a lung'],['cancer','Disease of uncontrolled cell growth'],['cardiac','Relating to the heart'],
  ['catheter','Flexible tube placed in the body'],['cell','Basic unit of life'],['chest','Area between neck and abdomen'],['clinic','Place for medical care'],['colon','Large intestine'],
  ['cortex','Outer layer of an organ'],['cranium','Bony case protecting the brain'],['diagnosis','Identification of a disease'],['diaphragm','Main muscle of breathing'],['disease','Illness that affects the body'],
  ['doctor','Licensed medical professional'],['dose','Measured amount of medicine'],['edema','Swelling caused by fluid'],['embryo','Early stage of development'],['enzyme','Protein that speeds a reaction'],
  ['femur','Thigh bone'],['fever','Elevated body temperature'],['fracture','Broken bone'],['gene','Unit of inherited information'],['gland','Organ that releases substances'],
  ['heart','Organ that pumps blood'],['hormone','Chemical messenger in the body'],['hospital','Facility providing inpatient care'],['immunity','Ability to resist infection'],['infection','Invasion by microorganisms'],
  ['injection','Medicine given with a needle'],['intestine','Long digestive tube'],['kidney','Organ that filters blood'],['liver','Organ that processes nutrients and toxins'],['lung','Organ used for breathing'],
  ['lymph','Fluid of the immune system'],['marrow','Soft tissue inside bone'],['medicine','Substance used to treat illness'],['muscle','Tissue that contracts for movement'],['nerve','Structure carrying signals'],
  ['neuron','Nerve cell'],['organ','Group of tissues with a function'],['oxygen','Gas needed by most body cells'],['pancreas','Organ making insulin and enzymes'],['patient','Person receiving medical care'],
  ['pelvis','Lower part of the trunk'],['plasma','Liquid part of blood'],['platelet','Blood cell fragment for clotting'],['pulse','Rhythmic beat felt in an artery'],['renal','Relating to the kidney'],
  ['retina','Light-sensitive layer at back of eye'],['rib','Curved bone protecting the chest'],['serum','Clear liquid remaining after clotting'],['skeleton','Framework of bones'],['skin','Outer protective body covering'],
  ['skull','Bones enclosing the brain'],['spine','Column of vertebrae'],['spleen','Organ that filters blood'],['stomach','Organ that digests food'],['surgery','Treatment using an operation'],
  ['symptom','Sign of a health problem'],['tendon','Tissue attaching muscle to bone'],['therapy','Treatment intended to improve health'],['throat','Passage behind mouth and nose'],['tissue','Group of similar body cells'],
  ['trachea','Windpipe carrying air to lungs'],['tumor','Abnormal mass of tissue'],['ultrasound','Imaging using sound waves'],['urine','Liquid waste made by kidneys'],['vaccine','Preparation that trains immunity'],
  ['vein','Blood vessel returning blood to heart'],['ventricle','Lower chamber of the heart'],['virus','Tiny infectious agent'],['vision','Ability to see'],['vitamin','Nutrient needed in small amounts'],
  ['wound','Injury that breaks the skin'],['xray','Image made using radiation'],['biopsy','Sample of tissue for examination'],['diabetes','Disease involving high blood sugar'],['glucose','A simple blood sugar'],
  ['insulin','Hormone that lowers blood sugar'],['lesion','Area of damaged tissue'],['nausea','Feeling that you may vomit'],['obesity','Excess body fat'],['pharmacy','Place where medicines are dispensed']
].map(([answer, clue]) => ({ answer: answer.toUpperCase(), clue }));

const boardSize = 15;
let words = [], cells = {}, wordCells = {}, selected, focusInput;
const grid = document.querySelector('#grid');
const message = document.querySelector('#message');

function shuffle(items) {
  return [...items].sort(() => Math.random() - .5);
}

function key(row, col) {
  return row + '-' + col;
}

function positions(word) {
  return Array.from(word.answer, (letter, index) => ({
    row: word.row + (word.dir === 'down' ? index : 0),
    col: word.col + (word.dir === 'across' ? index : 0),
    letter,
  }));
}

function canPlace(word, placed, board) {
  const pos = positions(word);
  if (pos.some(({ row, col }) => row < 0 || col < 0 || row >= boardSize || col >= boardSize)) return false;
  let crossings = 0;
  for (const cell of pos) {
    const existing = board[key(cell.row, cell.col)];
    if (existing && existing.letter !== cell.letter) return false;
    if (existing) crossings++;
  }
  if (placed.length && !crossings) return false;
  for (const cell of pos) {
    if (board[key(cell.row, cell.col)]) continue;
    for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const neighbor = board[key(cell.row + dr, cell.col + dc)];
      const isPartOfNewWord = pos.some(item => item.row === cell.row + dr && item.col === cell.col + dc);
      if (neighbor && !isPartOfNewWord) return false;
    }
  }
  return true;
}

function addWord(word, board) {
  positions(word).forEach(cell => {
    const id = key(cell.row, cell.col);
    if (!board[id]) board[id] = { letter: cell.letter, wordIds: [] };
    board[id].wordIds.push(word.id);
  });
}

function candidatePlacements(word, placed, board) {
  const choices = [];
  for (const other of placed) {
    if (other.dir === word.dir) continue;
    positions(other).forEach(existing => {
      [...word.answer].forEach((letter, index) => {
        if (letter !== existing.letter) return;
        const candidate = {
          ...word,
          dir: other.dir === 'across' ? 'down' : 'across',
          row: existing.row - (other.dir === 'across' ? index : 0),
          col: existing.col - (other.dir === 'down' ? index : 0),
        };
        if (canPlace(candidate, placed, board)) choices.push(candidate);
      });
    });
  }
  return choices;
}

function createPuzzle() {
  for (let attempt = 0; attempt < 160; attempt++) {
    const pool = shuffle(bank).slice(0, 10).map((item, index) => ({ ...item, id: index + 1 }));
    const board = {};
    const first = pool[0];
    first.dir = 'across';
    first.row = Math.floor(boardSize / 2);
    first.col = Math.floor((boardSize - first.answer.length) / 2);
    const placed = [first];
    addWord(first, board);
    let remaining = pool.slice(1);
    while (remaining.length) {
      const options = remaining.flatMap(word => candidatePlacements(word, placed, board));
      if (!options.length) break;
      const next = options[Math.floor(Math.random() * options.length)];
      addWord(next, board);
      placed.push(next);
      remaining = remaining.filter(word => word.id !== next.id);
    }
    if (placed.length === 10) return { placed, board };
  }
  return null;
}

function clearMarks() {
  document.querySelectorAll('.cell').forEach(cell => cell.classList.remove('good', 'bad', 'current'));
}

function renderPuzzle() {
  const puzzle = createPuzzle();
  if (!puzzle) {
    message.className = 'message error';
    message.textContent = 'Unable to create a puzzle. Please try a new quiz.';
    return;
  }
  words = puzzle.placed.sort((a, b) => a.id - b.id);
  cells = puzzle.board;
  wordCells = {};
  words.forEach(word => wordCells[word.id] = positions(word).map(({ row, col }) => key(row, col)));
  grid.innerHTML = '';
  grid.style.gridTemplateColumns = 'repeat(' + boardSize + ', 1fr)';
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const id = key(row, col), info = cells[id];
      const cell = document.createElement('div');
      cell.className = 'cell' + (info ? ' active' : '');
      if (info) {
        const number = document.createElement('span');
        number.className = 'number';
        number.textContent = Math.min(...info.wordIds);
        const input = document.createElement('input');
        input.maxLength = 1;
        input.autocomplete = 'off';
        input.inputMode = 'text';
        input.dataset.key = id;
        input.setAttribute('aria-label', 'crossword letter');
        input.addEventListener('focus', () => selectCell(id));
        input.addEventListener('input', event => {
          event.target.value = event.target.value.toUpperCase().replace(/[^A-Z]/g, '');
          moveNext(id);
          updateProgress();
        });
        input.addEventListener('keydown', onKey);
        cell.append(number, input);
      }
      grid.append(cell);
    }
  }
  renderClues();
  updateProgress();
  selectWord(words[0], false);
  message.textContent = '';
}

function renderClues() {
  ['across', 'down'].forEach(direction => document.querySelector('#' + direction).innerHTML = '');
  words.forEach(word => {
    const button = document.createElement('button');
    button.className = 'clue';
    button.dataset.id = word.id;
    button.innerHTML = '<b>' + word.id + '</b><span>' + word.clue + ' <small>(' + word.answer.length + ')</small></span>';
    button.addEventListener('click', () => selectWord(word));
    document.querySelector('#' + word.dir).append(button);
  });
}

function selectWord(word, shouldFocus = true) {
  selected = word;
  document.querySelectorAll('.clue').forEach(item => item.classList.toggle('selected', Number(item.dataset.id) === word.id));
  document.querySelectorAll('.cell').forEach(item => item.classList.remove('current'));
  wordCells[word.id].forEach(id => document.querySelector('[data-key="' + id + '"]').parentElement.classList.add('current'));
  if (shouldFocus) {
    focusInput = document.querySelector('[data-key="' + wordCells[word.id][0] + '"]');
    focusInput.focus();
  }
}

function selectCell(id) {
  const choices = cells[id].wordIds.map(wordId => words.find(word => word.id === wordId));
  if (!choices.some(word => word.id === selected.id)) selectWord(choices[0], false);
}

function moveNext(id) {
  const index = wordCells[selected.id].indexOf(id);
  if (index >= 0 && index < wordCells[selected.id].length - 1) {
    document.querySelector('[data-key="' + wordCells[selected.id][index + 1] + '"]').focus();
  }
}

function onKey(event) {
  const id = event.target.dataset.key;
  const index = wordCells[selected.id].indexOf(id);
  if (event.key === 'Backspace' && !event.target.value && index > 0) {
    event.preventDefault();
    document.querySelector('[data-key="' + wordCells[selected.id][index - 1] + '"]').focus();
  }
  if ((event.key === 'ArrowRight' || event.key === 'ArrowDown') && index < wordCells[selected.id].length - 1) {
    event.preventDefault();
    document.querySelector('[data-key="' + wordCells[selected.id][index + 1] + '"]').focus();
  }
  if ((event.key === 'ArrowLeft' || event.key === 'ArrowUp') && index > 0) {
    event.preventDefault();
    document.querySelector('[data-key="' + wordCells[selected.id][index - 1] + '"]').focus();
  }
}

function updateProgress() {
  let completed = 0;
  words.forEach(word => {
    const value = wordCells[word.id].map(id => document.querySelector('[data-key="' + id + '"]').value).join('');
    if (value === word.answer) completed++;
  });
  document.querySelector('#progressText').textContent = completed + ' / 10';
  document.querySelector('#score').textContent = completed + ' / 10';
  document.querySelector('#progressBar').style.width = completed * 10 + '%';
}

document.querySelector('#check').addEventListener('click', () => {
  let correct = 0;
  words.forEach(word => {
    let completed = true;
    wordCells[word.id].forEach((id, index) => {
      const input = document.querySelector('[data-key="' + id + '"]');
      const valid = input.value === word.answer[index];
      input.parentElement.classList.remove('good', 'bad');
      if (input.value) input.parentElement.classList.add(valid ? 'good' : 'bad');
      if (!valid) completed = false;
    });
    if (completed) correct++;
  });
  updateProgress();
  message.className = 'message' + (correct === 10 ? '' : ' error');
  message.textContent = correct === 10 ? 'Excellent! You completed all 10 terms.' : correct + ' / 10 words are correct. Review the highlighted letters.';
});

document.querySelector('#hint').addEventListener('click', () => {
  for (let index = 0; index < selected.answer.length; index++) {
    const input = document.querySelector('[data-key="' + wordCells[selected.id][index] + '"]');
    if (!input.value) {
      input.value = selected.answer[index];
      input.parentElement.classList.add('good');
      message.className = 'message';
      message.textContent = 'One letter was revealed for Question ' + selected.id + '.';
      break;
    }
  }
  updateProgress();
});

document.querySelector('#reset').addEventListener('click', () => {
  document.querySelectorAll('.cell input').forEach(input => input.value = '');
  clearMarks();
  message.textContent = '';
  updateProgress();
  selectWord(words[0]);
});

document.querySelector('#newQuiz').addEventListener('click', renderPuzzle);
renderPuzzle();
