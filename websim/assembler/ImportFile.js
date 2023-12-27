let withComments;
let codeSegmentStart;
let withoutComments = new Array();
let branchDest = new Map();
let valueMapping = new Map();
let lineNumber = 0;
let dataLocation = 0;
let arrayNames = new Array();
let dataValues = new Array();
let varibleNames = new Array();
let printBranch = 0;
let savedInstructions = new Array();
let formattedVariables;
let errorTableCount = 0;

let machineCode = "";

let instructionSet = [
  "NOOP",
  "INPUTC",
  "INPUTCF",
  "INPUTD",
  "INPUTDF",
  "MOVE",
  "LOADI",
  "LOADP",
  "ADD",
  "ADDI",
  "SUB",
  "SUBI",
  "LOAD",
  "LOADF",
  "STORE",
  "STOREF",
  "SHIFTL",
  "SHIFTR",
  "CMP",
  "JUMP",
  "BRE",
  "BRNE",
  "BRG",
  "BRGE",
];

let instructionFormat = [
  "0000_", // NOOP
  "0001_", // INPUTC
  "0001_", // INPUTCF
  "0001_", // INPUTD
  "0001_", // INPUTDF
  "0010_", // MOVE
  "0011_", // LOADI
  "0011_", // LOADP

  "0100_", // ADD
  "0101_", // ADDI
  "0110_", // SUB
  "0111_", // SUBI

  "1000_", // LOAD
  "1001_", // LOADF
  "1010_", // STORE
  "1011_", // STOREF

  "1100_", // SHIFTL
  "1100_", // SHIFTR
  "1101_", // CMP
  "1110_", // JUMP
  "1111_", // BRE_BRZ
  "1111_", // BRNE_BRNZ
  "1111_", // BRG
  "1111_", // BRGE
];



window.onload = function () {
  let fileInput = document.getElementById("fileInput");
  //let fileDisplayArea = document.getElementById('fileDisplayArea');

  fileInput.addEventListener("change", function (e) {
    let file = fileInput.files[0];
   
    sessionStorage.setItem("fileName", file.name);
    let reader = new FileReader();
    document.getElementById("assemblyButton").style.display= "block";
    //Pass each line to the remove comments function
    reader.onload = function (e) {
      //fileDisplayArea.innerText = reader.result;
      let lines = this.result.split("\n");
      removeComments(lines);
    };

    reader.readAsText(file);
  });
};
function findDiff(str1, str2){ 
  let diff= "";
  str2.split('').forEach(function(val, i){
    if (val != str1.charAt(i))
      diff += val ;         
  });
  return diff;
}
//--------------------Below deals with all of the data in the .data portion-----------
/**
 * Finds all the data after .data and passes it to be proccessed
 */
function findDataStart(code) {
  let foundData = false;
  for (let i = 0; i < code.length; i++) {
    lineNumber++;
    let lineRead = code[i];
    lineRead = lineRead.replace(/^\s+|\s+$/g, '');
    
    if (lineRead.localeCompare('.data') == 0) {
      parseDataSegment(code);
      foundData = true;
      break;
    } 
  }
  if(foundData == false){
    alert("Expecting (.data) ");
  }

}

/**
 * Parse the code after data
 */
function parseDataSegment(code) {
  
  for (let i = 0; i < code.length; i++) {
    lineNumber++;
    let asmLine = code[i];
    asmLine = asmLine.replace(/^\s+|\s+$/g, '');
    if (asmLine.localeCompare(".code") == 0) {
      break;
    } else if (asmLine.localeCompare(".data") == 0) {
      continue;
    }
    assignDataVariable(code[i]);
  }
}
/**
 * Setting up the varibles that are contained in data
 *
 */
function assignDataVariable(code) {
  let lineParts = code.split(" "); //Break up the instrcution and get rid of white space
  lineParts = removeEmpty(lineParts);
  let varibleName = lineParts[0];
  valueMapping.set(varibleName, dataLocation);
  let BYTE = lineParts[1];
  if (BYTE.localeCompare("BYTE") == 1) {
    alert("Expected data type BYTE");
  }
  for (let i = 2; i < lineParts.length; i++) {
    let innerString = lineParts[i];
    if (innerString.localeCompare(",") == 0) {
      arrayNames.push(varibleName);
      continue;
    } else if (innerString.localeCompare("?") == 0) {
      dataLocation++;
      dataValues.push(0);
      varibleNames.push(varibleName);
    } else {
      if (!isNaN(innerString)) {
        dataLocation++;
        dataValues.push(innerString);
        varibleNames.push(varibleName);
      } else {
        alert("Expecting numberical value, instead recieved " + innerString);
      }
    }
  }
  if (varibleNames.length > 16) {
    alert("YOU HAVE MORE THAN 16 BYTES IN YOUR DATA SEGMENT!");
  }
}
//------------------------------First run through----------------------------------
/*
 * All lines after .code should start with a jump label (EX:) or opcode.
 * This method creates jump labels while simultaneously checking for incorrect tokens.
 *
 */
function getJumps(withoutComments) {
  let lineCount = 0;
  let codeRead = false;
  let toReturn = new Array();
  let count = 0;
  //Take away tabs
  for(let i =0; i < withoutComments.length; i++){
    withoutComments[i] = withoutComments[i].replace(/\t/g, '');
  }
  
  for (let i = 0; i < withoutComments.length; i++) {
    let line = withoutComments[i];
    if (line.includes(".code")) {
      lineCount = -1;
      codeRead = true;
      toReturn[count] = ".code";
    } else if (line.includes(":")) {
      //Water is warm
      branchDest.set(line.substring(0, line.indexOf(":")), lineCount);
      toReturn[count] = line.substring(line.indexOf(":") + 1, line.length);
    } else {
      if (codeRead) {
        let findOpCode = line.split(" ");
        findOpCode = removeEmpty(findOpCode); //To remove blank spots in array
        let validOpCode = false;
        let validString = false;
        let firstToken = "";
        for (let j = 0; j < findOpCode.length; j++) {
          firstToken = findOpCode[j];
          validString = true;
          for (let k = 0; k < instructionSet.length; k++) {
            if (firstToken.localeCompare(instructionSet[k]) == 0) {
              validOpCode = true;
              break;
            }
          }
        }
        if (!validOpCode && validString) {
          window.alert(
            'Did you forget a colon(:) after your label? Incorrect token "' +
              firstToken +
              '" \n at line "' +
              line +
              '"'
          );
          
        }
      }
      toReturn[i] = line;
    }
    count++;
    lineCount++;
  }
  return toReturn;
}
//-------------------Below is Formatting methods to add spaces and take out blank array spots------
function removeEmpty(instruction) {
  let count = 0;
  let newInstruction = new Array();

  for (let i = 0; i < instruction.length; i++) {
    if (instruction[i] != "") {
      newInstruction[count] = instruction[i];
      count++;
    }
  }
  return newInstruction;
}

/**
 * Logic to remove comments in the array with all the code
 * @param {} lines
 */
function removeComments(lines) {
  for (let line = 0; line < lines.length; line++) {
    lines[line] = lines[line].replace(new RegExp(",", "g"), " , ");
    lines[line] = lines[line].replace("]", " ] ");
    lines[line] = lines[line].replace("[", " [ ");
    lines[line] = lines[line].replace("}", " } ");
    lines[line] = lines[line].replace("{", " { ");
    lines[line] = lines[line].replace(/\+/g, " + ");
    lines[line] = lines[line].replace("-", " - ");
    let curString = lines[line];
    if (curString.startsWith(";")) {
      lines[line] = "";
    } else if (curString.includes(";")) {
      lines[line] = lines[line].substring(0, lines[line].indexOf(";"));
    }
    //console.log(lines[line]);
  }
  withComments = lines;
}
function cleanArray(actual) {
  var newArray = new Array();
  for (var i = 0; i < actual.length; i++) {
    if (actual[i] && actual[i] !== '\r') {  // != ""
      newArray.push(actual[i]);
    }
  }
  return newArray;
}
//----------------------Below is the main methods running everything--------------------
/**
 * Main method - Formats output of the assembly and runs the code through methods
 */
function mainMethod() {
  let arrayCheck = false;
  //Hide file input & buttons
  document.getElementById("inputField").style.display = "none";
  document.getElementById("fileInputButton").style.display = "none";

  document.getElementById("assemblyButton").style.display = "none";
  document.getElementById("banner").innerHTML = "Successfully Assembled";
  document.getElementById("displayAssemblytext").innerHTML =
    "<b>Assembly Code:</b>\n";
  //Show download buttons
  document.getElementById("dropdownMenuButton").style.display = "block";
  document.getElementById("toggleSyntax").style.display = "block";
  document.getElementById("toggleInputFile").style.display = "block";
  document.getElementById("navigateCPU").style.display = "block";

  let count = 0;
  //Remove white spaces
  withoutComments = cleanArray(withComments);
  //console.log(withoutComments);
  withoutComments= withoutComments.filter(e => String(e).trim()); 
  //Run commands to assemble code
  withoutComments = getJumps(withoutComments);
 
  findDataStart(withoutComments);
  parseCodeSegment(withoutComments);
  //console.log(withoutComments);
  //console.log(lineNumber);
  //console.log(machineCode);
  //console.log(codeSegmentStart);
  //console.log(Array.from(branchDest.keys()));
  //console.log(branchDest.values());

  let AssemblyLine = 0;
  let dataLine = 0;
  //fileDisplayArea.innerHTML += "<b>Assembly Code:</b>\n";
  let totalLength = 0;
 
  for (let line = 0; line < withoutComments.length; line++) {
    let eachLine = withoutComments[line].split(" ");
    eachLine = removeEmpty(eachLine);
    
    //Format the array to have 3 parts
    if (eachLine.length > 2) {
      if (eachLine[1].localeCompare("[") == 1) {
        for (let i = 3; i < eachLine.length; i++) {
          if (eachLine[2].localeCompare(",") == 0) {
            eachLine[2] = "";
          }
          eachLine[2] += eachLine[i];
          eachLine[i] = "";
        }
      } else {
        for (let i = 2; i < eachLine.length; i++) {
          if (eachLine[i].localeCompare("]") == 0) {
            eachLine[1] += "]";
            eachLine[i] = "";
            eachLine[i + 1] = "";
            break;
          } else {
            eachLine[1] += eachLine[i];
            eachLine[i] = "";
          }
        }
      }
    }
    //Save instruction for the CPU
    savedInstructions.push(eachLine);
    
    //Place into the table
    eachLine = removeEmpty(eachLine);

    
    

    let x = document.getElementById("assemblyTable").insertRow(line);

    //Add line numbers
    if (eachLine.length == 3) {
      eachLine[3] = eachLine[2];
      eachLine[2] = eachLine[1] + ",";
      eachLine[1] = eachLine[0];
      eachLine[0] = AssemblyLine + "&nbsp &nbsp &nbsp &nbsp";
    } else if (eachLine.length == 2) {
      eachLine[3] = "";
      eachLine[2] = eachLine[1];
      eachLine[1] = eachLine[0];
      eachLine[0] = AssemblyLine+  "&nbsp &nbsp &nbsp &nbsp";
    } else {
      eachLine[3] = "";
      eachLine[2] = "";
      eachLine[1] = eachLine[0];
      eachLine[0] = AssemblyLine + "&nbsp &nbsp &nbsp &nbsp";
    }


    //Data line numbers represent memory location and code is line numbers
    if (line >= codeSegmentStart) {
      AssemblyLine++;
    } else if (line != 0 && line + 1 != codeSegmentStart) {
      let temp = (eachLine[3].match(/,/g) || []).length;

      //Bad fix but if there is commas in data memory second spot take them out
      eachLine[2] = eachLine[2].replace(/,/g,"");
     
      if(totalLength != 0 && arrayCheck == true ){
        temp++; //Add one to everything other than the first since it starts at 0
      }
      //Make line number correspond to data location
      if(temp> 1){
        arrayCheck = true;
        //Starts at 0
        
        totalLength += temp;
        eachLine[0] =  dataLine + "..." + totalLength;
        dataLine = totalLength+1;
      }else{
        totalLength++;
        eachLine[0] = dataLine++ ;
      }
    }else{
      eachLine[0] = "";
    }
    
    //Add branches to line numbers
    let branchNames = Array.from(branchDest.keys());
    let branchNumbers = Array.from(branchDest.values());
    if (line - codeSegmentStart == branchNumbers[printBranch]) {
      eachLine[0] +=
        '<span style="float:right;">' + branchNames[printBranch] + ":</span>";
      printBranch++;
    }

    for (let parts = 0; parts < eachLine.length; parts++) {
      let y = x.insertCell(parts);

      y.innerHTML = eachLine[parts];
      
    }
    
  }

  document.getElementById("displayMachinetext").innerHTML =
    "<b>Machine Code:</b><br>";
  let formatMachine = machineCode.split("\n");
  let spaceing = 0;
  for (
    let line = 0;
    line < formatMachine.length - 1 + codeSegmentStart;
    line++
  ) {
    let x = document.getElementById("machineTable").insertRow(line);
    let y = x.insertCell(0);

    //let z = x.insertCell(1);
    if (line == 0) {
      y.innerHTML =
        '<a type="button" style="text-decoration-line:underline;text-decoration-color: blue;font-weight: bold;"data-toggle="modal" data-target="#myModal">' + "View Data Memory" + "</a>";
    } else if (line + 1 == codeSegmentStart) {
      y.innerHTML = "Instruction Memory:" ;
    } else if (line >= codeSegmentStart) {
      y.innerHTML = formatMachine[spaceing];
      spaceing++;
    } else {
      y.innerHTML = "&emsp;";
    }
  }

  //Save machine code for simulator
  formattedVariables = formatVariables();
  saveData();
  fillDataMemoryTable();
  //console.log(branchDest);
  //console.log(dataValues);
  //console.log(sessionStorage.getItem("fileName"));
  sessionStorage.setItem("savedVariable", formattedVariables);
  console.log( sessionStorage.getItem("savedVariable"));
  
}
function formatInput() {
  let inputP = document.getElementById("textInput");
  let lines = inputP.innerText.split("\n");
  let count = 0;
  removeComments(lines);
  inputP.innerText = "";
  //remove white spaces
  for (let i = 0; i < withComments.length; i++) {
    if (withComments[i] != "") {
      withoutComments[count] = withComments[i];
      count++;
    }
  }
  for (let line = 0; line < withoutComments.length; line++) {
    inputP.innerText += withoutComments[line] + "\n";
  }
}
//Downloadable Files-----------------------------------------------

function downloadAssemblyCode(){
  let element = document.createElement("a");
  let fileName = "AssemblyCode.asm";
  //Convert array into string
  let output = "";
  for(let i = 0; i < withComments.length; i++){
    output += withComments[i] + "\n";
  }
  console.log(withComments);
 
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(output)
  );
  element.setAttribute("download", fileName);
  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function downloadMachineFile() {
  let element = document.createElement("a");
  let fileName = "MachineCode";
  fileName = fileName.split(".")[0];
  fileName += ".asm";
  let tempmachineCode = "";
  //Data memory
  tempmachineCode += "DMEM\n";
  for(let i =0; i < dataValues.length; i++){
    tempmachineCode += convertStringToBinary(dataValues[i]) + "\n";
  }
  tempmachineCode += "\n";
  //Code memory
  tempmachineCode += "IMEM\n";
  tempmachineCode += machineCode;

  
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(tempmachineCode)
  );
  element.setAttribute("download", fileName);
  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function downloadLicense() {
  let element = document.createElement("a");
  let fileName = "license.txt";

  let output = `MIT License

  Copyright (c) 2021 sd
  
  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:
  
  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
  `;

  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(output)
  );
  element.setAttribute("download", fileName);
  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function downloadBiosCodeLow() {
  let element = document.createElement("a");
  let fileName = "BIOS_Hardcoded_Low.v";

  let output = createBIOSCodeLow();

  element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(output)
  );
  element.setAttribute("download", fileName);
  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
  
function downloadBiosCodeHigh() {
  let element = document.createElement("a");
  let fileName = "BIOS_Hardcoded_High.v";

  let output = createBIOSCodeHigh();

  element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(output)
  );
  element.setAttribute("download", fileName);
  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function downloadUserCodeLow() {
  let element = document.createElement("a");
  let fileName = "User_Code_Low.v";
  let output = createUserCodeLow();

  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(output)
  );
  element.setAttribute("download", fileName);
  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function downloadUserCodeHigh() {
  let fileName = "User_Code_High.v";
  let element = document.createElement("a");
 
  let output = createUserCodeHigh();

  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(output)
  );
  element.setAttribute("download", fileName);
  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function downloadData(){
  let fileName = "User_Data.v";
  let element = document.createElement("a");
 
  let output = createUserData();

  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(output)
  );
  element.setAttribute("download", fileName);
  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

//------------------------------Instrcutions--------------------------------------------------

function parseNOOP() {
  machineCode += "00_00_00000000";
  machineCode += "\n";
}
function parseADD(code) {
  machineCode += getRegisterName(code[1]);
  getComma(code[2]);
  machineCode += getRegisterName(code[3]);
  machineCode += "00000000";
  machineCode += "\n";
}
function parseADDI(code) {
  machineCode += getRegisterName(code[1]);
  getComma(code[2]);
  machineCode += "00_";
  let immediateValue = code[3];
  checkImmediateValueOutOfBounds(immediateValue);
  machineCode += convertStringToBinary(immediateValue);
  machineCode += "\n";
}
function parseSUB(code) {
  machineCode += getRegisterName(code[1]);
  getComma(code[2]);
  machineCode += getRegisterName(code[3]);
  machineCode += "00000000";
  machineCode += "\n";
}
function parseSUBI(code) {
  machineCode += getRegisterName(code[1]);
  getComma(code[2]);
  machineCode += "00_";
  let immediateValue = code[3];
  checkImmediateValueOutOfBounds(immediateValue);
  machineCode += convertStringToBinary(immediateValue);
  machineCode += "\n";
}
function parseINPUT(code) {
  machineCode += getRegisterName(code[1]);
  getComma(code[2]);
  machineCode += "00_";
  getLeftBracket(code[3]);
  machineCode += parseDataAddress(code[4]);
  getRightBracket(code[5]);
  machineCode += "\n";
}
function parseLOADI(code) {
  let reg = code[1];
  machineCode += getRegisterName(reg);
  getComma(code[2]);
  machineCode += "00_";
  machineCode += convertStringToBinary(code[3]);
  machineCode += "\n";
}
function parseLOAD(code) {
  machineCode += getRegisterName(code[1]);
  machineCode += "00_";
  getComma(code[2]);
  getLeftBracket(code[3]);
  let dataValue = code[4];
  let next = code[5];

  if (next.localeCompare("+") == 0) {
    let offset = parseInt(code[6]);
    let newOffset = valueMapping.get(dataValue) + offset;
    checkAddressOutOfBounds(newOffset);
    machineCode += convertStringToBinary(newOffset);
    getRightBracket(code[7]);
  } else if (next.localeCompare("-") == 0) {
    let offset = parseInt(code[6]);
    let newOffset = valueMapping.get(dataValue) - offset;
    checkAddressOutOfBounds(newOffset);
    machineCode += convertStringToBinary(newOffset);
    getRightBracket(code[7]);
  } else if (next.localeCompare("]") == 0) {
    machineCode += convertStringToBinary(valueMapping.get(dataValue));
  } else {
    errorMessage("Expecting +, - or ]");
  }
  machineCode += "\n";
}
function parseLOADF(code) {
  machineCode += getRegisterName(code[1]);
  getComma(code[2]);
  getLeftBracket(code[3]);
  let dataValue = code[4];
  getPlus(code[5]);
  machineCode += getRegisterName(code[6]);

  if (code[7].localeCompare("+") == 0) {
    let offset = parseInt(code[8]);
    console.log(typeof(offset));
    console.log(typeof(valueMapping.get(dataValue)));
    let newOffset = valueMapping.get(dataValue) + offset;
    warnAddressOutOfBounds(newOffset);
    machineCode += convertStringToBinary(newOffset);
    getRightBracket(code[9]);
  } else if (code[7].localeCompare("-") == 0) {
    let offset =  parseInt(code[8]);
    let newOffset = valueMapping.get(dataValue) - offset;
    warnAddressOutOfBounds(newOffset);
    machineCode += convertStringToBinary(newOffset);
    getRightBracket(code[9]);
  } else if (code[7].localeCompare("]") == 0) {
    machineCode += convertStringToBinary(valueMapping.get(dataValue));
  } else {
    errorMessage("Expecting +,-, or ]");
  }
  machineCode += "\n";
}
function parseLOADP(code) {
  machineCode += getRegisterName(code[1]);
  getComma(code[2]);
  machineCode += "00_";
  getLeftCurlyBracket(code[3]);
  let dataLocation = valueMapping.get(code[4]);
  let next = code[5];
  if (next.localeCompare("+") == 0) {
    dataLocation += parseInt(code[6]);
    getRightCurlyBracket(code[7]);
  } else {
    getRightCurlyBracket(next);
  }
  machineCode += convertStringToBinary(dataLocation);
  machineCode += "\n";
}
function parseINPUTD(code){
  let temp = "";
  
  
  getLeftBracket(code[1]);
  let dataKey = code[2];
  let next = code[3];
  if (next.localeCompare("+") == 0) {
    let offset = parseInt(code[4]);
    let newOffset = valueMapping.get(dataKey) + offset;
    checkAddressOutOfBounds(newOffset);
    temp += convertStringToBinary(newOffset);
    getRightBracket(code[5]);
  }else if(next.localeCompare("-") == 0){
    let offset = parseInt(code[4]);
    let newOffset = valueMapping.get(dataKey) - offset;
    checkAddressOutOfBounds(newOffset);
    temp += convertStringToBinary(newOffset);
    getRightBracket(code[5]);
  }else if(next.localeCompare("]") == 0){
    temp += convertStringToBinary(valueMapping.get(dataKey));
  }else{
    errorMessage("Expecting +,-, or ]");
  }
  machineCode += "00_10_";
  machineCode += temp;
  machineCode += "\n";

}

function parseINPUTC(code){
  let temp = "";
  getLeftBracket(code[1]);
  let dataKey = code[2];
  let next = code[3];
  if (next.localeCompare("+") == 0) {
    let offset = parseInt(code[4]);
    let newOffset = valueMapping.get(dataKey) + offset;
    checkAddressOutOfBounds(newOffset);
    temp += convertStringToBinary(newOffset);
    getRightBracket(code[5]);
  }else if(next.localeCompare("-") == 0){
    let offset = parseInt(code[4]);
    let newOffset = valueMapping.get(dataKey) - offset;
    checkAddressOutOfBounds(newOffset);
    temp += convertStringToBinary(newOffset);
    getRightBracket(code[5]);
  }else if(next.localeCompare("]") == 0){
    temp += convertStringToBinary(valueMapping.get(dataKey));
  }else{
    errorMessage("Expecting +,-, or ]");
  }
  machineCode += "00_00_";
  machineCode += temp;
  machineCode += "\n";
}

function parseINPUTCF(code){
  let temp = "";
  getLeftBracket(code[1]);
  let dataKey = code[2];
  getPlus(code[3]);
  temp += getRegisterName(code[4]);
  temp += "01_";

  let next = code[5];
  if (next.localeCompare("+") == 0) {
    let offset = parseInt(code[6]);
    let newOffset = valueMapping.get(dataKey) + offset;
    checkAddressOutOfBounds(newOffset);
    temp += convertStringToBinary(newOffset);
    getRightBracket(code[7]);
  }else if(next.localeCompare("-") == 0){
    let offset = parseInt(code[6]);
    let newOffset = valueMapping.get(dataKey) - offset;
    checkAddressOutOfBounds(newOffset);
    temp += convertStringToBinary(newOffset);
    getRightBracket(code[7]);
  }else if(next.localeCompare("]") == 0){
    temp += convertStringToBinary(valueMapping.get(dataKey));
  }else{
    errorMessage("Expecting +,-, or ]");
  }
  machineCode += temp;
  machineCode += "\n";

}
function parseINPUTDF(code){
  let temp = "";
  getLeftBracket(code[1]);
  let dataKey = code[2];
  getPlus(code[3]);
  temp += getRegisterName(code[4]);
  temp += "11_";

  let next = code[5];
  if (next.localeCompare("+") == 0) {
    let offset = parseInt(code[6]);
    let newOffset = valueMapping.get(dataKey) + offset;
    checkAddressOutOfBounds(newOffset);
    temp += convertStringToBinary(newOffset);
    getRightBracket(code[7]);
  }else if(next.localeCompare("-") == 0){
    let offset = parseInt(code[6]);
    let newOffset = valueMapping.get(dataKey) - offset;
    checkAddressOutOfBounds(newOffset);
    temp += convertStringToBinary(newOffset);
    getRightBracket(code[7]);
  }else if(next.localeCompare("]") == 0){
    temp += convertStringToBinary(valueMapping.get(dataKey));
  }else{
    errorMessage("Expecting +,-, or ]");
  }
  machineCode += temp;
  machineCode += "\n";

}


function parseSTOREF(code) {
  let temp = "";
 
  getLeftBracket(code[1]);
  let dataValue = code[2];
  getPlus(code[3]);
  temp += getRegisterName(code[4]);
  let next = code[5];
  if (next.localeCompare("+") == 0) {
    let offset = parseInt(code[6]);
    let newOffset = valueMapping.get(dataValue) + offset;
    warnAddressOutOfBounds(newOffset);
    temp += convertStringToBinary(newOffset);

    getRightBracket(code[7]);
      getComma(code[8]);
      machineCode += getRegisterName(code[9]);
  } else if (next.localeCompare("-") == 0) {
    let offset = parseInt(code[6]);
    let newOffset = valueMapping.get(dataValue) - offset;
    warnAddressOutOfBounds(newOffset);
    temp += convertStringToBinary(newOffset);

    getRightBracket(code[7]);
      getComma(code[8]);
      machineCode += getRegisterName(code[9]);
    
  } else if (next.localeCompare("]") == 0) {
    temp += convertStringToBinary(valueMapping.get(dataValue));
    getComma(code[6]);
    machineCode += getRegisterName(code[7]);

  } else {
    errorMessage("Expecting +,- or ]");
  }



  machineCode += temp;
  machineCode += "\n";
}
function parseSTORE(code) {
  getLeftBracket(code[1]);
  let dataValue = code[2];
  let next = code[3];
  let temp = "";
  if (next.localeCompare("+") == 0) {
    let offset = parseInt(code[4]);
    let newOffset = valueMapping.get(dataValue) + offset;
    checkAddressOutOfBounds(newOffset);
    temp += convertStringToBinary(newOffset);
    getRightBracket(code[5]);
    getComma(code[6]);
    machineCode += getRegisterName(code[7]);
  } else if (next.localeCompare("-") == 0) {
    let offset = parseInt(code[4]);
    let newOffset = valueMapping.get(dataValue) - offset;
    checkAddressOutOfBounds(newOffset);
    temp += convertStringToBinary(newOffset);
    getRightBracket(code[5]);
    getComma(code[6]);
    machineCode += getRegisterName(code[7]);
  } else if (next.localeCompare("]") == 0) {
    temp += convertStringToBinary(valueMapping.get(dataValue));
    getComma(code[4]);
    machineCode += getRegisterName(code[5]);
  } else {
    errorMessage("Expecting +, - or ]");
  }
  machineCode += "00_";
  machineCode += temp;
  machineCode += "\n";
}
function parseMOVE(code) {
  machineCode += getRegisterName(code[1]);
  getComma(code[2]);
  machineCode += getRegisterName(code[3]);
  machineCode += "00000000";
  machineCode += "\n";
}
function parseCMP(code) {
  machineCode += getRegisterName(code[1]);
  getComma(code[2]);
  machineCode += getRegisterName(code[3]);
  machineCode += "00000000";
  machineCode += "\n";
}
function parseBRGE(code, line) {
  machineCode += "00_11_";
  machineCode += branchDifference(line, code[1]);
  machineCode += "\n";
}
function parseBRE(code, line) {
  machineCode += "00_00_";
  machineCode += branchDifference(line, code[1]);
  machineCode += "\n";
}
function parseBRG(code, line) {
  machineCode += "00_10_";
  machineCode += branchDifference(line, code[1]);
  machineCode += "\n";
}
function parseBRNE(code, line) {
  machineCode += "00_01_";
  machineCode += branchDifference(line, code[1]);
  machineCode += "\n";
}
function parseJUMP(code, line) {
  machineCode += "00_00_";
  machineCode += branchDifference(line, code[1]);
  machineCode += "\n";
}
function parseSHIFTR(code) {
  machineCode += getRegisterName(code[1]);
  machineCode += "01_00000000";
  machineCode += "\n";
}
function parseSHIFTL(code) {
  machineCode += getRegisterName(code[1]);
  machineCode += "00_00000000";
  machineCode += "\n";
}

//------------------------------------Helper methods for the instructions-----------------
function parseDataAddress(code) {
  convertStringToBinary(valueMapping.get(code));
}
/**
 * Maps a string to binary by looping through value
 */
function mapIntoBinary(string) {
  let toReturn = string;
  if (string.includes("-")) {
    toReturn = toReturn.replace("-", "");
    //Twos comp
    toReturn = toReturn.toString(2);
    toReturn = toReturn.replace(/[01]/g, (m) => (m == 0 ? "1" : 0));
    toReturn = addBinary(toReturn, (1).toString(2));

    while (toReturn.length < 8) {
      toReturn = 1 + toReturn;
    }
  } else {
    while (toReturn.length < 8) {
      toReturn = 0 + toReturn;
    }
  }
  return toReturn;
}
/**
 * Add two binary numbers together
 */
var addBinary = function (a, b) {
  var i = a.length - 1;
  var j = b.length - 1;
  var carry = 0;
  var result = "";
  while (i >= 0 || j >= 0) {
    var m = i < 0 ? 0 : a[i] | 0;
    var n = j < 0 ? 0 : b[j] | 0;
    carry += m + n; // sum of two digits
    result = (carry % 2) + result; // string concat
    carry = (carry / 2) | 0; // remove decimals,  1 / 2 = 0.5, only get 0
    i--;
    j--;
  }
  if (carry !== 0) {
    result = carry + result;
  }
  return result;
};
/**
 * converts a string to binary used for immediate values
 */
function convertStringToBinary(input) {
  input = parseInt(input);
  if (isNaN(input)) {
    errorMessage("Expecting immediate value (Integer) ");
  } else {
    let eightBit = mapIntoBinary(input.toString(2));
    if (eightBit.length > 8) {
      //Case of negative
      return eightBit.substring(eightBit.length - 8, eightBit.length);
    }
    return eightBit;
  }
}

function branchDifference(line, destination) {
  let diff = branchDest.get(destination) - line;
  return convertStringToBinary(diff);
}
/**
 * Function makes sure the address is within the given 0 -64
 */
function checkAddressOutOfBounds(address) {
  if (address < 0 || address > 63) {
    error("Adress out of bounds, attempting to access address " + address);
  }
}
function warnAddressOutOfBounds(address) {
  if (address < 0 || address > 63) {
    alert(
      "Warning: Address may be out of bounds depending on the value of the register.\n" +
        "         Assuming it is 0, then attempting to access address " +
        address +
        "."
    );
  }
}
function checkImmediateValueOutOfBounds(immediateValue) {
  if (immediateValue.includes("-")) {
    errorMessage("Expecting positive immediate value. Negative number given");
  }
  if (immediateValue < -128 || immediateValue > 127) {
    errorMessage("Immediate value " + immediateValue + " out of bounds");
  }
}
//------------------------All get functions looking verify characters---------------------------
function getComma(comma) {
  if (comma.localeCompare(",") == 1) {
    errorMessage("Expecting comma");
  }
}
function getLeftBracket(leftBracket) {
  if (leftBracket.localeCompare("[") == 1) {
    errorMessage("Expected left bracket");
  }
}
function getRightBracket(rightBracket) {
  if (rightBracket.localeCompare("]") == 1) {
    errorMessage("Expected Right bracket");
  }
}
function getLeftCurlyBracket(leftBracket) {
  if (leftBracket.localeCompare("{") == 1) {
    errorMessage("Expected left curly bracket");
  }
}
function getRightCurlyBracket(rightBracket) {
  if (rightBracket.localeCompare("}") == 1) {
    errorMessage("Expected right curly bracket");
  }
}
function getPlus(plus) {
  if (plus.localeCompare("+") == 1) {
    error("Expected Right bracket");
  }
}

/**
 * Looks at the code segment and uses getOpCodeBits to get machine code and
 * call a given funciton to complete the instruction
 */
function parseCodeSegment(code) {
  codeSegmentStart = lineNumber - 1;

  for (let i = codeSegmentStart; i < code.length; i++) {
    lineNumber++;
    let lineScanner = code[i].split(" ");
    lineScanner = removeEmpty(lineScanner);
    for(let j = 0; j < 10; j++ ){
      if(lineScanner[j]){
        lineScanner[j] = lineScanner[j].replace(/^\s+|\s+$/g, '');
        lineScanner[j] = lineScanner[j].replace(/^\t+|\t+$/g, '');
      }else{
        break;
      }
    }

    let opcode = lineScanner[0];
    //opcode = opcode.replace(/^\s+|\s+$/g, '');
  

    if (opcode.localeCompare("NOOP") == 0) {
      getOpCodeBits("NOOP");
      parseNOOP();
    } else if (opcode.localeCompare("LOADI") == 0) {
      getOpCodeBits("LOADI");
      parseLOADI(lineScanner);
    } else if (opcode.localeCompare("LOADP") == 0) {
      getOpCodeBits("LOADP");
      parseLOADP(lineScanner);
    } else if (opcode.localeCompare("CMP") == 0) {
      getOpCodeBits("CMP");
      parseCMP(lineScanner);
    } else if (opcode.localeCompare("LOAD") == 0) {
      getOpCodeBits("LOAD");
      parseLOAD(lineScanner);
    } else if (opcode.localeCompare("STORE") == 0) {
      getOpCodeBits("STORE");
      parseSTORE(lineScanner);
    } else if (opcode.localeCompare("STOREF") == 0) {
      getOpCodeBits("STOREF");
      parseSTOREF(lineScanner);
    } else if (opcode.localeCompare("LOADF") == 0) {
      getOpCodeBits("LOADF");
      parseLOADF(lineScanner);
    } else if (opcode.localeCompare("INPUT") == 0) {
      getOpCodeBits("INPUT");
      parseINPUT(lineScanner);
    } else if (
      opcode.localeCompare("BRE") == 0 ||
      opcode.localeCompare("BRZ") == 0
    ) {
      getOpCodeBits("BRE");
      parseBRE(lineScanner, lineNumber - codeSegmentStart - 1);
    } else if (
      opcode.localeCompare("BRNE") == 0 ||
      opcode.localeCompare("BRNZ") == 0
    ) {
      getOpCodeBits("BRNE");
      parseBRNE(lineScanner, lineNumber - codeSegmentStart - 1);
    } else if (opcode.localeCompare("BRG") == 0) {
      getOpCodeBits("BRG");
      parseBRG(lineScanner, lineNumber - codeSegmentStart - 1);
    } else if (opcode.localeCompare("BRGE") == 0) {
      getOpCodeBits("BRGE");
      parseBRGE(lineScanner, lineNumber - codeSegmentStart - 1);
    } else if (opcode.localeCompare("JUMP") == 0) {
      getOpCodeBits("JUMP");
      parseJUMP(lineScanner, lineNumber - codeSegmentStart - 1);
    } else if (opcode.localeCompare("ADD") == 0) {
      getOpCodeBits("ADD");
      parseADD(lineScanner);
    } else if (opcode.localeCompare("ADDI") == 0) {
      getOpCodeBits("ADDI");
      parseADDI(lineScanner);
    } else if (opcode.localeCompare("SUB") == 0) {
      getOpCodeBits("SUB");
      parseSUB(lineScanner);
    } else if (opcode.localeCompare("SUBI") == 0) {
      getOpCodeBits("SUBI");
      parseSUBI(lineScanner);
    } else if (opcode.localeCompare("MOVE") == 0) {
      getOpCodeBits("MOVE");
      parseMOVE(lineScanner);
    } else if (opcode.localeCompare("INPUTC") == 0) {
      getOpCodeBits("INPUTC");
      parseINPUTC(lineScanner);
    } else if (opcode.localeCompare("INPUTCF") == 0) {
      getOpCodeBits("INPUTCF");
      parseINPUTCF(lineScanner);
    } else if (opcode.localeCompare("INPUTD") == 0) {
      getOpCodeBits("INPUTD");
      parseINPUTD(lineScanner);
    } else if (opcode.localeCompare("INPUTDF") == 0) {
      getOpCodeBits("INPUTDF");
      parseINPUTDF(lineScanner);
    } else if (opcode.localeCompare("SHIFTL") == 0) {
      getOpCodeBits("SHIFTL");
      parseSHIFTL(lineScanner);
    } else if (opcode.localeCompare("SHIFTR") == 0) {
      getOpCodeBits("SHIFTR");
      parseSHIFTR(lineScanner);
    } else {
      errorMessage("Invalid opcode: " + opcode + " ");
    }
  }
}
/**
 * Get the machine code for each register
 * Allowed registers A, B, C, D
 */
function getRegisterName(register) {
  register = register.replace(/^\s+|\s+$/g, '');
  if (register.localeCompare("A") == 0) {
    return "00_";
  } else if (register.localeCompare("B") == 0) {
    return "01_";
  } else if (register.localeCompare("C") == 0) {
    return "10_";
  } else if (register.localeCompare("D") == 0) {
    return "11_";
  } else {
    errorMessage("Expecting register name (A,B,C,D)");
    return "0";
  }
}
/**
 * Adds the opcode bits to the corresponding instruction to the final output of macheine code
 */
function getOpCodeBits(instruction) {
  for (let i = 0; i < instructionSet.length; i++) {
    if (instruction.localeCompare(instructionSet[i]) == 0) {
      machineCode += instructionFormat[i];
      return;
    }
  }
  errorMessage("Expecting Opcode");
}

/**
 * Takes in the error as input and outputs to the user what line the error is occuring on
 */
function errorMessage(error) {
  document.getElementById("dropdownMenuButton").style.display = "none";
  document.getElementById("toggleSyntax").style.display = "none";
  document.getElementById("banner").innerHTML = "Assembly Failed";
  document.getElementById("navigateCPU").style.display = "none";
  document.getElementById("assemblyTable").style.display = "none";
  document.getElementById("machineTable").style.display = "none";
  document.getElementById("displayAssemblytext").style.display = "none";
  document.getElementById("displayMachinetext").style.display = "none";
  document.getElementById("displayErrorText").innerHTML = "<b>Errors:</b><br>";
  document.getElementById("ErrorTable").style.display ="block";
  let errorTable = document.getElementById("ErrorTable");

  if(errorTableCount == 0){
    let errorRow = errorTable.insertRow(errorTableCount);
    errorTableCount ++;
    let errorCell1 = errorRow.insertCell(0);
    let errorCell2 = errorRow.insertCell(1);
    errorCell1.innerHTML = "Line Number";
    errorCell2.innerHTML = "Error";
  }

  
  let errorRow = errorTable.insertRow(errorTableCount);
  errorTableCount ++;
  let errorCell1 = errorRow.insertCell(0);
  let errorCell2 = errorRow.insertCell(1);
  errorCell1.innerHTML = lineNumber;
  errorCell2.innerHTML = error;
  //alert(error + " on line " + lineNumber);
}

//---------------------------Display options for the html page--------------------------
/**
 * Choice to show the file open options
 */
function ShowFile() {
  let T = document.getElementById("fileDiv");
  let F = document.getElementById("inputDiv");
  T.style.display = "block";
}


//TODO - Parse only the data
function getData() {}

//-------------------------Dropdown-toggle class ------------------------------------
$(".dropdown-menu > .dropdown > a").addClass("dropdown-toggle");

$(".dropdown-menu a.dropdown-toggle").on("click", function (e) {
  if (!$(this).next().hasClass("show")) {
    $(this).parents(".dropdown-menu").first().find(".show").removeClass("show");
  }
  var $subMenu = $(this).next(".dropdown-menu");
  $subMenu.toggleClass("show");
  $(this)
    .parents("li.nav-item.dropdown.show")
    .on("hidden.bs.dropdown", function (e) {
      $(".dropdown-menu > .dropdown .show").removeClass("show");
    });
  return false;
});

//----------------------Toggle syntax highlighting--------------------------------

function toggleSyntaxHighlight() {
  let toggle = document.getElementById("toggleSyntax").value;
  let Assemblytable = document.getElementById("assemblyTable");
  let machineTable = document.getElementById("machineTable");
 
  if (toggle.localeCompare("Syntax Highlighting: ON") == 0) {
    document.getElementById("toggleSyntax").value = "Syntax Highlighting: OFF";

    //Table color update
    for (let i = codeSegmentStart; i < Assemblytable.rows.length; i++) {
      let firstCol = Assemblytable.rows[i].cells[1].textContent;
      let secondCol = Assemblytable.rows[i].cells[2].textContent;
      let machineCol = machineTable.rows[i].cells[0].textContent;



      //Assembly coloring for op codes ->
      if (instructionSet.includes(firstCol)) {
        Assemblytable.rows[i].cells[1].style.color = "Red";
      }
      //Machine coloring Move, CMP, ADD, and SUB
      if (
        firstCol.localeCompare("CMP") == 0 ||
        firstCol.localeCompare("ADD") == 0 ||
        firstCol.localeCompare("SUB") == 0
      ) {
        //Assembly Code
        Assemblytable.rows[i].cells[2].style.color = "blue";
        Assemblytable.rows[i].cells[3].style.color = "green";
        //Machine Code
        let newMachineCol = '<span style="color:red">';
        newMachineCol += machineCol.substring(0, 4);
        newMachineCol += "</span>";
        newMachineCol += machineCol.substring(4, 5);
        newMachineCol += '<span style="color:blue">';
        newMachineCol += machineCol.substring(5, 7);
        newMachineCol += "</span>";
        newMachineCol += machineCol.substring(7, 8);
        newMachineCol += '<span style="color:Green">';
        newMachineCol += machineCol.substring(8, 10);
        newMachineCol += "</span>";
        newMachineCol += machineCol.substring(10, machineCol.length);
        machineTable.rows[i].cells[0].innerHTML = newMachineCol;
      } else if (
        firstCol.localeCompare("LOADI") == 0 ||
        firstCol.localeCompare("ADDI") == 0 ||
        firstCol.localeCompare("SUBI") == 0 ||
        firstCol.localeCompare("LOAD") == 0 ||
        firstCol.localeCompare("LOADP") == 0
      ) {
        //Assembly Code
        Assemblytable.rows[i].cells[2].style.color = "blue";
        Assemblytable.rows[i].cells[3].style.color = "purple";
        //Machine Code
        let newMachineCol = '<span style="color:red">';
        newMachineCol += machineCol.substring(0, 4);
        newMachineCol += "</span>";
        newMachineCol += machineCol.substring(4, 5);
        newMachineCol += '<span style="color:blue">';
        newMachineCol += machineCol.substring(5, 7);
        newMachineCol += "</span>";
        newMachineCol += machineCol.substring(7, 11);
        newMachineCol += '<span style="color:purple">';
        newMachineCol += machineCol.substring(11, machineCol.length);
        newMachineCol += "</span>";
        machineTable.rows[i].cells[0].innerHTML = newMachineCol;
      } else if (firstCol.localeCompare("JUMP") == 0) {
        //Assembly Code
        Assemblytable.rows[i].cells[2].style.color = "purple";
        //Machine Code
        let newMachineCol = '<span style="color:red">';
        newMachineCol += machineCol.substring(0, 4);
        newMachineCol += "</span>";
        newMachineCol += machineCol.substring(4, 11);
        newMachineCol += '<span style="color:purple">';
        newMachineCol += machineCol.substring(11, machineCol.length);
        newMachineCol += "</span>";
        machineTable.rows[i].cells[0].innerHTML = newMachineCol;
      } else if (
        firstCol.localeCompare("BRE") == 0 ||
        firstCol.localeCompare("BRNE") == 0 ||
        firstCol.localeCompare("BRG") == 0 ||
        firstCol.localeCompare("BRGE") == 0 ||
        firstCol.localeCompare("INPUTD") == 0
      ) {
        //Assembly Code
        Assemblytable.rows[i].cells[2].style.color = "purple";
        //Machine Code
        let newMachineCol = '<span style="color:red">';
        newMachineCol += machineCol.substring(0, 4);
        newMachineCol += "</span>";
        newMachineCol += machineCol.substring(4, 8);
        newMachineCol += '<span style="color:red">';
        newMachineCol += machineCol.substring(8, 10);
        newMachineCol += "</span>";
        newMachineCol += '<span style="color:purple">';
        newMachineCol += machineCol.substring(10, machineCol.length);
        newMachineCol += "</span>";
        machineTable.rows[i].cells[0].innerHTML = newMachineCol;
      } else if (firstCol.localeCompare("NOOP") == 0) {
        let newMachineCol = '<span style="color:red">';
        newMachineCol += machineCol.substring(0, 4);
        newMachineCol += "</span>";
        newMachineCol += machineCol.substring(4, machineCol.length);
        machineTable.rows[i].cells[0].innerHTML = newMachineCol;
      } else if(firstCol.localeCompare("LOADF") == 0){
        //Assembly Code
        Assemblytable.rows[i].cells[2].style.color = "blue";
        let plusLocation = Assemblytable.rows[i].cells[3].innerHTML.indexOf("+") + 1;
        let regLength = Assemblytable.rows[i].cells[3].innerHTML.length;
        let newReg = '<span style="color:purple">';
        newReg += Assemblytable.rows[i].cells[3].innerHTML.substring(0,plusLocation);
        newReg += "</span>";
        newReg += '<span style="color:green">';
        newReg += Assemblytable.rows[i].cells[3].innerHTML.substring(plusLocation,plusLocation+1);
        newReg += "</span>";
        newReg += '<span style="color:purple">';
        newReg += Assemblytable.rows[i].cells[3].innerHTML.substring(plusLocation+1,regLength);
        newReg += "</span>";
        Assemblytable.rows[i].cells[3].innerHTML = newReg;
        
        //Machine Code
        let newMachineCol = '<span style="color:red">';
        newMachineCol += machineCol.substring(0, 4);
        newMachineCol += "</span>";
        newMachineCol += machineCol.substring(4, 5);
        newMachineCol += '<span style="color:blue">';
        newMachineCol += machineCol.substring(5, 7);
        newMachineCol += "</span>";
        newMachineCol += machineCol.substring(7, 8);
        newMachineCol += '<span style="color:Green">';
        newMachineCol += machineCol.substring(8, 10);
        newMachineCol += "</span>";
        newMachineCol += '<span style="color:purple">';
        newMachineCol += machineCol.substring(10, machineCol.length);
        newMachineCol += "</span>";
        machineTable.rows[i].cells[0].innerHTML = newMachineCol;
      } else if(firstCol.localeCompare("STOREF") == 0){
        //Assembly code
        Assemblytable.rows[i].cells[3].style.color = "blue";
        let plusLocation = Assemblytable.rows[i].cells[2].innerHTML.indexOf("+") + 1;
        let regLength = Assemblytable.rows[i].cells[2].innerHTML.length;

        let newReg = "";
        if(plusLocation != 0){
          newReg = '<span style="color:purple">';
          newReg += Assemblytable.rows[i].cells[2].innerHTML.substring(0,plusLocation);
          newReg += "</span>";
          newReg += '<span style="color:green">';
          newReg += Assemblytable.rows[i].cells[2].innerHTML.substring(plusLocation,plusLocation+1);
          newReg += "</span>";
          newReg += '<span style="color:purple">';
          newReg += Assemblytable.rows[i].cells[2].innerHTML.substring(plusLocation+1,regLength);
          newReg += "</span>";
        }else{
          newReg += '<span style="color:purple">';
          newReg += Assemblytable.rows[i].cells[2].innerHTML.substring(0,regLength);
          newReg += "</span>";
        }
        
        Assemblytable.rows[i].cells[2].innerHTML = newReg;
        //Machine Code
        let newMachineCol = '<span style="color:red">';
        newMachineCol += machineCol.substring(0, 4);
        newMachineCol += "</span>";
        newMachineCol += machineCol.substring(4, 5);
        newMachineCol += '<span style="color:blue">';
        newMachineCol += machineCol.substring(5, 7);
        newMachineCol += "</span>";
        newMachineCol += machineCol.substring(7, 8);
        newMachineCol += '<span style="color:Green">';
        newMachineCol += machineCol.substring(8, 10);
        newMachineCol += "</span>";
        newMachineCol += '<span style="color:purple">';
        newMachineCol += machineCol.substring(10, machineCol.length);
        newMachineCol += "</span>";
        machineTable.rows[i].cells[0].innerHTML = newMachineCol;
      } else if(firstCol.localeCompare("SHIFTR") == 0|| firstCol.localeCompare("SHIFTL") == 0){
        //Assembly code
        Assemblytable.rows[i].cells[2].style.color = "blue";

        //Machine code
        let newMachineCol = '<span style="color:red">';
        newMachineCol += machineCol.substring(0, 4);
        newMachineCol += "</span>";
        newMachineCol += machineCol.substring(4, 5);
        newMachineCol += '<span style="color:blue">';
        newMachineCol += machineCol.substring(5, 7);
        newMachineCol += "</span>";
        newMachineCol += machineCol.substring(7, 9);
        newMachineCol += '<span style="color:red">';
        newMachineCol += machineCol.substring(9, 10);
        newMachineCol += "</span>";
        newMachineCol += machineCol.substring(10, machineCol.length);
        machineTable.rows[i].cells[0].innerHTML = newMachineCol;

      }else if(firstCol.localeCompare("STORE") == 0){
        //Assembly code
        Assemblytable.rows[i].cells[2].style.color = "purple";
        Assemblytable.rows[i].cells[3].style.color = "blue";
        //Machine Code
        let newMachineCol = '<span style="color:red">';
        newMachineCol += machineCol.substring(0, 4);
        newMachineCol += "</span>";
        newMachineCol += machineCol.substring(4, 5);
        newMachineCol += '<span style="color:blue">';
        newMachineCol += machineCol.substring(5, 7);
        newMachineCol += "</span>";
        newMachineCol += machineCol.substring(7, 11);
        newMachineCol += '<span style="color:purple">';
        newMachineCol += machineCol.substring(11, machineCol.length);
        newMachineCol += "</span>";
        machineTable.rows[i].cells[0].innerHTML = newMachineCol;
      }else if(firstCol.localeCompare("INPUTCF") == 0 || firstCol.localeCompare("INPUTDF") == 0){
        //Assembly code
        Assemblytable.rows[i].cells[2].style.color = "blue";
        //Machine Code
        let newMachineCol = '<span style="color:red">';
        newMachineCol += machineCol.substring(0, 4);
        newMachineCol += "</span>";
        newMachineCol += machineCol.substring(4, 5);
        newMachineCol += '<span style="color:blue">';
        newMachineCol += machineCol.substring(5, 7);
        newMachineCol += "</span>";
        newMachineCol += machineCol.substring(7, 8);
        newMachineCol += '<span style="color:red">';
        newMachineCol += machineCol.substring(8, 10);
        newMachineCol += "</span>";
        newMachineCol += machineCol.substring(10, 11);
        newMachineCol += '<span style="color:purple">';
        newMachineCol += machineCol.substring(11, machineCol.length);
        newMachineCol += "</span>";
        machineTable.rows[i].cells[0].innerHTML = newMachineCol;

      }else if(firstCol.localeCompare("INPUTC") == 0){
        //Assembly code
        Assemblytable.rows[i].cells[2].style.color = "purple";
        //Machine Code
        let newMachineCol = '<span style="color:red">';
        newMachineCol += machineCol.substring(0, 4);
        newMachineCol += "</span>";
        newMachineCol += machineCol.substring(4, 5);
        newMachineCol += '<span style="color:red">';
        newMachineCol += machineCol.substring(5, 7);
        newMachineCol += "</span>";
        newMachineCol += machineCol.substring(7, 8);
        newMachineCol += '<span style="color:red">';
        newMachineCol += machineCol.substring(8, 10);
        newMachineCol += "</span>";
        newMachineCol += machineCol.substring(10, 11);
        newMachineCol += '<span style="color:purple">';
        newMachineCol += machineCol.substring(11, machineCol.length);
        newMachineCol += "</span>";
        machineTable.rows[i].cells[0].innerHTML = newMachineCol;
        
      }else if(firstCol.localeCompare("MOVE") == 0 ){
        //Assembly Code
        Assemblytable.rows[i].cells[2].style.color = "blue";
        Assemblytable.rows[i].cells[3].style.color = "green";
        //Machine Code
        let newMachineCol = '<span style="color:red">';
        newMachineCol += machineCol.substring(0, 4);
        newMachineCol += "</span>";
        newMachineCol += machineCol.substring(4, 5);
        newMachineCol += '<span style="color:blue">';
        newMachineCol += machineCol.substring(5, 7);
        newMachineCol += "</span>";
        newMachineCol += machineCol.substring(7, 8);
        newMachineCol += '<span style="color:Green">';
        newMachineCol += machineCol.substring(8, 10);
        newMachineCol += "</span>";
        newMachineCol += machineCol.substring(10, 11);
        newMachineCol += '<span style="color:purple">';
        newMachineCol += machineCol.substring(11, machineCol.length);
        newMachineCol += "</span>";
        machineTable.rows[i].cells[0].innerHTML = newMachineCol;
      }
    }
  } else {
    let originalMachine = machineCode.split("\n");
    document.getElementById("toggleSyntax").value = "Syntax Highlighting: ON";
    let counter = 0;

    for (let i = codeSegmentStart; i < Assemblytable.rows.length; i++) {
      //Set all rows of assembly back to black
      for (let j = 0; j < 4; j++) {
        Assemblytable.rows[i].cells[j].style.color = "Black";
        
        //Keep line number formatting but change everything else
        if(j != 0){
          Assemblytable.rows[i].cells[j].innerHTML = Assemblytable.rows[i].cells[j].innerHTML.replace(/<\/?span[^>]*>/g,"");
        }
        
        
      }
      //Place original machine code back in
      machineTable.rows[i].cells[0].textContent = originalMachine[counter];
     
      counter++;
    }
  }
}


function createBIOSCodeLow(){
  let machineCodeFormatted = machineCode.split("\n");
  let output =
      "module BIOS_Hardcoded_Low(b0I,b1I,b2I,b3I,b4I,b5I,b6I,b7I,b8I,b9I,b10I,b11I,b12I,b13I,b14I,b15I);\r\n" +
      "\r\n" +
      "\toutput [15:0] b0I;\r\n" +
      "\toutput [15:0] b1I;\r\n" +
      "\toutput [15:0] b2I;\r\n" +
      "\toutput [15:0] b3I;\r\n" +
      "\toutput [15:0] b4I;\r\n" +
      "\toutput [15:0] b5I;\r\n" +
      "\toutput [15:0] b6I;\r\n" +
      "\toutput [15:0] b7I;\r\n" +
      "\toutput [15:0] b8I;\r\n" +
      "\toutput [15:0] b9I;\r\n" +
      "\toutput [15:0] b10I;\r\n" +
      "\toutput [15:0] b11I;\r\n" +
      "\toutput [15:0] b12I;\r\n" +
      "\toutput [15:0] b13I;\r\n" +
      "\toutput [15:0] b14I;\r\n" +
      "\toutput [15:0] b15I;\r\n\n";

  if (machineCodeFormatted.length <= 32) {
    output += `\tassign  b0I[15:0] = 16'b0000_00_00_00000000;
\tassign  b1I[15:0] = 16'b1110_00_00_00011110; // JUMP to user space (address 32)
\tassign  b2I[15:0] = 16'b0000_00_00_00000000;
\tassign  b3I[15:0] = 16'b0000_00_00_00000000;
\tassign  b4I[15:0] = 16'b0000_00_00_00000000;
\tassign  b5I[15:0] = 16'b0000_00_00_00000000;
\tassign  b6I[15:0] = 16'b0000_00_00_00000000;
\tassign  b7I[15:0] = 16'b0000_00_00_00000000;
\tassign  b8I[15:0] = 16'b0000_00_00_00000000;
\tassign  b9I[15:0] = 16'b0000_00_00_00000000;
\tassign b10I[15:0] = 16'b0000_00_00_00000000;
\tassign b11I[15:0] = 16'b0000_00_00_00000000;
\tassign b12I[15:0] = 16'b0000_00_00_00000000;
\tassign b13I[15:0] = 16'b0000_00_00_00000000;
\tassign b14I[15:0] = 16'b0000_00_00_00000000;
\tassign b15I[15:0] = 16'b0000_00_00_00000000;

endmodule`;
  }
  else {
    for (let i = 0;  i < 16; i++) {
       let line = machineCodeFormatted[i];
 
       if(i<=9)
         output += "\tassign   b" + i; // one extra space for better alignment
       else     
         output += "\tassign  b" + i;
              
       if( i < machineCodeFormatted.length - 1) 
         output += "I[15:0] = 16'b" + line + "; // " + savedInstructions[i] + "\r\n";   
       else
         output += "I[15:0] = 16'b0000_00_00_00000000;\r\n"; //pad with NOOPs
     }   
     output += "\r\nendmodule";
  }
  return output;
}


function createBIOSCodeHigh(){
  let machineCodeFormatted = machineCode.split("\n");
  let output =
      "module BIOS_Hardcoded_High(b0I,b1I,b2I,b3I,b4I,b5I,b6I,b7I,b8I,b9I,b10I,b11I,b12I,b13I,b14I,b15I);\r\n" +
      "\r\n" +
      "\toutput [15:0] b0I;\r\n" +
      "\toutput [15:0] b1I;\r\n" +
      "\toutput [15:0] b2I;\r\n" +
      "\toutput [15:0] b3I;\r\n" +
      "\toutput [15:0] b4I;\r\n" +
      "\toutput [15:0] b5I;\r\n" +
      "\toutput [15:0] b6I;\r\n" +
      "\toutput [15:0] b7I;\r\n" +
      "\toutput [15:0] b8I;\r\n" +
      "\toutput [15:0] b9I;\r\n" +
      "\toutput [15:0] b10I;\r\n" +
      "\toutput [15:0] b11I;\r\n" +
      "\toutput [15:0] b12I;\r\n" +
      "\toutput [15:0] b13I;\r\n" +
      "\toutput [15:0] b14I;\r\n" +
      "\toutput [15:0] b15I;\r\n\n";

  if (machineCodeFormatted.length <= 32) {
    output += `\tassign  b0I[15:0] = 16'b0000_00_00_00000000;
\tassign  b1I[15:0] = 16'b0000_00_00_00000000;
\tassign  b2I[15:0] = 16'b0000_00_00_00000000;
\tassign  b3I[15:0] = 16'b0000_00_00_00000000;
\tassign  b4I[15:0] = 16'b0000_00_00_00000000;
\tassign  b5I[15:0] = 16'b0000_00_00_00000000;
\tassign  b6I[15:0] = 16'b0000_00_00_00000000;
\tassign  b7I[15:0] = 16'b0000_00_00_00000000;
\tassign  b8I[15:0] = 16'b0000_00_00_00000000;
\tassign  b9I[15:0] = 16'b0000_00_00_00000000;
\tassign b10I[15:0] = 16'b0000_00_00_00000000;
\tassign b11I[15:0] = 16'b0000_00_00_00000000;
\tassign b12I[15:0] = 16'b0000_00_00_00000000;
\tassign b13I[15:0] = 16'b0000_00_00_00000000;
\tassign b14I[15:0] = 16'b0000_00_00_00000000;
\tassign b15I[15:0] = 16'b0000_00_00_00000000;

endmodule`;
  }
  else {
    for (let i = 16;  i < 32; i++) {
      let line = machineCodeFormatted[i];
      
      if( (i-16)<=9 )
        output += "\tassign   b" + (i-16); // one extra space for better alignment
      else     
        output += "\tassign  b" + (i-16); 
        
      if( i < machineCodeFormatted.length - 1)  
         output += "I[15:0] = 16'b" + line + "; // " + savedInstructions[i] + "\r\n";
      else
         output += "I[15:0] = 16'b0000_00_00_00000000;\r\n"; //pad with NOOPs
    }
    output += "\r\nendmodule";
  }
  return output;
}


function createUserCodeLow(){
  let machineCodeFormatted = machineCode.split("\n");
  let output =
      "module User_Code_Low(b0I,b1I,b2I,b3I,b4I,b5I,b6I,b7I,b8I,b9I,b10I,b11I,b12I,b13I,b14I,b15I);\r\n" +
      "\r\n" +
      "\toutput [15:0] b0I;\r\n" +
      "\toutput [15:0] b1I;\r\n" +
      "\toutput [15:0] b2I;\r\n" +
      "\toutput [15:0] b3I;\r\n" +
      "\toutput [15:0] b4I;\r\n" +
      "\toutput [15:0] b5I;\r\n" +
      "\toutput [15:0] b6I;\r\n" +
      "\toutput [15:0] b7I;\r\n" +
      "\toutput [15:0] b8I;\r\n" +
      "\toutput [15:0] b9I;\r\n" +
      "\toutput [15:0] b10I;\r\n" +
      "\toutput [15:0] b11I;\r\n" +
      "\toutput [15:0] b12I;\r\n" +
      "\toutput [15:0] b13I;\r\n" +
      "\toutput [15:0] b14I;\r\n" +
      "\toutput [15:0] b15I;\r\n\n";
      
  let file_offset = machineCodeFormatted.length > 32 ? 32 : 0;
  
  for(let i = 0; i < 16; i++) {
    let line = machineCodeFormatted[file_offset + i];
    if(i<=9)
       output += "\tassign   b" + i; // one extra space for better alignment
    else     
       output += "\tassign  b" + i; 
      
    if( file_offset + i < machineCodeFormatted.length - 1)   
       output += "I[15:0] = 16'b" + line + "; // " + savedInstructions[file_offset + i] + "\r\n";
    else
       output += "I[15:0] = 16'b0000_00_00_00000000;\r\n";  // pad with NOOPs
  }     
  output += "\r\nendmodule";
  return output;
}
  

function createUserCodeHigh(){
  let machineCodeFormatted = machineCode.split("\n");
  let output =
  "module User_Code_High(b0I,b1I,b2I,b3I,b4I,b5I,b6I,b7I,b8I,b9I,b10I,b11I,b12I,b13I,b14I,b15I);\r\n" +
  "\r\n" +
  "\toutput [15:0] b0I;\r\n" +
  "\toutput [15:0] b1I;\r\n" +
  "\toutput [15:0] b2I;\r\n" +
  "\toutput [15:0] b3I;\r\n" +
  "\toutput [15:0] b4I;\r\n" +
  "\toutput [15:0] b5I;\r\n" +
  "\toutput [15:0] b6I;\r\n" +
  "\toutput [15:0] b7I;\r\n" +
  "\toutput [15:0] b8I;\r\n" +
  "\toutput [15:0] b9I;\r\n" +
  "\toutput [15:0] b10I;\r\n" +
  "\toutput [15:0] b11I;\r\n" +
  "\toutput [15:0] b12I;\r\n" +
  "\toutput [15:0] b13I;\r\n" +
  "\toutput [15:0] b14I;\r\n" +
  "\toutput [15:0] b15I;\r\n\n";
  
  let file_offset = machineCodeFormatted.length > 32 ? 32 : 0;
  
  for (let i = 16; i < 32; i++) {
    let line = machineCodeFormatted[file_offset + i];
    if( (i-16)<=9 )
       output += "\tassign   b" + (i-16); // one extra space for better alignment
    else     
       output += "\tassign  b" + (i-16); 
   
    if(file_offset + i < machineCodeFormatted.length - 1)
        output += "I[15:0] = 16'b" + line + "; // " + savedInstructions[file_offset + i] + "\r\n";
    else
        output += "I[15:0] = 16'b0000_00_00_00000000;\r\n"; // pad with NOOPs
  }
  output += "\r\nendmodule";
  return output;
}
     

function createUserData(){
  let savedData = JSON.parse(sessionStorage.getItem("savedDataMemory"));
  let output =
  "module User_Data(b0I,b1I,b2I,b3I,b4I,b5I,b6I,b7I,b8I,b9I,b10I,b11I,b12I,b13I,b14I,b15I);\r\n" +
  "\r\n" +
  "\toutput [7:0] b0I;\r\n" +
  "\toutput [7:0] b1I;\r\n" +
  "\toutput [7:0] b2I;\r\n" +
  "\toutput [7:0] b3I;\r\n" +
  "\toutput [7:0] b4I;\r\n" +
  "\toutput [7:0] b5I;\r\n" +
  "\toutput [7:0] b6I;\r\n" +
  "\toutput [7:0] b7I;\r\n" +
  "\toutput [7:0] b8I;\r\n" +
  "\toutput [7:0] b9I;\r\n" +
  "\toutput [7:0] b10I;\r\n" +
  "\toutput [7:0] b11I;\r\n" +
  "\toutput [7:0] b12I;\r\n" +
  "\toutput [7:0] b13I;\r\n" +
  "\toutput [7:0] b14I;\r\n" +
  "\toutput [7:0] b15I;\r\n\n";

  
  for(let i =0; i < 16; i++){
    if(i<=9)
       output += "\tassign   b" + i; // one extra space for better alignment
    else     
       output += "\tassign  b" + i;

    if(formattedVariables.length > i){
      output += "I[7:0] = 8'b" + savedData[i] + "; // " + formattedVariables[i] + "\r\n";
    }else{
      output += "I[7:0] = 8'b00000000;\r\n"; // pad with zeros
    }
  }
  output += "\r\nendmodule";
  return output;
}

function createBios(){
 
  let binaryArray = new Array();

  for(let i =0; i < 32 ; i++){
    if(i == 1){
      binaryArray[i] = "1110000000011110";
    }else{
      binaryArray[i] = "0000000000000000";
    }
  }

  return binaryArray;

}



function saveData(){
  let tempMachineCode = machineCode.replace(/\_/g, "");
  let savedMachineCode = tempMachineCode.split("\n");
  savedMachineCode = savedMachineCode.filter(function(e){return e}); 
  let fixedsavedMachineCode = new Array(savedMachineCode.length);
  let savedDataMemory = new Array(16);

  //Add 0's to fill the code memory up with length of instructions
  let iMemLength = 32;
  if (fixedsavedMachineCode.length > 32) {
    iMemLength = 64;
  }

  for(let i = 0; i < iMemLength; i++ ){
    if(i < savedMachineCode.length){
      fixedsavedMachineCode[i] = savedMachineCode[i];
    }else{
      fixedsavedMachineCode[i] = "0000000000000000";
    }
  }

  savedInstructions.splice(0,codeSegmentStart);
  for(let i = 0; i < savedInstructions.length; i++){
    savedInstructions[i] = removeEmpty(savedInstructions[i]);
  }


  //Fill in the data memory and convert to binary
  for(let i =0; i< savedDataMemory.length; i++){
    if(i<dataValues.length){
      savedDataMemory[i] = convertStringToBinary(dataValues[i]);
    }else{
      savedDataMemory[i] = "00000000";
    }
  }
  sessionStorage.setItem("savedDataMemory", JSON.stringify(savedDataMemory));
  //Save user code high and low->

  let saveUserCodeHigh = createUserCodeHigh();
  let saveUserCodeLow = createUserCodeLow();
  let saveUserData = createUserData();

  let saveBios = createBios();

  let instructionMemory = new Array(64);

  if (fixedsavedMachineCode.length > 32) {
    instructionMemory = fixedsavedMachineCode;
  }

  else {
    instructionMemory = saveBios.concat(fixedsavedMachineCode);
  }

  //console.log(savedInstructions);
  //console.log(fixedsavedMachineCode);
  sessionStorage.setItem("savedMachineCode", JSON.stringify(fixedsavedMachineCode));
  sessionStorage.setItem("savedInstructions", JSON.stringify(savedInstructions));
  
  sessionStorage.setItem("savedUserCodeHigh", JSON.stringify(saveUserCodeHigh));
  sessionStorage.setItem("savedUserCodeLow", JSON.stringify(saveUserCodeLow));
  sessionStorage.setItem("savedUserData", JSON.stringify(saveUserData));
 
  sessionStorage.setItem("savedBios", JSON.stringify(saveBios));

  sessionStorage.setItem("instructionMemory", JSON.stringify(instructionMemory));
}


function fillDataMemoryTable(){
  const dataSpots = ["0000", "0001", "0010", "0011", "0100","0101","0110", "0111","1000", "1001", "1010", "1011","1100", "1101", "1110","1111"];
 
   //2D array. If [][].length > 1 variable is an array
   //console.log(formattedVariables);

  //Fill in table
  for(let i =0; i < 16; i++){
    //Add a row after the header (Thats why plus 1)
    let row = document.getElementById("dataTable").insertRow(i+1);

    let columnOne = row.insertCell(0);
    let columnTwo = row.insertCell(1);
    let columnThree = row.insertCell(2);

    //Pull Data from memory since it is already formatted
    let savedData = JSON.parse(sessionStorage.getItem("savedDataMemory"));
    columnOne.innerHTML = dataSpots[i];
    columnTwo.innerHTML = savedData[i];
    if(i < formattedVariables.length){
      columnThree.innerHTML = formattedVariables[i];
    }
    

  }

  
}

//Format Variables
function formatVariables(){
  
  let groupedVariables = new Array();
  let groupCount =0;
 
  //Add the first element
  groupedVariables.push(new Array());
 
  //Group variables together in arrays
  for(let i=0; i < varibleNames.length; i++){
    if(i+1 < varibleNames.length){
      if(varibleNames[i].localeCompare(varibleNames[i+1]) == 0){
        groupedVariables[groupCount].push(varibleNames[i]);
        
      }else if(varibleNames[i].localeCompare(varibleNames[i-1]) == 0){
        groupedVariables[groupCount].push(varibleNames[i]);
        groupedVariables.push(new Array());
        groupCount++;
      }else{
        groupedVariables.push(new Array());
        groupedVariables[groupCount].push(varibleNames[i]);
        groupCount++;
      }
    }else{
      if(varibleNames[i].localeCompare(varibleNames[i-1]) == 0){
        groupedVariables[groupCount].push(varibleNames[i]);
      }else{
        groupedVariables.push(new Array());
        groupCount++;
        groupedVariables[groupCount].push(varibleNames[i]);
      }
    }
  }

  //Add brackets to arrays
  for(let i =0; i < groupedVariables.length; i++){
    let arrayCount = 0;
    if(groupedVariables[i].length > 1){
      for(let j = 0; j < groupedVariables[i].length; j++){
        groupedVariables[i][j] += "[" + arrayCount + "]";
        arrayCount++;
      }
    }
  }

  //Combine array
  let finalVariables = new Array();
  for(let i =0; i < groupedVariables.length; i++ ){
    for(let j =0; j < groupedVariables[i].length; j++){
      finalVariables.push(groupedVariables[i][j]);
    }
  }
  return finalVariables;
}

function reset(){
 withComments = "";
codeSegmentStart = "";
withoutComments = new Array();
branchDest = new Map();
valueMapping = new Map();
lineNumber = 0;
dataLocation = 0;
arrayNames = new Array();
dataValues = new Array();
varibleNames = new Array();
printBranch = 0;
savedInstructions = new Array();
formattedVariables = "";
machineCode = "";
errorTableCount = 0;


let tableAssembly = document.getElementById("assemblyTable");
//or use :  var table = document.all.tableid;

for(let i = tableAssembly.rows.length - 1; i >= 0; i--)
{
  tableAssembly.deleteRow(i);
}
let tableMachine = document.getElementById("machineTable");
//or use :  var table = document.all.tableid;

for(let i = tableMachine.rows.length - 1; i >= 0; i--)
{
  tableMachine.deleteRow(i);
}
let tableData = document.getElementById("dataTable");
for(let i = tableData.rows.length - 1; i >= 1; i--)
{
  tableData.deleteRow(i);
}

let tableError = document.getElementById("ErrorTable");
for(let i = tableError.rows.length - 1; i >= 1; i--)
{
  tableError.deleteRow(i);
}
document.getElementById("ErrorTable").style.display = "none";
document.getElementById("assemblyTable").style.display = "block";
  document.getElementById("machineTable").style.display = "block";
  document.getElementById("displayAssemblytext").style.display = "block";
  document.getElementById("displayMachinetext").style.display = "block";
  document.getElementById("displayErrorText").innerHTML = "";
  document.getElementById("toggleSyntax").value = "Syntax Highlighting: ON";

}