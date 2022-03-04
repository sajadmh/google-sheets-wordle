function onInstall(e) {
  onOpen(e);
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('► Wordle ◄')
    .addItem('🔄  Start New Game', 'newGame')
    .addSeparator()
    .addSubMenu(SpreadsheetApp.getUi().createMenu('Install Game')
      .addItem('🔛  Run Me Twice', 'createOnEditTrigger'))
    .addToUi();
}

/**
 * Gets the current ID.
 * Represents the current game.
 */
function getId() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var settings = ss.getSheetByName("SETTINGS");
  var idRange = settings.getRange("C2");
  var idValue = idRange.getDisplayValues();
  return idValue;
}

/**
 * Reset all colored squares.
 */
function newGame() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var play = ss.getSheetByName("PLAY");
  var allRows = play.getRangeList(["K3", "T3", "AC3", "AL3", "AU3", "K5", "T5", "AC5", "AL5", "AU5", "K7", "T7", "AC7", "AL7", "AU7", "K9", "T9", "AC9", "AL9", "AU9", "K11", "T11", "AC11", "AL11", "AU11", "K13", "T13", "AC13", "AL13", "AU13"]);
  allRows.setBackground("#FFFFFF");

  var allKeys = play.getRangeList(["G17","AK19","Y19","S17","P15","Y17","AE17","AK17","AT15","AQ17","AW17","BC17","AW19","AQ19","AZ15","BF15","D15","V15","M17","AB15","AN15","AE19","J15","S19","AH15","M19"]);
  allKeys.setBackground("#D3D6DA");
  allKeys.setFontColor("#000000");

  var checkBoxRange = ss.getRange('BE3:BE13');
  var checkBoxValues = checkBoxRange.getValues();
  for (var i = 0; i < checkBoxValues.length; i++) {
    for (var j = 0; j < checkBoxValues[i].length; j++) {
      if (checkBoxValues[i][j] == true) {
        checkBoxValues[i][j] = false;
      }
    }
  }

  var inputRange = ss.getRange('C3:C13');
  inputRange.clearContent();

  checkBoxRange.setValues(checkBoxValues);
  allRows.setFontColor("#000000");

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var settings = ss.getSheetByName("SETTINGS");
  var idRange = settings.getRange("C2");
  var currentId = getId();
  idRange.setValue(parseInt(currentId) + 1);
}

/**
 * Play Wordle.
 * If guessArray == wordArray, toast "Nice!"
 * Add menu item to iterate to next game and reset board.
 */
function playWordle(e) {

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var settings = ss.getSheetByName("SETTINGS");
  var play = ss.getSheetByName("PLAY");
  var squareOne = play.getRange("K3");

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

  var index = e.range.getRow();
  var offsetIndex = index - 3;

  var checkboxColumnInt = 57;

  /**
   * Checks if the checkbox is in column 57.
   * If checkbox if checked/made true on edit, it runs the following code.
   */
  var runBox = play.getRange(index, checkboxColumnInt);

  if (e.range.getColumn() == checkboxColumnInt) {
    if (runBox.isChecked() == true) {

      /**
       * Gets the current game's word by searching the range of IDs and offsetting to get the word as an array "currentWordArray".
       */
      var currentId = getId();
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

      var currentWord = settings.getRange("" + wordPosition + "").offset(0, 1).getDisplayValue();
      var currentWordString = currentWord.toLowerCase();

      /**
       * Gets the row of letters as "guessArray" by accessing each letter from each square and pushing to an array. Slow.
       */
      /*
      var guessArrayRaw = new Array();
      guessArrayRaw.push(squareOne.offset(offsetIndex, 0).getDisplayValue());
      guessArrayRaw.push(squareOne.offset(offsetIndex, 9).getDisplayValue());
      guessArrayRaw.push(squareOne.offset(offsetIndex, 18).getDisplayValue());
      guessArrayRaw.push(squareOne.offset(offsetIndex, 27).getDisplayValue());
      guessArrayRaw.push(squareOne.offset(offsetIndex, 36).getDisplayValue());

      var guessArray = guessArrayRaw.map(function(v) {
        return v.toLowerCase();
      });
      */

      /**
       * Gets the row of letters as "guessArray" by getting the guess entered in column C. Converts to an array.
       */
      var guessString = play.getRange("C" + index).getDisplayValue().toLowerCase();
      var guessArray = guessString.split("");

      /**
       * Creates an array of objects containing each row letter with a designation.
       * Designations include:
       * match = guess letter is found and in correct position compared to Wordle
       * valid = guess letter is found but in wrong position
       * invalid = letter not found in Wordle
       * 
       * All letters are defaulted to invalid and compared to the current Wordle letter by letter and given a value in the object.
       */
      row = [];
      var wordle = currentWordString;

      //set invalid for all objects
      guessArray.forEach(i => {
        row.push({
          letter: i,
          fill: "invalid"
        });
      });

      //if object letter matches current Wordle index, replace invalid with match
      //if a match, replace the letter with a zero to no longer consider it
      row.forEach((i, index) => {
        if (i.letter == wordle[index]) {
          i.fill = "match";
          wordle = wordle.replace(i.letter, "0");
        }
      });

      //if object letter is included in the Wordle (after checking for matches and replacing matches with 0), replace invalid with valid
      row.forEach((i) => {
        if (i.fill != "match" && wordle.includes(i.letter)) {
          i.fill = "valid";
          wordle = wordle.replace(i.letter, "0");
        }
      });

      //otherwise, all remaining objects must remain invalid since match and validity are not true

      //console.log("row[]: " + JSON.stringify(row));


      /**
       * Create a while loop to iterate over all five squares for the current row number (index), with y initially set to 0.
       * Increment y by 9 at a cap of 36, offsetting horizontlaly from the square in column K to the square in column AU.
       * Loop through the array of objects ("row") and for each element, check the "fill".
       * The while loop ends when y hits 36, i.e. all 5 squares are iterated over.
       */
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
          }

          else if (i.fill == "valid") {
            if (play.getRange(key).getBackground() == "#6aaa64") {
              squareOne.offset(offsetIndex, y).setBackground("#c9b458");
              squareOne.offset(offsetIndex, y).setFontColor("#ffffff");
            } else {
              squareOne.offset(offsetIndex, y).setBackground("#c9b458");
              squareOne.offset(offsetIndex, y).setFontColor("#ffffff");
              play.getRange(key).setBackground("#c9b458");
              play.getRange(key).setFontColor("#ffffff");
            }
          }

          else if (i.fill == "invalid") {
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
    }
  }
}

/**
 * Creates an on edit trigger for easy install in the menu.
 */
function createOnEditTrigger(e) {
  var triggers = ScriptApp.getProjectTriggers();
  var shouldCreateTrigger = true;

  triggers.forEach(function(trigger) {
    if (trigger.getEventType() === ScriptApp.EventType.ON_EDIT && trigger.getHandlerFunction() === "playWordle") {
      shouldCreateTrigger = false;
    }
  });

  if (shouldCreateTrigger) {
    ScriptApp.newTrigger("playWordle").forSpreadsheet(SpreadsheetApp.getActive()).onEdit().create();
  }
}
