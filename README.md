# [Make a copy of the Google Sheet here!](https://docs.google.com/spreadsheets/d/1QUwNrr4rBDTNcsto9bkQzo58uXjQFm0pp8nv17WFaa8/copy)

<kbd><img src="https://github.com/sajadmh/google-sheets-wordle/blob/main/assets/demo.gif" width="800"></img></kbd>


# Instructions

1. [Make a copy of the spreadsheet linked here](https://docs.google.com/spreadsheets/d/1QUwNrr4rBDTNcsto9bkQzo58uXjQFm0pp8nv17WFaa8/copy)
2. From the menu, click into **Wordle > Install Game > Run Me Twice**
3. [When prompted, give the script authorization to run](https://support.google.com/cloud/answer/7454865)
4. After authorizing, follow step 2 again to successfully install the onEdit trigger
5. You should be ready to play the game!

# Tips

* To start a new game with a new word, go to the menu, click into Wordle > Start New Game
* This will increment ID by one to move to the next word and will reset the guesses, squares and keyboard backgrounds
* To create a custom list of words, go to Settings and replace the blacked out cells in column C with different words
* To view the script, go to Extensions > Apps Script

# Guide

This game utilizes conditional formatting and formulas to split a guess into each square, and to unhide a checkbox if a guess is five letters long.

With a menu feature, a Settings sheet containing a list of words and a corresponding ID, along with an array of objects to compare the guess with the actual Wordle, we can create our own version all within Google Sheets.

First, create a menu item through the UI utilizin `SpreadsheetApp.getUi()`:

```
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('► Wordle ◄')
    .addItem('🔄  Start New Game', 'newGame')
    .addSeparator()
    .addSubMenu(SpreadsheetApp.getUi().createMenu('Install Game')
      .addItem('🔛  Run Me Twice', 'createOnEditTrigger'))
    .addToUi();
}
```

In the menu, one feature will reset the game and move on to the next Wordle.
The other feature will be used for installing the onEdit trigger that looks out for a user's click of a checkbox.

We will create a function to get the current ID in the Settings sheet in cell C2. This is the ID that references the current game/word:

```
function getId() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var settings = ss.getSheetByName("SETTINGS");
  var idRange = settings.getRange("C2");
  var idValue = idRange.getDisplayValues();
  return idValue;
}
```

Then we will cerate a `function newGame() { ... }` that will start a new game, removing the guesses and background colors by accessing each square and setting to white:

```
var allRows = play.getRangeList(["K3", "T3", "AC3", "AL3", "AU3", "K5", "T5", "AC5", "AL5", "AU5", "K7", "T7", "AC7", "AL7", "AU7", "K9", "T9", "AC9", "AL9", "AU9", "K11", "T11", "AC11", "AL11", "AU11", "K13", "T13", "AC13", "AL13", "AU13"]);
allRows.setBackground("#FFFFFF");
```

We will also access the "keyboard" and reset each bacakground:

```
var allKeys = play.getRangeList(["G17","AK19","Y19","S17","P15","Y17","AE17","AK17","AT15","AQ17","AW17","BC17","AW19","AQ19","AZ15","BF15","D15","V15","M17","AB15","AN15","AE19","J15","S19","AH15","M19"]);
allKeys.setBackground("#D3D6DA");
allKeys.setFontColor("#000000");
```

A `for loop` will uncheck each checkbox (in column BE, rows 3 through 13) that was checked off by the user when submitting their guess:

```
var checkBoxRange = ss.getRange('BE3:BE13');
var checkBoxValues = checkBoxRange.getValues();
for (var i = 0; i < checkBoxValues.length; i++) {
  for (var j = 0; j < checkBoxValues[i].length; j++) {
    if (checkBoxValues[i][j] == true) {
      checkBoxValues[i][j] = false;
    }
  }
}
```

We will also clear the user's words/guesses in the left column:

```
var inputRange = ss.getRange('C3:C13');
inputRange.clearContent();
```

Then get the current ID in Settings C2, and increment it by one:

```
var currentId = getId();
idRange.setValue(parseInt(currentId) + 1);
```

**Finally, we get into the Wordle function!**

When a user checks the checkbox to submit their guess, we must get the checkbox's row and create an array to store each of the five letters in their guess, e.g. `CRANE` -> `[C,R,A,N,E]`.

`var index = e.range.getRow();` gets the current row.

`var checkboxColumnInt = 57;` refers to the column where the checkboxes sit.

`var runBox = play.getRange(index, checkboxColumnInt);` refers to the specific checkbox that was checked off.

Two if statements will check our operation before doing anything. The first ensures that the checkbox that is checked off is an official checkbox in column BE/#57.
If true, then it will check if the edit (based on the onEdit trigger) turned the checkbox to true (in other words, we ensure that the user checked the box, not unchecked the box):

```
if (e.range.getColumn() == checkboxColumnInt) {
  if (runBox.isChecked() == true) {
    ...
  }
}
```

If both if statements above are true (the checkbox is checked true in column 57), first we will get the current Wordle and then compare the user's guess against it:

`var currentId = getId();` gets the ID at the top in the Settings sheet (cell C2).

`var searchIdRange = settings.getRange("B5:B").getValues();` scans the column of IDs in the Settings sheet.

The following finds the current game ID in the list of IDs, starting from row 5.

It will loop through the list of IDs, and once it finds it, will set the `var wordPosition` to the cell where the ID and Wordle answer sits.

For example, if the current game ID is `11`, the for loop will find ID `11` in cell `B15`, setting `wordPosition = B15`.

With the ID cell position, we will find the `currentWord` by getting the range `B15` and offsetting to the right by one to access cell `C15` to `getDisplayValue()`, which is the Wordle as a string.

Then, we will convert the wordle to all lowercase (just in case). `currentWordString` contains the current Wordle answer.


```
var wordPosition;
var count = 4; //ID ranges start from row 5

for (var i = 0; i < searchIdRange.length; i++) {
  count += 1;
    if (searchIdRange[i][0] == currentId) {
      wordPosition = "B" + count;
      break;
    }
}

var currentWord = settings.getRange("" + wordPosition + "").offset(0, 1).getDisplayValue();
var currentWordString = currentWord.toLowerCase();
```

To get the row's guess, we get the current index (provided by the current checkbox edit) and add the number `C`. Convert the guess to all lowercase, and then split to create an array out of the string.

```
var guessString = play.getRange("C" + index).getDisplayValue().toLowerCase();
var guessArray = guessString.split("");
```

Next, we will create an array of objects. Each object will contain one of the letters from the guess for the current round, along with a "fill" that designates whether the background color should be green/yellow/grey. The designations are match, valid, and invalid.

`row = [];` creates an empty array that will hold all the objects (i.e. letters + their status).
`var wordle = currentWordString;` calls on the current Wordle answer and duplicates it, as we will iterate over `wordle` and remove matches.

Three `forEach` functions will add to the `row` array, and then declare whether a letter is valid or a match.

The first function will access the current guess `guessArray` and add each element/letter from the `guessArray` to the `row` array as `letter` and set each object `fill` as `invalid` by default.

```
guessArray.forEach(i => {
  row.push({
    letter: i,
    fill: "invalid"
  });
});
```

Then, we will access the newly completed `row` array of objects. With forEach, we will check each letter in each object and compare each letter against the `wordle` string, comparing against the current `forEach` index (not to be confused with the previously declared index). The current index is the current object being scanned. If the guess is `CRANE` and we are in position 2, we are accessing the "A" in `CR[A]NE` which is position 2. If the Wordle is `TRAIN`, then the  `wordle[index]` would match `CR[A]NE` and `TR[A]IN`, as both letters match in the same position.

If it is an exact letter and position match, we will replace the current object's `fill` from `invalid` to `match` then remove said letter from the `wordle` by replacing it with a `0` so that it can no longer be considered "valid" in the next forEach function.

```
row.forEach((i, index) => {
  if (i.letter == wordle[index]) {
    i.fill = "match";
    wordle = wordle.replace(i.letter, "0");
  }
});
```

In this forEach function, we check validity. All matches will become `0`s, so guess `CRANE` for Wordle `TRAIN` would revise the `wordle` var to `T00IN` since the "RA" were exact matches.

When we check for validity, we first want to ensure that we won't replace a `fill` that has been designated a `match`. We will also check if the `wordle` `T00IN` includes each letter in `CRANE`. In this example, "N" from `CRANE` is valid when searching the `wordle` `T00IN`. It's not an exact match, i.e. in the wrong position, but a correct letter and is designated a `valid` `fill`.

```
row.forEach((i) => {
  if (i.fill != "match" && wordle.includes(i.letter)) {
    i.fill = "valid";
    wordle = wordle.replace(i.letter, "0");
  }
});
```

Finally, we will loop through the current row's squares and set a background color for each square. If object 0 in the `row` array is a match, the first square will turn green. If it's valid, it will turn yellow. If it's invalid, it will turn gray.

Due to the spreadsheet's design, the squares go from column K to column AU. There are 9 columns we need to jump from square to square, going from left to right.

First, we will create initialize `var y = 0` so that we offset +9 horizontally across the sheet and halt the loop once we reach 36 columns (5 squares) across.

Within the `while` loop, we will also use forEach to go through the `row` array of objects. For each object we access, we will check its letter and find the cell for that letter in the keyboard mockup in a `var keyboard` array that we have created that points each letter to the appropriate cell in the keyboard.

If the `fill` in the object of the `row` array is a `match`, we will set the background color of the current square we are iterating over to green. If the `fill` is `valid` then we will set it to yellow, but we must check if the keyboard is already green, meaning in a previous guess this letter was a match, but now it's moved to the wrong spot in the new guess. We will keep the keyboard green, but set the square yellow, so a match supersedes a valid. Last, we will check if the `fill` is `invalid`, first checking if the letter in the keyboard is either green or yellow. If so, it will only set the square to gray, but keep the keyboard as-is. Per iteration, we add 9 to `var y` to end the operation at 36, or 5 squares total.


```
var y = 0;

while (y <= 36) {
  row.forEach((i) => {

    letter = i.letter;
    let key = keyboard.find(key => key.letter == letter).cell;

    if (i.fill == "match") {
      squareOne.offset(offsetIndex, y).setBackground("#6aaa64");
      squareOne.offset(offsetIndex, y).setFontColor("#FFFFFF");
      play.getRange(key).setBackground("#6aaa64");
      play.getRange(key).setFontColor("#ffffff");
    } else if (i.fill == "valid") {
      if (play.getRange(key).getBackground() == "#6aaa64") {
        squareOne.offset(offsetIndex, y).setBackground("#c9b458");
        squareOne.offset(offsetIndex, y).setFontColor("#ffffff");
      } else {
        squareOne.offset(offsetIndex, y).setBackground("#c9b458");
        squareOne.offset(offsetIndex, y).setFontColor("#ffffff");
        play.getRange(key).setBackground("#c9b458");
        play.getRange(key).setFontColor("#ffffff");
      }
    } else if (i.fill == "invalid") {
      if (play.getRange(key).getBackground() == "#6aaa64" || play.getRange(key).getBackground() == "#c9b458") {
        squareOne.offset(offsetIndex, y).setBackground("#787c7e");
        squareOne.offset(offsetIndex, y).setFontColor("#ffffff");
      } else {
        squareOne.offset(offsetIndex, y).setBackground("#787c7e");
        squareOne.offset(offsetIndex, y).setFontColor("#ffffff");
        play.getRange(key).setBackground("#787c7e");
        play.getRange(key).setFontColor("#ffffff");
      }
    }

    y += 9;

  });
}
```
