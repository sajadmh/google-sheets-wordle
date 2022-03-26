# [Make a copy of the Google Sheet here!](https://docs.google.com/spreadsheets/d/1QUwNrr4rBDTNcsto9bkQzo58uXjQFm0pp8nv17WFaa8/copy)

<kbd><img src="https://github.com/sajadmh/google-sheets-wordle/blob/main/assets/demo.gif" width="700"></img></kbd>


# Instructions

1. [Make a copy of the spreadsheet linked here](https://docs.google.com/spreadsheets/d/1QUwNrr4rBDTNcsto9bkQzo58uXjQFm0pp8nv17WFaa8/copy).
2. Type in a word in the left field. Entering a valid, 5 letter word based on the list of words in the Settings sheet will reveal the checkbox to submit your guess.
3. Repeat row by row until you get the Wordle.
4. To start a new game, go to the menu and click into **Wordle > Start New Game**.

(For first-time users, starting a new game will require script authorization. When prompted, provide authorization and follow step 4 again.)

# Notes

* Do not type directly into the squares as they contain formulas.
* The script uses onEdit to track any changes to the spreadsheet, and executes the code if the checkbox is clicked.
* If a word shorter or longer than 5 letters is entered and the checkbox is circumvented, the script will reject it.
* Starting a new game from the menu will increment the ID at the top of the Settings by +1, and it will reset all square and keyboard background colors.
* To create a custom list of Wordles, go to Settings and replace the blacked out cells in column C with different words.
* To view the script, go to Extensions > Apps Script or the `code.gs` in this directory.

# Guide

This game utilizes a hybrid of formulas/conditional formatting and Google Apps Script.

We will start by establishing the building blocks:

The **Settings** sheet will hold an ID at the top, representing the current game (i.e. word):

* Each ID corresponds to a word in a list of Wordles.
* A second, longer list of "valid" words is also provided.

The **Play** sheet contains 5 squares, 6 rows, and a mock keyboard:

* On the left side, a box is provided to type into.
* On the right side, a checkbox and formula are provided:
* The formula `=IFERROR(IF(MATCH($C3, {SETTINGS!$C$5:$C;SETTINGS!$G$5:$G}, 0), "←  SUBMIT YOUR ANSWER"), "NOT A VALID WORD")` stipulates that if the guess is valid based on the two word lists in the Settings, it will return "SUBMIT YOUR ANSWER", otherwise if the guess is invalid, it will return "NOT A VALID WORD".
* Conditional formatting determines when the checkbox is unhidden, based on if the submission is 5 letters long: `=LEN($C3)<>5`.
* The checkbox remains hidden if the formula returns "NOT A VALID WORD".

The **Menu** provides an option to start a new game, which resets the sheet from all text and colors, and increments the ID at the top of the Settings by +1.

The **Apps Script** does everything else.

----

First create the menu item through the UI `SpreadsheetApp.getUi()`:

```js
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('► Wordle ◄')
    .addItem('🔄  Start New Game', 'newGame')
    .addToUi();
}
```

The function `newGame` referenced above resets the sheet and moves on to the next Wordle by incrementing the ID:

```js
function newGame() {
  ...
}
```

First, we clear the guesses written in column C:

```js
var inputRange = play.getRange('C3:C13');
inputRange.clearContent();
```

We unchecked the checkboxes in column BE:

```js
var checkBoxRange = play.getRange('BE3:BE13');
var checkBoxValues = checkBoxRange.getValues();

for (var i = 0; i < checkBoxValues.length; i++) {
  for (var j = 0; j < checkBoxValues[i].length; j++) {
    if (checkBoxValues[i][j] == true) {
      checkBoxValues[i][j] = false;
    }
  }
}
checkBoxRange.setValues(checkBoxValues);
```

We reset the squares and keyboard keys of all their color:

```js
var allRows = play.getRangeList(["K3", "T3", "AC3", "AL3", "AU3", "K5", "T5", "AC5", "AL5", "AU5", "K7", "T7", "AC7", "AL7", "AU7", "K9", "T9", "AC9", "AL9", "AU9", "K11", "T11", "AC11", "AL11", "AU11", "K13", "T13", "AC13", "AL13", "AU13"]);
allRows.setBackground("#ffffff");
allRows.setFontColor("#000000");

var allKeys = play.getRangeList(["G17","AK19","Y19","S17","P15","Y17","AE17","AK17","AT15","AQ17","AW17","BC17","AW19","AQ19","AZ15","BF15","D15","V15","M17","AB15","AN15","AE19","J15","S19","AH15","M19"]);
allKeys.setBackground("#d3d6da");
allKeys.setFontColor("#000000");
```

Then, the ID value in the Settings, column C, row 2 will be incremented by one:

```js
var idRange = settings.getRange("C2");
var currentId = idRange.getDisplayValues();
idRange.setValue(parseInt(currentId) + 1);
```

This makes up the newGame function.

**Finally, we get into the Wordle function:**

We start with an onEdit function:

```js
function onEdit(e) {
  ...
}
```

Because we want the script to check if the checkbox has been clicked, we want to gather which row has been checked off (out of the 6). We will store this detail in `var index`. We also want to specify that the checkbox being checked off is in column BE/#57, where the checkboxes sit.

```js
var index = e.range.getRow();
var checkboxColumnInt = 57;
```

With these two details, we will refer to the checkbox that is checked off onEdit as `var runBox`:

`var runBox = play.getRange(index, checkboxColumnInt);`

The entire function is then based on three `if` statements. The first two:


```js
if (e.range.getColumn() == checkboxColumnInt) {
  if (runBox.isChecked() == true) {
  }
}
```

Ensures that the checkbox that was checked off onEdit is located in column BE/#57, and that the checkbox in question has been made true (as opposed to made false, i.e. unchecked). 

If the above operations are true, we will execute more code, getting the row's guess and converting it to an array in all lowercase, then checking if it is exactly 5 characters with one more nested `if` statement:

```js
var guessString = play.getRange("C" + index).getDisplayValue().toLowerCase(); //.substring(0, 5) can split result
var guessArray = guessString.split("");

  if (guessArray.length == 5) {
    ...
  } else {
    ss.toast("Guess must be exactly 5 letters. Try again!");
  }
```

If the length of the guess is other than 5 characters, it triggers a toast.

If the guess is 5 characters, we want to get the Wordle, compare it with the `guessArray` and fill the squares and keyboard keys with the correct colors.

To get the Wordle, first we get the ID, i.e. the current game, in the Settings in cell C2, then we will search the range of IDs corresponding to their Wordles (B5:B) with a `for` loop, and offset one cell to the right once we find the ID to get the Wordle as a string in all lowercase.

```js
var idRange = settings.getRange("C2");
var currentId = idRange.getDisplayValues();
var searchIdRange = settings.getRange("B5:B").getValues();
var wordPosition;
var count = 4; //ID ranges start from row 5

for (var i = 0; i < searchIdRange.length; i++) {
  count += 1;
  if (searchIdRange[i][0] == currentId) {
    wordPosition = "B" + count;
    break;
  }
}

var currentWordle = settings.getRange("" + wordPosition + "").offset(0, 1).getDisplayValue().toLowerCase();
```

Next, we will create an array of objects to represent each letter in the current guess. Along with each letter from the guess, we will designate the "fill" that determines if the letter from the guess is an exact match by index, valid for being in the Wordle, or completely invalid: green, yellow, gray.

`row = [];` creates an empty array that will hold all the objects (i.e. letters + their fill).

Then, three forEach functions will (1) add objects to the empty array `row` starting by designating all fills as "invalid", (2) iterate over each object and determine if a letter is a "match" -- if so, replace "invalid" with "match", and (3) iterate over each object and determine if a letter is "valid" -- if so, replace "invalid" with a "valid". All invalids will otherwise remain invalid.

(1) We access the guess that was submitted through its `guessArray`, take each element (letter) from the array (5 letters in total), and push 5 objects in total to the `row` empty array:

```js
guessArray.forEach(i => {
  row.push({
    letter: i,
    fill: "invalid"
  });
});
```

This would result in something like this:

`user's guess: CRANE`

`var guessArray = ['c', 'r', 'a', 'n', 'e']`

`row = [ [letter: c, fill: invalid], [letter: r, fill: invalid], [letter: a, fill: invalid], [letter: n, fill: invalid], [letter: e, fill: invalid] ]`


(2) Then, we will access this newly created `row` array of objects. We will check each letter and compare it to the Wordle string, `currentWordle`, utilizing the `forEach` `index` that check if there is an exact letter match in an exact position/index match.

If the guess is `CRANE` and we are in position 2, we are accessing the "A" in `CR[A]NE`. If the Wordle is `TRAIN`, then the `currentWordle[index]` would result in a match for `CR[A]NE` and `TR[A]IN`, as both letters match in the same position.

This will replace the `fill` from "invalid" to "match" and then remove the letter from the `var currentWordle` by replacing it with a `0` so that it can no longer be considered "valid" in the next forEach function.

```js
row.forEach((i, index) => {
  if (i.letter == currentWordle[index]) {
    i.fill = "match";
    currentWordle = currentWordle.replace(i.letter, "0");
  }
});
```

All matches will become `0`s, so guess `CRANE` for Wordle `TRAIN` would revise the `currentWordle` var to `T00IN` since the "RA" were exact matches.

(3) This will allow the next `forEach` function to see if a letter simply exists (is included) in the Wordle, but are not a position match. We check if the guess letter exists in the `currentWordle` var with `.includes(i.letter)` - `i.letter` referencing the current `letter` of the current object in the `row` array that we are iterating over.

```js
row.forEach((i) => {
  if (i.fill != "match" && currentWordle.includes(i.letter)) {
    i.fill = "valid";
    currentWordle = currentWordle.replace(i.letter, "0");
  }
});
```

Finally, we will loop through the spreadsheet row's squares and set a background color for each square. If the first object in the `row` array is a match, the first square will turn green. If it's valid, it will turn yellow. If it's invalid, it will turn gray.

Due to the spreadsheet's design, the squares go from column K to column AU. There are 9 columns we need to jump from square to square, going from left to right.

First, we will initialize `var y = 0` so that we offset +9 horizontally across the sheet and halt the loop once we reach 36 columns (5 squares) across.

We will use a `while` loop to ensure that keep y at a maximum of 36, as we start from 0 and go to 36, which are five jumps across.

we will also use forEach to go through the `row` array of objects. For each object we access, we will check its `letter` and search for that letter in the `keyboard` var, which is an array that points each letter in the mock keyboard to the appropriate cell:

```js
var keyboard = [{letter: "a", cell: "G17"}, 
                {letter: "b", cell: "AK19"}, 
                {letter: "c", cell: "Y19"}, 
                {letter: "d", cell: "S17"}, 
                {letter: "e", cell: "P15"}, 
                {letter: "f", cell: "Y17"}, 
                {letter: "g", cell: "AE17"}, 
                {letter: "h", cell: "AK17"}, 
                {letter: "i", cell: "AT15"}, 
                {letter: "j", cell: "AQ17"}, 
                {letter: "k", cell: "AW17"}, 
                {letter: "l", cell: "BC17"}, 
                {letter: "m", cell: "AW19"}, 
                {letter: "n", cell: "AQ19"}, 
                {letter: "o", cell: "AZ15"}, 
                {letter: "p", cell: "BF15"}, 
                {letter: "q", cell: "D15"}, 
                {letter: "r", cell: "V15"}, 
                {letter: "s", cell: "M17"}, 
                {letter: "t", cell: "AB15"}, 
                {letter: "u", cell: "AN15"}, 
                {letter: "v", cell: "AE19"}, 
                {letter: "w", cell: "J15"}, 
                {letter: "x", cell: "S19"}, 
                {letter: "y", cell: "AH15"}, 
                {letter: "z", cell: "M19"}];
``` 

This will allow us to set a color for each key that we need to in the keyboard, based on the letters provided in the array of objects.

Then, we will check the `fill` for each object. If it is a "match", we will set the background color of the current square we are iterating over to green.

If the `fill` is "valid" then we will set it to yellow, but we must check if the keyboard is already green, meaning in a previous guess this letter might have been a match, but now it's moved to the wrong spot in the new guess. We want to keep the keyboard green in this case. In this logic, a "match" supersedes a valid.

Last, if the `fill` is "invalid", this time we will check if the letter in the keyboard is either green or yellow already. If so, it will only set the square to gray, but keep the keyboard as-is. This is to ensure that a letter in the keyboard is not made gray when it might have been green or yellow because it was used prior, such as in the word "DEEDS". The first "E" might be green, but the second "E" might be invalid, as the Wordle is "GEARS", and only the first "E" in the guess is correct. The keyboard should turn green, and once traversing over the second "E" it sets the square to gray as it should, but does not color over the keyboard key that should be green.

```js
var squareOne = play.getRange("K3");
var y = 0;

while (y <= 36) {
  row.forEach((i) => {

    letter = i.letter;
    let key = keyboard.find(key => key.letter == letter).cell;

    if (i.fill == "match") {
      squareOne.offset(offsetIndex, y).setBackground("#6aaa64");
      squareOne.offset(offsetIndex, y).setFontColor("#ffffff");
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

...
```
