#ifndef ASM_H
#define ASM_H

/* includes */
#include <stdint.h>

/* defines */

#define EXP_STACK_DEPTH 16

#define TOKEN_BUF_SIZE 129
#define SYMBOL_NAME_SIZE 33

#define RELOC_SIZE 8

/* structs */

/* special types */
struct tval {
	uint16_t value;
	uint8_t type;
};


/* symbol (full) */
struct symbol {
	uint8_t type;
	char name[SYMBOL_NAME_SIZE];
	uint16_t size;
	uint16_t value;
	struct symbol *parent;
	struct symbol *next;
};

/* symbol (local) */
struct local {
	uint8_t type;
	uint8_t label;
	uint16_t value;
	struct local *next;
};


/* interface functions */

void asm_reset();
void asm_assemble(char flagv, char flagl);

#endif