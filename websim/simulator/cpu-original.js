

import {RegisterFile} from "./registerFile.js"
import {Multiplexer} from "./mux.js"
import {Alu} from "./alu.js"
import {OpCodeDecoder} from "./opCodeDecoder.js"
import {Control} from "./control.js"
import {PC} from "./pc.js"

/**
 * This class simulates a single cycle cpu.
 * @since 1.0
 * @author Bryce Snell
 * 
*/
export class CPU {
    constructor() {
        let iMemSize = 64;
        // The constructor will create a processor object with all needed subcomponents
        this.pc = new PC(iMemSize);  // Matches the iMem size.
        this.iMem = new RegisterFile(16, iMemSize);
        this.ocd = new OpCodeDecoder();
        this.control = new Control();
        this.registers = new RegisterFile(8, 4);
        this.dMem = new RegisterFile(8, 32);  // Unsure if this is the total size (but I think so)
        this.flags = new RegisterFile(1, 4);

        this.regMux0 = new Multiplexer(4);
        this.regMux1 = new Multiplexer(4);

        this.aluSourceMux = new Multiplexer(2);

        this.alu = new Alu();

        this.aluResultMux = new Multiplexer(2);

        this.dmemInputMux = new Multiplexer(2);

        this.regWritebackMux = new Multiplexer(2);

        this.switchInput = Array(16);
        
        this.progName; //This is for the name of the program/file

        this.instructions; // These will be the instructions, just make it an array, indexed at 0. That will make them line up with the iMem.

        this.dMemComments;
    }

    /**
     * Call this function to initalize the CPU object with values from the assembler. 
     * This confirms that there are defined values throughout the processor.
     */
    setup() {
        // Initialize the register files
        this.registers.initialize();
        this.flags.initialize();
        
        if(sessionStorage.getItem("fileName")==null){
            this.progName="BubbleSort";
        }
        else{
            this.progName=sessionStorage.getItem("fileName");
        }

        if (sessionStorage.getItem("instructionMemory") === null) {
            this.bubbleSortDefault()
        }
        if (sessionStorage.getItem("savedVariable")==null){
            this.dMemComments = ["array[0]","array[1]","array[2]","array[3]","array[4]","array[5]","array[6]","array[7]","last","temp"];
        }
        else {
            let fullInstructions = new Array(32)
            var userInstructions = JSON.parse(sessionStorage.getItem("savedInstructions"));  // Load text for of instructions from assembler

            if(userInstructions.length<32){
                for(var i=0; i<32; i++){
                    if(i==1){
                        let inst = ["JUMP", "30"];
                        fullInstructions[i]=inst;
                    }
                    else{
                        let inst = ["NOOP"];
                        fullInstructions[i]=inst;
                    }
                }
                fullInstructions = fullInstructions.concat(userInstructions);

                this.instructions = fullInstructions;
            }

            else{
                this.instructions=userInstructions;
            }
            if(this.progName=="BiosSwitches"){
                var machineCode = JSON.parse(sessionStorage.getItem("instructionMemory")).slice(32)
                var asmInstructions = JSON.parse(sessionStorage.getItem("savedInstructions"));
                for(var i=0; i<32; i++){
                    machineCode.push("0000000000000000")
                    asmInstructions.push(["NOOP"])
                }
                this.iMem.registers=machineCode;
                this.instructions=asmInstructions;
            }

            else this.iMem.registers = JSON.parse(sessionStorage.getItem("instructionMemory"));  // Load bios from assembler
            this.dMem.registers = JSON.parse(sessionStorage.getItem("savedDataMemory")); // Load dMem from assembler
            this.dMemComments = sessionStorage.getItem("savedVariable").split(",");
        }
    }

    /**
     * This function simulates the processor running for one cycle
     * @since 1.0
     * @author Bryce Snell
     * 
    */
    singleCycle() {
        // ====================
        // FETCH
        // ====================

        // Get the pc
        let pc = this.pc.getPC();

        // Fetch the opcode from iMem
        let opcode = this.iMem.getRegister(pc);

        // ====================
        // DECODE
        // ====================

        // Decode the opcode
        let decodedOpcode = this.ocd.getDecodedOpCode(opcode);

        // Process the control signals
        this.control.setControl(decodedOpcode, this.flags.getRegister(3), this.flags.getRegister(2), this.flags.getRegister(1));
        let controlSignals = this.control.getControl();
        
        // Set the muxes in the correct state (These won't really be used in the sim, they are just for display)
        let c4c5 = parseInt(this.control.get('c4c5'),2);
        let c6c7 = parseInt(this.control.get('c6c7'),2);
        this.regMux0.setState(c4c5);
        this.regMux1.setState(c6c7);

        // Setup the registers' mux sources
        // Idea, these values are never uses. This might be needed for the display, but if not, cut here.
        for(var i=0; i < 4; i++) {
            this.regMux0.setSource(i, this.registers.getRegister(i));
            this.regMux1.setSource(i, this.registers.getRegister(i));
        }

        // ====================
        // Execute
        // ====================

        // Update the mux for the alu (I purposely avoided using the muxes which frees them)
        this.aluSourceMux.setSource(0, this.registers.getRegister(c6c7));
        this.aluSourceMux.setSource(1, opcode.substring(8,17));

        // Set the state of the multiplexer before the alu.
        this.aluSourceMux.setState(controlSignals[11]);

        // Setup the alu inputs and get the result
        let aluOpA = this.registers.getRegister(c4c5);
        let aluOpB = this.aluSourceMux.getOutput();
        this.alu.setOps(aluOpA, aluOpB);
        this.alu.process(this.control.get('c12c13'));
        
        // Update flags
        this.flags.setWriteEnable(controlSignals[14]);
        this.flags.setRegister(0, this.alu.carry);
        this.flags.setRegister(1, this.alu.overflow);
        this.flags.setRegister(2, this.alu.negative);
        this.flags.setRegister(3, this.alu.zero);

        // Handle post mux alu
        this.aluResultMux.setSource(0, this.alu.result);
        this.aluResultMux.setSource(1, opcode.substring(8,17));
        this.aluResultMux.setState(controlSignals[15]);
        let aluResultMuxOutput = this.aluResultMux.getOutput();

        // ====================
        // MEMORY
        // ====================
        //Get switch values
        for(i=0; i<16; i++) {
            this.switchInput[i] = document.getElementById(`bit${(i+2).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false})}`).checked ? 1 : 0;
        }

        // Calculate dmem address
        let dmemAddr = parseInt(aluResultMuxOutput.substring(4,8),2);

        // Update dmem input mux
        this.dmemInputMux.setSource(0, this.registers.getRegister(c6c7));
        this.dmemInputMux.setSource(1, this.switchInput.join('').substring(8));
        this.dmemInputMux.setState(controlSignals[16]);

        // Update dmem
        this.dMem.setWriteEnable(controlSignals[17]);
        this.dMem.setRegister(dmemAddr, this.dmemInputMux.getOutput());     

        // Calculate imem address
        let imemAddr = parseInt(aluResultMuxOutput.substring(2), 2);

        // Update imem
        this.iMem.setWriteEnable(controlSignals[1]);
        this.iMem.setRegister(imemAddr, this.switchInput.join(''));

        // ====================
        // WRITEBACK
        // ====================

        // Update the final mux
        this.regWritebackMux.setSource(0, aluResultMuxOutput);
        this.regWritebackMux.setSource(1, this.dMem.getRegister(dmemAddr));
        this.regWritebackMux.setState(controlSignals[18]);
        let writebackResult = this.regWritebackMux.getOutput();

        // Update registers
        this.registers.setWriteEnable(controlSignals[10]);
        let targetRegister = parseInt(this.control.get('c8c9'), 2);
        this.registers.setRegister(targetRegister, writebackResult);
        
        // Update pc
        this.pc.process(opcode, controlSignals[2]);
    }

    bubbleSortDefault() {
        this.iMem.registers = [
            "0000000000000000",
            "1110000000011110",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0011000000000000",
            "1000110000001000",
            "0011010000000000",
            "1101001100000000",
            "1111001100001110",
            "1000110000001000",
            "0110110000000000",
            "1101011100000000",
            "1111001100001000",
            "1001100100000000",
            "1001110100000001",
            "1101111000000000",
            "1111001100000010",
            "1011110100000000",
            "1011100100000001",
            "0101010000000001",
            "1110000011110100",
            "0101000000000001",
            "1110000011101110",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000"
        ]

        this.dMem.registers = [
            "00000111",
            "00000011",
            "00000010",
            "00000001",
            "00000110",
            "00000100",
            "00000101",
            "00001000",
            "00000111",
            "00000000",
            "00000000",
            "00000000",
            "00000000",
            "00000000",
            "00000000",
            "00000000"
        ]

        this.instructions = [

            ["NOOP"],
            ["JUMP", "30"],
            ["NOOP"],
            ["NOOP"],
            ["NOOP"],
            ["NOOP"],
            ["NOOP"],
            ["NOOP"],
            ["NOOP"],
            ["NOOP"],
            ["NOOP"],
            ["NOOP"],
            ["NOOP"],
            ["NOOP"],
            ["NOOP"],
            ["NOOP"],
            ["NOOP"],
            ["NOOP"],
            ["NOOP"],
            ["NOOP"],
            ["NOOP"],
            ["NOOP"],
            ["NOOP"],
            ["NOOP"],
            ["NOOP"],
            ["NOOP"],
            ["NOOP"],
            ["NOOP"],
            ["NOOP"],
            ["NOOP"],
            ["NOOP"],
            ["NOOP"],
            [
                "LOADI",
                "A",
                "0"
            ],
            [
                "LOAD",
                "D",
                "[last]"
            ],
            [
                "LOADI",
                "B",
                "0"
            ],
            [
                "CMP",
                "A",
                "D"
            ],
            [
                "BRGE",
                "End"
            ],
            [
                "LOAD",
                "D",
                "[last]"
            ],
            [
                "SUB",
                "D",
                "A"
            ],
            [
                "CMP",
                "B",
                "D"
            ],
            [
                "BRGE",
                "Iinc"
            ],
            [
                "LOADF",
                "C",
                "[array+B]"
            ],
            [
                "LOADF",
                "D",
                "[array+B+1]"
            ],
            [
                "CMP",
                "D",
                "C"
            ],
            [
                "BRGE",
                "Jinc"
            ],
            [
                "STOREF",
                "[array+B]",
                "D"
            ],
            [
                "STOREF",
                "[array+B+1]",
                "C"
            ],
            [
                "ADDI",
                "B",
                "1"
            ],
            [
                "JUMP",
                "Inner"
            ],
            [
                "ADDI",
                "A",
                "1"
            ],
            [
                "JUMP",
                "Outer"
            ],
            [
                "NOOP"
            ]
        ]
    }
};