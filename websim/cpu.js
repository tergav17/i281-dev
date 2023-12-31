/*
 * cpu.js
 *
 * i281 emulation backend
 */
 
cpu_state = {
	imem: [],				// Instruction Memory
	dmem: [],				// Data Memory
	
	
	isr: 0,					// Current Instruction
	isr_mnem: "NOOP",		// Instruction Mnemonic
	
	select: 0,				// Write Select Address
	write_out: 0,			// Writeback Output
	write_cache: 0,			// Writeback Cache
	
	pc:	0,					// Program Counter
 	pc_next: 0,				// Next Program Counter Value
	isr_bank: 0,			// Instruction Bank
	data_bank: 0,			// Data Bank
	
	reg_next: 0,			// Register Input Value
	regs: [0, 0, 0, 0],		// Registers
	port0: 0,				// Register Port 0
	port1: 0,				// Regiter Port 1
	
	alu_result: 0,			// ALU Result
	flags: [0, 0, 0, 0],	// ALU Flags
	
	segments: [],			// 7-Segment Display Contents
	game: false,			// Game Mode
	switches: 0x0000,		// Switch Registers
	
	ctrl: []				// Control Lines
};
 
// CPU memory init
cpu_state.imem = new Array(128 + 128 * 256).fill(0); // Allocation space for bios and user banks
cpu_state.dmem = new Array(128 * 256).fill(0); // Same thing for data memory banks
cpu_state.ctrl = new Array(24).fill(0); // Init control lines
cpu_state.segments = new Array(8).fill(0); // Init 7-segment displays

/*
 * Propagates a new instruction into the processo 
 * All transient values will be updated, but no registers will change
 *
 * Nothing in this function should change the "true" state of the processor
 */
function propagate(cpu, isr) {
	
	// Set the current instruction
	cpu.isr = isr;
	
	// Get control signals
	cpu.isr_mnem = decode(cpu.ctrl, isr, cpu.flags);
	
	// Grab the immediate value
	let imm = isr & 0xFF;
}

const IMEM_BANK = 0
const IMEM_WRITE_ENABLE = 1
const PROGRAM_COUNTER_MUX = 2
const WRITEBACK_ENABLE = 3
const PORT_0 = 4
const PORT_1 = 6
const WRITE_PORT = 8
const REGISTERS_WRITE_ENABLE = 10
const ALU_SOURCE_MUX = 11
const ALU_SELECT = 12
const FLAGS_WRITE_ENABLE = 14
const ALU_RESULT_MUX = 15
const DMEM_INPUT_MUX = 16
const DMEM_WRITE_ENABLE = 17
const REG_WRITEBACK_MUX = 18

const ALU_OP_SHIFTL = 0
const ALU_OP_SHIFTR = 1
const ALU_OP_ADD = 2
const ALU_OP_SUB = 3

const REGS = ["A", "B", "C", "D"];

/*
 * Part of the propagation process
 *
 * Updates all control signals and disassembles the instruction
 */
function decode(out, isr, flags) {
	
	// Reset all control signals
	for (let i = 0; i < 24; i++)
		out[i] = 0;
	
	// Strip off the immediate value
	let imm = isr & 0xFF;
	isr = isr >> 8;
	
	// Get opcode
	let opcode = (isr & 0xF0) >> 4;
	
	// Get operand 
    let operand = isr & 0x0F;
    let opA = operand & 0x03;
    let opB = (operand & 0x0C) >> 2;
	
	// Get flags
    let flagZ = flags[0];
    let flagN = flags[1];
    let flagO = flags[2];
    let flagC = flags[3];
	
	let mnem = "?";
	
	// Decode instruction
	if (opcode == 0x0) { // NOOP
		return "NOOP";
	}
	
	if (opcode == 0x1) { //  INPUTC / INPUTCF / INPUTD / INPUTDF

		// Get sub-instruction
		if (opA == 0) { // INPUTC
			out[IMEM_WRITE_ENABLE] = 1;
			out[ALU_RESULT_MUX] = 1;
			mnem = "INPUTC [" + imm + "]";
		}
			
		if (opA == 1) { // INPUTCF
			out[IMEM_WRITE_ENABLE] = 1;
			out[ALU_SOURCE_MUX] = 1;
			setPort(out, ALU_SELECT, ALU_OP_ADD);
			mnem = "INPUTCF [" + REGS[opB] + "+" + imm + "]";
		}

		if (opA == 2) { // INPUTD
			out[ALU_RESULT_MUX] = 1;
			out[DMEM_INPUT_MUX] = 1;
			out[DMEM_WRITE_ENABLE] = 1;
			mnem = "INPUTD [" + imm + "]";
		}

		if (opA == 3) { // INPUTDF
			out[ALU_SOURCE_MUX] = 1;
			setPort(out, ALU_SELECT, ALU_OP_ADD);
			out[DMEM_INPUT_MUX] = 1;
			out[DMEM_WRITE_ENABLE] = 1;
			mnem = "INPUTDF [" + REGS[opB] + "+" + imm + "]";
		}
		
		// Set ports
		setPort(out, PORT_0, opB);
		return mnem;
	}
	
	if (opcode == 0x2) { // MOVE
		
		// Set control path
		out[REGISTERS_WRITE_ENABLE] = 1;
		out[ALU_SOURCE_MUX] = 1;
		setPort(out, ALU_SELECT, ALU_OP_ADD);
		
		// Set ports
		setPort(out, PORT_0, opA);
		setPort(out, WRITE_PORT, opB);
		
		return "MOVE " + REGS[opB] + "," + REGS[opA];
	}
	
	if (opcode == 0x3) { // LOADI / LOADP
		
		// Set control path
		out[REGISTERS_WRITE_ENABLE] = 1;
		out[ALU_RESULT_MUX] = 1;
		
		// Set ports
		setPort(out, WRITE_PORT, opB);
		
		return "LOADI " + REGS[opB] + "," + imm;
	}
	
	if (opcode == 0x4) { // ADD
	
		// Set control path
		out[REGISTERS_WRITE_ENABLE] = 1;
		setPort(out, ALU_SELECT, ALU_OP_ADD);
		out[FLAGS_WRITE_ENABLE] = 1;
		
		// Set ports
		setPort(out, PORT_0, opB);
		setPort(out, PORT_1, opA);
		setPort(out, WRITE_PORT, opB);
		
		return "ADD " + REGS[opB] + "," + REGS[opA];
	}
	
	if (opcode == 0x5) { // ADDI
	
		// Set control path
		out[REGISTERS_WRITE_ENABLE] = 1;
		out[ALU_SOURCE_MUX] = 1;
		setPort(out, ALU_SELECT, ALU_OP_ADD);
		out[FLAGS_WRITE_ENABLE] = 1;
		
		// Set ports
		setPort(out, PORT_0, opB);
		setPort(out, WRITE_PORT, opB);
		
		return "ADDI " + REGS[opB] + "," + imm;
	}
	
	if (opcode == 0x6) { // SUB
	
		// Set control path
		out[REGISTERS_WRITE_ENABLE] = 1;
		setPort(out, ALU_SELECT, ALU_OP_SUB);
		out[FLAGS_WRITE_ENABLE] = 1;
		
		// Set ports
		setPort(out, PORT_0, opB);
		setPort(out, PORT_1, opA);
		setPort(out, WRITE_PORT, opB);
		
		return "SUB " + REGS[opB] + "," + REGS[opA];
	}
	
	if (opcode == 0x7) { // SUBI
	
		// Set control path
		out[REGISTERS_WRITE_ENABLE] = 1;
		out[ALU_SOURCE_MUX] = 1;
		setPort(out, ALU_SELECT, ALU_OP_SUB);
		out[FLAGS_WRITE_ENABLE] = 1;
		
		// Set ports
		setPort(out, PORT_0, opB);
		setPort(out, WRITE_PORT, opB);
		
		return "SUBI " + REGS[opB] + "," + imm;
	}
	
	if (opcode == 0x8) { // LOAD

		// Set control path
		out[REGISTERS_WRITE_ENABLE] = 1;
		out[ALU_RESULT_MUX] = 1;
		out[REG_WRITEBACK_MUX] = 1;
		
		// Set ports
		setPort(out, WRITE_PORT, opB);
		
		return "LOAD " + REGS[opB] + ",[" + imm + "]";
	}
	
	if (opcode == 0x9) { // LOADF
	
		// Set control path
		out[REGISTERS_WRITE_ENABLE] = 1;
		out[ALU_SOURCE_MUX] = 1;
		out[REG_WRITEBACK_MUX] = 1;
		setPort(out, ALU_SELECT, ALU_OP_ADD);
		
		// Set ports
		setPort(out, PORT_0, opA);
		setPort(out, WRITE_PORT, opB);
		
		return "LOADF " + REGS[opB] + ",[" + REGS[opA] + "+" + imm + "]";
	}
	
	if (opcode == 0xA) { // STORE

		// Set control path
		out[ALU_RESULT_MUX] = 1;
		out[DMEM_WRITE_ENABLE] = 1;

		// Set ports
		setPort(out, PORT_1, opB);
		
		return "STORE [" + imm + "]," + REGS[opB];
	}
	
	if (opcode == 0xB) { // STOREF
	
		// Set control path
		out[ALU_SOURCE_MUX] = 1;
		out[DMEM_WRITE_ENABLE] = 1;
		setPort(out, ALU_SELECT, ALU_OP_ADD);
    
		// Set ports
		setPort(out, PORT_0, opA);
		setPort(out, PORT_1, opB);
		
		return "STOREF [" + REGS[opA] + "+" + imm + "]," + REGS[opB];
	}
	
	if (opcode == 0xC) { // SHIFTL / SHIFTR
		
		// Get sub-instruction
		if (opA == 0) { // SHIFTL
			out[REGISTERS_WRITE_ENABLE] = 1;
			out[FLAGS_WRITE_ENABLE] = 1;
			setPort(out, ALU_SELECT, ALU_OP_SHIFTL);
			mnem = "SHIFTL " + REGS[opB];
		}

		if (opA == 1) { // SHIFTR
			out[REGISTERS_WRITE_ENABLE] = 1;
			out[FLAGS_WRITE_ENABLE] = 1;
			setPort(out, ALU_SELECT, ALU_OP_SHIFTR);
			mnem = "SHIFTR " + REGS[opB];
		}

		// Set ports
		setPort(out, PORT_0, opB);
		setPort(out, WRITE_PORT, opB);
		
		return mnem;
	}
	
	if (opcode == 0xD) { // CMP
	
		// Set control path
		out[FLAGS_WRITE_ENABLE] = 1;
		setPort(out, ALU_SELECT, ALU_OP_SUB);
    
		// Set ports
		setPort(out, PORT_0, opB);
		setPort(out, PORT_1, opA);
		
		return "CMP " + REGS[opB] + "," + REGS[opA];
	}
	
	if (opcode == 0xE) { // JUMP
	
		// Set control path
		out[PROGRAM_COUNTER_MUX] = 1;
		out[ALU_RESULT_MUX] = 1;
		
		return "JUMP @+" + ((imm+1)&0xFF); 
	}
	
	if (opcode == 0xF) { // BRANCH GROUP
    
        // Set ALU result mux
        out[ALU_RESULT_MUX] = 1;
    
        // Get sub-instruction
		mnem = "? ";
        if (operand == 0) { // BRE (BRZ)
			mnem = "BRZ ";
            if (flagZ == 1)
                out[PROGRAM_COUNTER_MUX] = 1
		}
                
        if (operand == 1) { // BRNE (BRNZ)
			mnem = "BRNZ ";
            if (flagZ == 0)
                out[PROGRAM_COUNTER_MUX] = 1
        }
				
        if (operand == 2) { // BRG
			mnem = "BRG ";
            if (flagZ == 0 && flagO == flagN)
                out[PROGRAM_COUNTER_MUX] = 1
        }
			
        if (operand == 3) { // BRGE
			mnem = "BRGE ";
            if (flagO == flagN)
                out[PROGRAM_COUNTER_MUX] = 1
		}
                
        if (operand == 4) { // BRC
			mnem = "BRC ";
            if (flagC == 1)
                out[PROGRAM_COUNTER_MUX] = 1
		}
                
        if (operand == 5) { // BRNC
			mnem = "BRNC ";
            if (flagC == 0)
                out[PROGRAM_COUNTER_MUX] = 1
		}
               
        if (operand == 6) { // BRN
			mnem = "BRN ";
            if (flagN == 1)
                out[PROGRAM_COUNTER_MUX] = 1
		}
                
        if (operand == 7) { // BRP
			mnem = "BRP ";
            if (flagN == 0)
                out[PROGRAM_COUNTER_MUX] = 1
		}
    
        return mnem + "@+" + ((imm+1)&0xFF);
		
	}
	
	return mnem;
}

function setPort(out, port, val) {
	out[port+1] = val & 0b1;
	out[port] = (val>>1) & 0b1;
}

/*
 * Store a byte into data memory
 */
function dataStore(cpu, addr, val) {
	
}

/*
 * Fetch a byte from data memory
 */
function dataFetch(cpu, addr) {
	return cpu.dmem[128 * cpu.data_bank];
}