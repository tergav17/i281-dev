/*
 * cpu.js
 *
 * i281 emulation backend
 */
 
cpu_state = {
	imem: [],				// Instruction Memory
	dmem: [],				// Data Memory
	bios: [],				// BIOS Memory
	
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
	port1: 0,				// Register Port 1
	
	c11_out: 0,				// Mux C11 Output
	c15_out: 0,				// Mux C15 Output
	c16_out: 0,				// Mux C16 Output
	c18_out: 0,				// Mux C18 Output
	
	alu_result: 0,			// ALU Result
	flags: [0, 0, 0, 0],	// ALU Flags
	tflags: [0, 0, 0, 0],	// ALU Transient Flags
	
	segments: [],			// 7-Segment Display Contents
	game: false,			// Game Mode
	switches: 0x0000,		// Switch Registers
	
	ctrl: []				// Control Lines
};
 
// CPU memory init
cpu_state.imem = new Array(128 * 256).fill(0); // Allocation space for user banks
cpu_state.dmem = new Array(128 * 256).fill(0); // Same thing for data memory banks
cpu_state.ctrl = new Array(24).fill(0); // Init control lines
cpu_state.segments = new Array(8).fill(0xFF); // Init 7-segment displays


// BIOS ROM selector
// it's jank, but mere mortals really shouldn't be messing with this anyways
bios_select = 1;

if (bios_select == 0) {
	// Standard BIOS ROM
	// Setup BIOS
	cpu_state.bios = [
	//	0x01	0x01	0x02	0x03	0x04	0x05	0x06	0x07
		0xFF0B,	0xFF3A,	0xFF55,	0xFF58,	0xFF5B,	0xFF5B,	0xFF5D,	0xFF52, // 0x00
		0x3001,	0x0000,	0x3000,	0xFF73,	0x380E,	0xFF19,	0x3001,	0xA0A1, // 0x08
		0x30EF,	0xA0A7,	0x3814,	0xFF13,	0x3082,	0xA0A1,	0x30EF,	0xA0A7, // 0x10
		0x3400,	0xA4A3,	0xA4A4,	0xA4A5,	0x30E0,	0xA0A6,	0x3001,	0xA0A2, // 0x18
		0x0000,	0xA080,	0x3824,	0xFF03,	0x3020,	0xA0A7,	0x382D,	0x80A7, // 0x20
		0x4000,	0xF0FD,	0x4000,	0xF1FB,	0xFED3,	0x80A0,	0x5401,	0xF5FD, // 0x28
		0x3400,	0x80A0,	0xB100,	0x5401,	0xF5FC,	0x80A0,	0x1400,	0x80A0, // 0x30
		0x1600,	0x5401,	0xF4FA,	0xFF44,	0x8090,	0x3080,	0xA093,	0x300C, // 0x38
		0xA090,	0x3400,	0xA491,	0x3003,	0xA093,	0x0400,	0x3848,	0xFF0B, // 0x40
		0x5401,	0xF7FC,	0x384C,	0xFF07,	0x1400,	0x384F,	0xFF04,	0x1680, // 0x48
		0x5401,	0xF5F8,	0xFF2D,	0x8095,	0xC100,	0xF1FD,	0x8090,	0xFEA8, // 0x50
		0x0400,	0xFEA6,	0x0800,	0x1600,	0x9B01,	0x0800,	0x9B00,	0xFEA0, // 0x58
		0xBB00,	0x3800,	0x0800,	0xFF1C,	0x0000,	0x3000,	0xA080,	0xA87E, // 0x60
		0xAC7F,	0x3C80,	0xA480,	0x3800,	0x9200,	0x1400,	0x9201,	0xC900, // 0x68
		0x4B00,	0x1A00,	0x6B00,	0x4A00,	0x5802,	0xF5F6,	0x5401,	0x5C40, // 0x70
		0xF4F1,	0x3000,	0xA080,	0x887E,	0x8C7F,	0x0C00,	0xFE81,	0xFFFF  // 0x78
	];
}



if (bios_select == 1) {
	// MONITOR ROM
	// Setup BIOS
	cpu_state.bios = [
	//	0x01	0x01	0x02	0x03	0x04	0x05	0x06	0x07
		0x3080,	0xA093,	0x300C,	0xA090,	0x3000,	0xA091,	0x3003,	0xA093, // 0x00
		0x300A,	0x380B,	0xFF40,	0x300D,	0x380E,	0xFF3D,	0x3040,	0x3811, // 0x08
		0xFF3A,	0x3813,	0xFF3F,	0x3815,	0xFF3D,	0x3817,	0xFF2B,	0x702D, // 0x10
		0xF61A,	0x7002,	0xF610,	0x700E,	0xF609,	0x7005,	0xF604,	0x7005, // 0x18
		0xF7E7,	0x2B00,	0xFEDD,	0x0C00,	0xAC80,	0xFFE2,	0x9F00,	0x3829, // 0x20
		0xFF43,	0x3808,	0xFF41,	0xAC97,	0x382E,	0xFF24,	0x3830,	0xFF22, // 0x28
		0x8097,	0xBC00,	0xFFD5,	0xAC97,	0x3836,	0xFF1C,	0x3838,	0xFF1A, // 0x30
		0x2300,	0x1400,	0x383C,	0xFF16,	0x383E,	0xFF14,	0x2300,	0x8C97, // 0x38
		0x1E00,	0xFFC6,	0x8095,	0xC100,	0xF1FD,	0x8090,	0x5020,	0xF501, // 0x40
		0x7020,	0x7020,	0xFF05,	0x8495,	0x4500,	0x4500,	0x4500,	0xF1FB, // 0x48
		0xA090,	0xFEAE,	0x2600,	0x3855,	0xFFED,	0x2900,	0x4F00,	0x4F00, // 0x50
		0x4F00,	0x4F00,	0x3430,	0xD100,	0xF1AB,	0x3439,	0xD100,	0xF803, // 0x58
		0x7030,	0x4C00,	0xFE9D,	0x3441,	0xD100,	0xF1A2,	0x3446,	0xD100, // 0x60
		0xF89F,	0x7037,	0x4C00,	0xFE94,	0x30F0,	0x4F00,	0xF003,	0x4000, // 0x68
		0xF4FC,	0xFF03,	0x4000,	0x5001,	0xF4F8,	0x700A,	0xF402,	0x5041, // 0x70
		0xFFD2,	0x503A,	0xFFD0,	0x0000,	0x0000,	0x0000,	0x0000,	0x0000  // 0x78
	];
}


if (bios_select == 2) {
	// CMDIAG ROM
	// Setup BIOS
	cpu_state.bios = [
	//	0x01	0x01	0x02	0x03	0x04	0x05	0x06	0x07
		0xFF01,	0xFF13,	0x8CF0,	0x1208,	0x8808,	0xC900,	0xF105,	0xC900, // 0x00
		0xF1FA,	0xC900,	0xF02A,	0xFF12,	0x3000,	0xA003,	0xA007,	0xA001, // 0x08
		0x1208,	0x8808,	0xC900,	0xF1FC,	0xFF15,	0x8403,	0xD100,	0xF7EA, // 0x10
		0x1208,	0x8808,	0xC900,	0xC900,	0xC900,	0xF017,	0x8003,	0x5001, // 0x18
		0xA003,	0xF113,	0x8005,	0x5001,	0xA005,	0x70FF,	0xF70E,	0x8007, // 0x20
		0x5001,	0xA007,	0x3880,	0x8407,	0x0400,	0x3020,	0x1400,	0x3000, // 0x28
		0x1A00,	0x5801,	0xF4FA,	0x3080,	0xA005,	0x8801,	0x5801,	0xA801, // 0x30
		0x3807,	0x9200,	0xC100,	0xC100,	0xC100,	0xC100,	0xB2FF,	0x7802, // 0x38
		0xF5F8,	0x8407,	0x0400,	0x3030,	0x1400,	0x8003,	0x8805,	0x1A00, // 0x40
		0x30FF,	0x1400,	0x6200,	0x1A01,	0x0401,	0x2000,	0x2000,	0x8003, // 0x48
		0x5001,	0x8CE0,	0x0400,	0xFEAC,	0x0000,	0x0000,	0x0000,	0x0000, // 0x50
		0x0000,	0x0000,	0x0000,	0x0000,	0x0000,	0x0000,	0x0000,	0x0000, // 0x58
		0x0000,	0x0000,	0x0000,	0x0000,	0x0000,	0x0000,	0x0000,	0x0000, // 0x60
		0x0000,	0x0000,	0x0000,	0x0000,	0x0000,	0x0000,	0x0000,	0x0000, // 0x68
		0x0000,	0x0000,	0x0000,	0x0000,	0x0000,	0x0000,	0x0000,	0x0000, // 0x70
		0x0000,	0x0000,	0x0000,	0x0000,	0x0000,	0x0000,	0x0000,	0x0000  // 0x78
	];
}


// Lookup table to draw 7-segment display numbers
const BIN_TO_HEX = [
	0b00111111,	// 0
	0b00000110,	// 1
	0b01011011,	// 2
	0b01001111,	// 3
	0b01100110,	// 4
	0b01101101,	// 5
	0b01111101,	// 6
	0b00000111,	// 7
	0b01111111,	// 8
	0b01101111,	// 9
	0b01110111,	// A
	0b01111100,	// b
	0b00111001,	// C
	0b01011110,	// d
	0b01111001,	// E
	0b01110001	// F
];

function binToHex(bin) {
	return BIN_TO_HEX[bin];
}


// Control line values
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

const FLAG_Z = 0;
const FLAG_N = 1;
const FLAG_O = 2;
const FLAG_C = 3;


/*
 * Takes the currently propagated instruction and updates all registers
 * Data memory will also be polled here
 * 
 * Final part of instruction execution
 */
function latch(cpu, extern) {
	// Update C18 output to include a data fetch
	cpu.c18_out = (cpu.ctrl[REG_WRITEBACK_MUX] ? dataFetch(cpu, cpu.c15_out) : cpu.c15_out);
	
	// Write into instruction memory
	if (cpu.ctrl[IMEM_WRITE_ENABLE] && (cpu.pc < 0x80 || extern)) {
		isrStore(cpu, cpu.select, cpu.write_out);
	}
	
	// Update next PC (fr this time)
	if (cpu.ctrl[PROGRAM_COUNTER_MUX]) {
		cpu.pc_next = (cpu.pc + 1 + cpu.c18_out) & 0xFF;
	} else {
		cpu.pc_next = (cpu.pc + 1) & 0xFF;
	}
	cpu.pc = cpu.pc_next;
	
	// Update isr bank module
	if (cpu.ctrl[IMEM_BANK]) {
		cpu.isr_bank = cpu.c15_out;
	}
	
	// Update ALU flags
	if (cpu.ctrl[FLAGS_WRITE_ENABLE]) {
		cpu.flags[0] = cpu.tflags[0];
		cpu.flags[1] = cpu.tflags[1];
		cpu.flags[2] = cpu.tflags[2];
		cpu.flags[3] = cpu.tflags[3];
	}
	
	// Update registers
	if (cpu.ctrl[REGISTERS_WRITE_ENABLE]) {
		cpu.regs[(cpu.ctrl[WRITE_PORT]<<1) + cpu.ctrl[WRITE_PORT+1]] = cpu.c18_out;
	}
	
	// Update data memory
	if (cpu.ctrl[DMEM_WRITE_ENABLE]) {
		dataStore(cpu, cpu.c15_out, cpu.c16_out);
	}
	
	// Update write cache
	if (cpu.ctrl[WRITEBACK_ENABLE]) {
		cpu.write_cache = cpu.port1;
	}
}

/*
 * Propagates a new instruction into the processor
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
	
	// Update ports
	cpu.port0 = cpu.regs[(cpu.ctrl[PORT_0]<<1) + cpu.ctrl[PORT_0+1]];
	cpu.port1 = cpu.regs[(cpu.ctrl[PORT_1]<<1) + cpu.ctrl[PORT_1+1]];
	
	// Update Mux C11
	cpu.c11_out = (cpu.ctrl[ALU_SOURCE_MUX] ? imm : cpu.port1);
	
	// Start by passing values through the adder
	// We do this regardless to accurately emulate the overflow flag
	let alu_a = cpu.port0;
	let alu_b = cpu.c11_out;
	let cin = 0;
	
	// Twos complement
	if (cpu.ctrl[ALU_SELECT + 1]) {
		alu_b = (~alu_b) & 0xFF;
		cin = 1;
	}
	
	let alu_s = alu_a + alu_b + cin;
	
	// Carry?
	let alu_carry = (alu_s > 255 ? 1 : 0);
	
	// Get it back into range
	alu_s &= 0xFF;
	
	// Overflow?
	cpu.tflags[FLAG_O] = ((((~(alu_a ^ alu_b)) & (alu_a ^ alu_s)) & 0x80) ? 1 : 0);
	
	// Update ALU
	if (cpu.ctrl[ALU_SELECT]) {
		cpu.alu_result = alu_s;
		cpu.tflags[FLAG_C] = alu_carry;
	} else {
		// Bit Operations
		if (cpu.ctrl[ALU_SELECT + 1]) {
			// Shift Right
			cpu.tflags[FLAG_C] = ((alu_a & 0x01) ? 1 : 0);
			cpu.alu_result = (alu_a >> 1) & 0xFF;
		} else {
			// Shift Left
			cpu.tflags[FLAG_C] = ((alu_a & 0x80) ? 1 : 0);
			cpu.alu_result = (alu_a << 1) & 0xFF;
		}
	}
	cpu.tflags[FLAG_Z] = (cpu.alu_result ? 0 : 1);
	cpu.tflags[FLAG_N] = (cpu.alu_result > 127 ? 1 : 0);
	
	// Update Mux C15
	cpu.c15_out = (cpu.ctrl[ALU_RESULT_MUX] ? imm : cpu.alu_result);
	cpu.select = cpu.c15_out;
	
	// Update Mux C16
	cpu.c16_out = (cpu.ctrl[DMEM_INPUT_MUX] ?  cpu.switches & 0xFF : cpu.port1);
	
	// Update Mux C18
	// This isn't the actual value, it will need to be refetched during the latch
	cpu.c18_out = (cpu.ctrl[REG_WRITEBACK_MUX] ? 0 : cpu.c15_out);

	
	// Update next PC
	if (cpu.ctrl[PROGRAM_COUNTER_MUX]) {
		cpu.pc_next = (cpu.pc + 1 + cpu.c18_out) & 0xFF;
	} else {
		cpu.pc_next = (cpu.pc + 1) & 0xFF;
	}
	
	// Update Code WRITEBACK_ENABLE
	if (cpu.ctrl[WRITEBACK_ENABLE]) {
		cpu.write_out = (cpu.write_cache << 8) + cpu.port1; 
	} else {
		cpu.write_out = cpu.switches;
	}
}

// Used for disassembly
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
    let flagZ = flags[FLAG_Z];
    let flagN = flags[FLAG_N];
    let flagO = flags[FLAG_O];
    let flagC = flags[FLAG_C];
	
	let mnem = "?";
	
	// Decode instruction
	if (opcode == 0x0) { // BANK
	
		// Set control path
		out[IMEM_BANK] = 1;
		out[ALU_SOURCE_MUX] = 1;
		
		// Set ports
		setPort(out, PORT_0, opB);
		setPort(out, ALU_SELECT, ALU_OP_ADD);
	
		return "BANK " + REGS[opB] + "+" + imm;
	}
	
	if (opcode == 0x1) { //  INPUTC / INPUTCF / INPUTD / INPUTDF / CACHE / WRITE

		// Get sub-instruction
		if (opA == 0) { 
			if (opB == 0) { // INPUTC 
				out[IMEM_WRITE_ENABLE] = 1;
				out[ALU_RESULT_MUX] = 1;
				mnem = "INPUTC [" + imm + "]";
			} else { // CACHE
				out[WRITEBACK_ENABLE] = 1;
				out[ALU_SOURCE_MUX] = 1;
				setPort(out, ALU_SELECT, ALU_OP_ADD);
				setPort(out, PORT_0, opB);
				mnem = "CACHE A";
			}
		}
			
		if (opA == 1) { // INPUTCF
			out[IMEM_WRITE_ENABLE] = 1;
			out[ALU_SOURCE_MUX] = 1;
			setPort(out, ALU_SELECT, ALU_OP_ADD);
			mnem = "INPUTCF [" + REGS[opB] + "+" + imm + "]";
		}

		if (opA == 2) { 
			if (opB == 0) { // INPUTD
				out[ALU_RESULT_MUX] = 1;
				out[DMEM_INPUT_MUX] = 1;
				out[DMEM_WRITE_ENABLE] = 1;
				mnem = "INPUTD [" + imm + "]";
			} else { // WRITE
				out[IMEM_WRITE_ENABLE] = 1;
				out[WRITEBACK_ENABLE] = 1;
				out[ALU_SOURCE_MUX] = 1;
				setPort(out, ALU_SELECT, ALU_OP_ADD);
				setPort(out, PORT_0, opB);
				mnem = "WRITE [" + REGS[opB] + "+" + imm + "],A";
			}
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
	
	if (opcode == 0xE) { // NOOP
		return "NOOP";
	}
	
	if (opcode == 0xF) { // BRANCH GROUP
    
        // Set ALU result mux
        out[ALU_RESULT_MUX] = 1;
    
        // Get sub-instruction
		mnem = "? ";
		
		if (operand == 0x0) { // BRC (BRAE)
			mnem = "BRC ";
            if (flagC == 1)
                out[PROGRAM_COUNTER_MUX] = 1;
		}
		
		else if (operand == 0x1) { // BRNC (BRB)
			mnem = "BRNC ";
            if (flagC == 0)
                out[PROGRAM_COUNTER_MUX] = 1;
		}
		
		else if (operand == 0x2) { // BRO
			mnem = "BRO ";
            if (flagO == 1)
                out[PROGRAM_COUNTER_MUX] = 1;
		}
		
		else if (operand == 0x3) { // BRNO
			mnem = "BRNO ";
            if (flagO == 0)
                out[PROGRAM_COUNTER_MUX] = 1;
		}
		
		else if (operand == 0x4) { // BRN
			mnem = "BRN ";
            if (flagN == 1)
                out[PROGRAM_COUNTER_MUX] = 1;
		}
		
		else if (operand == 0x5) { // BRNN (BRP)
			mnem = "BRNN ";
            if (flagN == 0)
                out[PROGRAM_COUNTER_MUX] = 1;
		}
		
        else if (operand == 0x6) { // BRE (BRZ)
			mnem = "BRZ ";
            if (flagZ == 1)
                out[PROGRAM_COUNTER_MUX] = 1;
		}
                
        else if (operand == 0x7) { // BRNE (BRNZ)
			mnem = "BRNZ ";
            if (flagZ == 0)
                out[PROGRAM_COUNTER_MUX] = 1;
        }
		
		else if (operand == 0x8) { // BRA
			mnem = "BRA ";
            if (flagZ == 0 && flagC == 1)
                out[PROGRAM_COUNTER_MUX] = 1;
		}
                
        else if (operand == 0x9) { // BRBE
			mnem = "BRBE ";
            if (flagZ == 1 || flagC == 0)
                out[PROGRAM_COUNTER_MUX] = 1;
        }
				
        else if (operand == 0xA) { // BRG
			mnem = "BRG ";
            if (flagZ == 0 && flagO == flagN)
                out[PROGRAM_COUNTER_MUX] = 1;
        }
			
        else if (operand == 0xB) { // BRGE
			mnem = "BRGE ";
            if (flagO == flagN)
                out[PROGRAM_COUNTER_MUX] = 1;
		}
		
		else if (operand == 0xC) { // BRL
			mnem = "BRL ";
            if (flagO != flagN)
                out[PROGRAM_COUNTER_MUX] = 1;
        }
			
        else if (operand == 0xD) { // BRLE
			mnem = "BRLE ";
            if (flagZ == 1 || flagO != flagN)
                out[PROGRAM_COUNTER_MUX] = 1;
		}
		
		else if (operand == 0xE) {
			// Jump register special!
			out[ALU_RESULT_MUX] = 0;
			out[ALU_SOURCE_MUX] = 1;
			out[PROGRAM_COUNTER_MUX] = 1;
			setPort(out, ALU_SELECT, ALU_OP_ADD);
			setPort(out, PORT_0, 0x2);
			return "JUMPR C";
		}
		
		else if (operand == 0xF) {
			mnem = "JUMP ";
			out[PROGRAM_COUNTER_MUX] = 1;
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
 * Store a word into instruction memory
 */
 function isrStore(cpu, addr, val) {
	 cpu.imem[128 * cpu.isr_bank + (addr & 0x7F)] = val;
 }
 
 /*
  * Fetch a word from instruction memory
  */
function isrFetch(cpu, addr) {
	if (addr < 128) {
		return cpu.bios[addr];
	} else {
		return cpu.imem[128 * cpu.isr_bank + (addr & 0x7F)];
	}
}

/*
 * Store a byte into data memory
 */
function dataStore(cpu, addr, val) {
	val = val & 0xFF;
	
	// Does it go into a segment?
	if (addr < 8) {
		if (cpu.game) {
			cpu.segments[addr] = val;
		} else {
			cpu.segments[addr] = binToHex(val & 0xF);
		}
	}
	
	// Does it go into storage?
	if (addr < 128) {
		cpu.dmem[128 * cpu.data_bank + addr] = val;
	} else {
		// I/O Space
		ioWrite(addr, val);
	}
}

/*
 * Fetch a byte from data memory
 */
function dataFetch(cpu, addr) {
	if (addr < 128) {
		return cpu.dmem[128 * cpu.data_bank + addr];
	} else {
		// I/O Space
		return ioRead(addr);
	}
}

// Initalize CPU
propagate(cpu_state, cpu_state.bios[0]);