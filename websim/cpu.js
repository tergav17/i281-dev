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
	
	alu_res: 0,				// ALU Result
	alu_flags: [0, 0, 0, 0],// ALU Flags
	
	
	ctrl: []				// Control Lines
};
 
// CPU memory init
cpu_state.imem = new Array(128 + 128 * 256).fill(0); // Allocation space for bios and user banks
cpu_state.dmem = new Array(128 * 256).fill(0); // Same thing for data memory banks
cpu_state.ctrl = new Array(24).fill(0); // Init control lines

/*
 * Fetch a byte from data memory
 */
function data_fetch(cpu, addr) {
	return cpu.dmem[128 * cpu.data_bank];
}