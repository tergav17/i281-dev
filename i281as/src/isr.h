#ifndef ISR_H
#define ISR_H

/* includes */
#include <stdint.h>

#define END 0
#define BASIC 1 // instruction with no args
#define ARITH 2 // arithmetic instructions and mov, DST<-SRC
#define IMM 3 // immediate instruction, registers + constant
#define PNT 4 // single pointer instruction
#define PNTO 5 // single pointer with register offset
#define LOAD 6 // load style instruction
#define LOADF 7 // loadf style instruction
#define STORE 8 // store style instruction
#define STOREF 9 // storef style instruction
#define SINGLE 10 // single register instruction
#define BRANCH 11 // branch instruction

/* structs */
struct instruct {
	uint8_t type;
	char *mnem;
	uint8_t opcode;
	uint8_t arg;
};

struct oprnd {
	uint8_t type;
	char *mnem;
};

/* (simple) operand table */
struct oprnd op_table[] = {
	{ 0, "a" },
	{ 1, "b" },
	{ 2, "c" },
	{ 3, "d" },
	{ 255, "" }
};

/*
 * a	= 0
 * b 	= 1
 * c	= 2
 * d	= 3
 * next is \n = 255
 */

/* instruction table */
struct instruct isr_table[] = {

	{ BASIC, "nop", 0x00, 0 },
	{ PNT, "inputc", 0x10, 0 },
	{ PNT, "inputd", 0x12, 0 },
	{ PNTO, "inputcf", 0x11, 0 },
	{ PNTO, "inputdf", 0x13, 0 },
	{ ARITH, "mov", 0x20, 0 },
	{ IMM, "loadi", 0x30, 0 },
	{ ARITH, "add", 0x40, 0 },
	{ IMM, "addi", 0x50, 0 },
	{ ARITH, "sub", 0x60, 0 },
	{ IMM, "subi", 0x70, 0 },
	{ LOAD, "load", 0x80, 0 },
	{ LOADF, "loadf", 0x90, 0 },
	{ STORE, "store", 0xA0, 0 },
	{ STOREF, "storef", 0xB0, 0 },
	{ SINGLE, "shiftl", 0xC0, 0 },
	{ SINGLE, "shiftr", 0xC1, 0 },
	{ PNTO, "bootcf", 0xC2, 0 },
	{ PNTO, "bootdf", 0xC3, 0 },
	{ ARITH, "cmp", 0xD0, 0 },
	{ BRANCH, "jump", 0xE0, 0 },
	{ BRANCH, "brz", 0xF0, 0 },
	{ BRANCH, "bre", 0xF0, 0 },
	{ BRANCH, "brnz", 0xF1, 0 },
	{ BRANCH, "brne", 0xF1, 0 },
	{ BRANCH, "brg", 0xF2, 0 },
	{ BRANCH, "brge", 0xF3, 0 },
	
	{ END, "", 0x00, 0x00}
};

#endif