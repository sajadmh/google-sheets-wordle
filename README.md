Play Wordle on Google Sheets with Google Apps Script!


# [Make a copy of the Google Sheet here!](https://docs.google.com/spreadsheets/d/1QUwNrr4rBDTNcsto9bkQzo58uXjQFm0pp8nv17WFaa8/copy)


To view the script, go to Extensions > Apps Script or view the file in the directory.

Instructions:

1. Make a copy of the spreadsheet linked above
2. In the menu, click into Wordle > Install Game > Run Me Twice
3. [Authorize the script in the pop-up](https://support.google.com/cloud/answer/7454865)
4. After authorizing, follow step 2 again to successfully install the onEdit trigger
5. You should be ready to play the game!

Tips:

* To start a new game with a new word, go to the menu, click into Wordle > Start New Game
* This will increment the game into the next word and reset the submissions and colors
* To create a custom list of words, go to Settings and replace the hidden cells in column C


----

# **Guide:**

First, create a menu item through the UI `SpreadsheetApp.getUi()`:

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

One feature will reset the game and move on to the next Wordle.
The other feature will be for installing the onEdit trigger that checks user's guess with the click of a checkbox.

Then, we will create a function to get the current ID in the Settings sheet in cell C2:

```
function getId() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var settings = ss.getSheetByName("SETTINGS");
  var idRange = settings.getRange("C2");
  var idValue = idRange.getDisplayValues();
  return idValue;
}
```

In `function newGame() { ... }` we will access each square and reset the background fill:

```
var allRows = play.getRangeList(["K3", "T3", "AC3", "AL3", "AU3", "K5", "T5", "AC5", "AL5", "AU5", "K7", "T7", "AC7", "AL7", "AU7", "K9", "T9", "AC9", "AL9", "AU9", "K11", "T11", "AC11", "AL11", "AU11", "K13", "T13", "AC13", "AL13", "AU13"]);
allRows.setBackground("#FFFFFF");
```

We will also access the "keyboard" and reset each fill:

```
var allKeys = play.getRangeList(["G17","AK19","Y19","S17","P15","Y17","AE17","AK17","AT15","AQ17","AW17","BC17","AW19","AQ19","AZ15","BF15","D15","V15","M17","AB15","AN15","AE19","J15","S19","AH15","M19"]);
allKeys.setBackground("#D3D6DA");
allKeys.setFontColor("#000000");
```

A `for loop` will uncheck each checkbox (in column BE, rows 3 through 13) that allows the user to submit their guess:

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

We will clear the user's words on the left column:

```
var inputRange = ss.getRange('C3:C13');
inputRange.clearContent();
```

Then get the current ID in Settings C2, and increment it by one:

```
var currentId = getId();
idRange.setValue(parseInt(currentId) + 1);
```

Finally, we get into the Wordle function:

When a user checks the box to submit their guess, we must get the row number and create an array to store each of the five letters in that row:




