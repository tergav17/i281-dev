/*
 * cpu.js
 *
 * i281 emulation backend
 */
 
cpu_state = {
	imem: [],				// Instruction Memory
	dmem: [],				// Data Memory
	pc:	0,					// Program Counter
	 
	regs: [0, 0, 0, 0],		// Registers
	port0: 0,
	port1: 0,
	
	
	
	ctrl: []				// Control Lines
};
 
// CPU memory init
cpu_state.imem = new Array(128 + 128 * 256).fill(0); // Allocation space for bios and user banks
cpu_state.dmem = new Array(128 * 256).fill(0); // Same thing for data memory banks
cpu_state.ctrl = new Array(24).fill(0); // Init control lines