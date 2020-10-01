let input;
let btnAdd;
let btnClear;
let btnRemove;
let btnColor;
let colorPicker;
let clearText;
let info;

$(document).ready()
{
  input = document.getElementById('id-input')
  btnAdd = document.getElementById('add')
  btnClear = document.getElementById('clear');
  btnRemove = document.getElementById('remove');
  btnColor = document.getElementById('color');
  colorPicker = document.getElementById('color-picker');
  clearText = document.getElementById('clear-text');
  info = document.getElementById('info');

  btnColor.style.height = $(btnClear).outerHeight() + 'px';
  get(completedColor, local).then((color) => {

    if (updateColors(color)) {
      btnColor.style.border = '2px solid';
    } else {
      btnColor.style.border = '0';
    }

    colorPicker.value = color;
  });
}

const addInfo = function (str, append) {
  input.value = '';
  if (append) return (info.innerHTML += str + '<br>');
  info.innerHTML = str + '<br>';
};

const resetStorage = function () {
  set(assignments, []);
};

const uploadStorage = async () => {
  let assignmentArray = await get(assignments);

  let duplicateValue = false;

  $.each(assignmentArray, (obj) => {
    if (Number(obj.id) === Number(input.value)) duplicateValue = true;
  });

  if (duplicateValue) return addInfo('No Duplicate Values!', false);

  assignmentArray.push({
    id: Number(input.value),
    name: "",
    description: "Manually Added"
  });

  set(assignments, assignmentArray);
};

btnAdd.addEventListener('click', async () => {
  clearText.innerHTML = '';
  clearCount = 0;

  if (input.value === '') return;
  await uploadStorage();
});

btnRemove.addEventListener('click', async () => {
  if (input.value === '') return;

  let assignmentArray = await get(assignments);

  const newData = assignmentArray.filter(
    (obj) => Number(obj.id) !== Number(input.value)
  );

  if (assignmentArray.length === newData.length)
    return addInfo(`ID Already Removed!`, false);

  set(assignments, assignmentArray);
  addInfo(`Removed ID (${input.value})`, true);
});

let clearCount = 0;

btnClear.addEventListener('click', function () {
  resetStorage();
  clearText.innerHTML =
    clearCount === 0 ? 'Cleared!' : `Cleared ${clearCount + 1} times!`;
  clearCount++;
});

input.addEventListener('click', () => {
  clearText.innerHTML = '';
  clearCount = 0;
});

// Make sure btnColor border-box works (border-box requires defined height)

btnColor.addEventListener('click', () => {
  colorPicker.click();
});

colorPicker.addEventListener('input', () => {
  set(completedColor, colorPicker.value, local);

  if (updateColors(colorPicker.value)) {
    btnColor.style.border = "2px solid";
  } else {
    btnColor.style.border = "0";
  }

  chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {greeting: "color"});
  });
});
