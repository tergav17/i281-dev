/*
 * asm.c 
 *
 * assembler guts
 */
#include "asm.h"
#include "sio.h"

// instruction table
#include "isr.h"

#include <stdio.h>
#include <stdlib.h>

/*
 * there are a number of global variables to reduce the amount of data being passed
 */
 

/* we will just output everything to an array because we are lazy */
uint8_t data_out[128 * 256];
uint16_t isr_out[128 * 256];

/* token buffer */
char token_buf[TOKEN_BUF_SIZE];
char sym_name[TOKEN_BUF_SIZE];

/* current assembly address */
uint8_t asm_address;

/* cached addresses for other banks */
uint8_t text_bank_addr[256];
uint8_t data_bank_addr[256];

/* current pass */
uint8_t asm_pass;

/* current segment */
uint8_t asm_seg;

/* banking information */
uint8_t curr_bank;

uint8_t max_bank;
/* the expression evaluator requires some larger data structures, lets define them */

/* value stack */
struct tval exp_vstack[EXP_STACK_DEPTH];

/* expression stack */
char exp_estack[EXP_STACK_DEPTH];

/* head of symbol table */
struct symbol *sym_table;

/* head of local table */
struct local *loc_table;

/* counts how many locals have been encountered this pass */
int loc_cnt;

/* telemetry stuff */
int sym_count;
int loc_count;

/* are we assembling in lower memory? */
char is_lower;

/*
 * checks if a string is equal
 * string a is read as lower case
 *
 * a = pointer to string a
 * b = pointer to string b
 */
char asm_sequ(char *a, char *b) {
	char lower;
	
	while (*b) {
		lower = *a;
		if (lower >= 'A' && lower <= 'Z')
			lower += 'a'-'A';
		
		if (lower != *b)
			return 0;
		
		a++;
		b++;
	}
	
	return *a==*b;
	
}

/*
 * prints out an error message and exits
 *
 * msg = error message
 */
void asm_error(char *msg)
{
	sio_status();
	printf(": %s\n", msg);
	sio_close();
	exit(1);
}


/*
 * allocates memory from the heap
 * since no de-allocation is needed, data could just be appended to the heap
 *
 * size = number of bytes to allocate
 */
void *asm_alloc(int size)
{
	return (void *) malloc(size);
}

/*
 * moves the contents of token_buf into token_cache
 */
void asm_token_cache(char *token_cache)
{
	int i;
	
	for (i = 0; i < TOKEN_BUF_SIZE; i++)
		token_cache[i] = token_buf[i];
}


/*
 * skips past all of the white space to a token
 */
void asm_wskip()
{
	char comment;
	
	comment = 0;
	while ((sio_peek() <= ' ' || sio_peek() == ';' || comment) && sio_peek() != '\n' && sio_peek() != -1)
		if (sio_next() == ';') comment = 1;
}

/*
 * tests if a character is a alpha (aA - zZ or underscore)
 *
 * in = character to test
 * returns true (1) or false (0)
 */
char asm_alpha(char in)
{
	return (in >= 'A' && in <= 'Z') || (in >= 'a' && in <= 'z') || in == '_';
}

/*
 * tests if a character is a alpha
 *
 * in = character to test
 * returns true (1) or false (0)
 */
char asm_num(char in)
{
	return (in >= '0' && in <= '9');
}

/*
 * reads the next token in from the source, buffers if needed, and returns type
 * white space will by cycled past, both in front and behind the token
 */
char asm_token_read() 
{
	char c, out;
	int i;

	// skip all leading white space
	asm_wskip();
	
	// peek and check type
	out = c = sio_peek();
	if (asm_alpha(c))
		out = 'a';
	else if (asm_num(c))
		out = '0';
	
	if (out == 'a' || out == '0') {
			// scan in the buffer if needed
		i = 0;
		while (asm_num(c) || asm_alpha(c)) {
			if (i < TOKEN_BUF_SIZE - 1)
				token_buf[i++] = c;
			
			sio_next();
			c = sio_peek();
		}
		token_buf[i] = 0;
	} else {
		sio_next();
	}
	
	// correct for new lines
	if (out == '\n') out = 'n';
	
	// skip more whitespace 
	asm_wskip();
	
	return out;
}

/*
 * expects a specific symbol
 * some symbols have special cases for ignoring trailing or leading line breaks
 *
 * c = symbol to expect
 */
void asm_expect(char c)
{
	char tok;
	
	if (c == '}') {
		while (sio_peek() == '\n')
			asm_token_read();
	}
	
	tok = asm_token_read();
	
	if (tok != c) {
		asm_error ("unexpected character");
	}
	
	if (c == '{' || c == ',') {
		while (sio_peek() == '\n')
			asm_token_read();
	}
}

/*
 * consumes an end of line
 */
void asm_eol()
{
	char tok;
	
	tok = asm_token_read();
	if (tok != 'n' && tok != -1)
		asm_error("expected end of line");
}

/*
 * skips to and consumes an end of line
 */
void asm_skip()
{
	char tok;
	
	do {
		tok = asm_token_read();
	} while (tok != 'n' && tok != -1);
}

/*
 * helper function for number parsing, returns radix type from character
 *
 * r = radix identifier
 * returns radix type, or 0 if not a radix
 */
char asm_classify_radix(char r)
{
	if (r == 'b' || r == 'B') return 2;
	if (r == 'o' || r == 'O') return 8;
	if (r == 'x' || r == 'X' || r == 'h' || r == 'H') return 16;
	return 0;
}

/*
 * another helper function, this time to take a decimal / hex char and convert it
 *
 * in = char to convert to number
 * returns number, of -1 if failed
 */
int asm_char_parse(char in)
{
	if (in >= '0' && in <= '9') return in - '0';
	else if (in >= 'A' && in <= 'F') return (in - 'A') + 10;
	else if (in >= 'a' && in <= 'f') return (in - 'a') + 10;
	return -1;
}

/*
 * attempts to parse a number into an unsigned 16 bit integer
 *
 * in = pointer to string
 * returns actual value of number
 */
uint16_t asm_num_parse(char *in)
{
	int num_start, num_end, i;
	uint16_t out;
	char radix; // 0 = ?, 2 = binary, 8 = octal, 10 = decimal, 16 = hex
	
	// default is base 10
	radix = 10;
	
	// first skip through any leading zeros, and set octal if there is some
	for (num_start = 0; in[num_start] == '0'; num_start++)
		radix = 8;
	
	// lets also find the end while we are at it
	for (num_end = 0; in[num_end] != 0; num_end++);
	
	// check and see if there is a radix identifier here
	if ((i = asm_classify_radix(in[num_start]))) {
		radix = i;
		num_start++;
	} else {
		// lets check at the end too
		if ((i = asm_classify_radix(in[num_end - 1]))) {
			radix = i;
			num_end--;
		}
	}
	
	// now to parse
	out = 0;
	for (; num_start < num_end; num_start++) {
		i = asm_char_parse(in[num_start]);
		
		// error checking
		if (i == -1) asm_error("unexpected character in numeric");
		if (i >= radix) asm_error("radix mismatch in numeric");
		
		out = (out * radix) + i;
	}
	
	return out;
}

/*
 * fetches the symbol
 *
 * parent = parent structure to search
 * sym = pointer to symbol name
 * returns pointer to found symbol, or null
 */
struct symbol *asm_sym_fetch(struct symbol *table, char *sym)
{
	struct symbol *entry;
	int i;
	char equal;
	
	if (!table)
		return NULL;
	
	// search for the symbol
	entry = table->parent;
	
	while (entry) {
		
		// compare strings
		equal = 1;
		for (i = 0; i < SYMBOL_NAME_SIZE; i++) {
			if (entry->name[i] != sym[i]) equal = 0;
			if (!entry->name[i]) break;
		}
		
		if (equal) return entry;
		
		entry = entry->next;
	}
	
	
	return NULL;
}

/*
 * grabs the size of a type, and returns its parent symbol chain
 *
 * type = name of type
 * result = size of symbol, 0 if does not exist
 * returns parent symbol chain
 */
struct symbol *asm_type_size(char *type, uint16_t *result)
{
	struct symbol *sym;
	
	// built in types
	if (asm_sequ(type, "byte")) {
		*result = 1;
		return NULL;
	}
	if (asm_sequ(type, "word")) {
		*result = 2;
		return NULL;
	}
	
	// else, look in the symbol table
	sym = asm_sym_fetch(sym_table, type);
	
	if (sym) {
		*result = sym->size;
		return sym;
	}
	
	// can't find
	*result = 0;
	return NULL;
}

/*
 * defines or redefines a symbol
 *
 * table = table to add to
 * sym = symbol name
 * type = symbol type (0 = undefined, 1 = text, 2 = data, 3 = bss, 4 = absolute, 5+ = external)
 * parent = parent name
 * value = value of symbol
 */
struct symbol *asm_sym_update(struct symbol *table, char *sym, char type, struct symbol *parent, uint16_t value)
{
	struct symbol *entry;
	int i;
	
	entry = asm_sym_fetch(table, sym);
	
	if (!entry) {
		if (table->parent) {
			entry = table->parent;
			
			// get the last entry in the table;
			while (entry->next)
				entry = entry->next;
			
			sym_count++;
			entry->next = (struct symbol *) asm_alloc(sizeof(struct symbol));
			entry = entry->next;
		} else {
			sym_count++;
			table->parent = (struct symbol *) asm_alloc(sizeof(struct symbol));
			entry = table->parent;
		}
		
		entry->next = NULL;
		entry->parent = NULL;
		entry->size = 0;
		
		// copy name
		for (i = 0; i < SYMBOL_NAME_SIZE-1 && sym[i] != 0; i++)
			entry->name[i] = sym[i];
		entry->name[i] = 0;
			
	}
	
	// update the symbol
	entry->type = type;
	if (parent != NULL) {
		entry->parent = parent->parent;
	}
	entry->value = value;
	
	return entry;
}

/*
 * resets all allocation stuff
 */
void asm_reset()
{	
	
	sym_table = NULL;
	loc_table = NULL;
	
	// allocate empty table
	sym_table = (struct symbol *) asm_alloc(sizeof(struct symbol));
	sym_table->parent = NULL;
	
	// count memory consumption
	sym_count = 0;
	loc_count = 0;
}

/*
 * appends a local symbol to the local table
 *
 * label = label # (0-9)
 * type = symbol segment (text, data, or bss)
 * value = value of symbol
 */
void asm_local_add(uint8_t label, uint8_t type, uint16_t value)
{
	struct local *new, *curr;
	
	// alloc the new local symbol
	loc_count++;
	new = (struct local *) asm_alloc(sizeof(struct local));
	new->label = label;
	new->type = type;
	new->value = value;
	
	// append to local table
	if (loc_table) {
		curr = loc_table;
		while (curr->next)
			curr = curr->next;
		
		curr->next = new;
	} else
		loc_table = new;
}

/*
 * fetches a local symbol
 *
 * index = how many local indicies have been counted during pass
 * label = label # (0-9)
 * dir = direction (0 = backwards, 1 = forwards)
 */
char asm_local_fetch(uint16_t *result, int index, uint8_t label, char dir)
{
	struct local *curr, *last;
	
	curr = loc_table;
	
	// iterate through list
	last = NULL;
	while (curr) {
		
		// label match
		if (curr->label == label) {
			if (index) {
				last = curr;
			} else break;
		}
		
		if (index) index--;
		curr = curr->next;
	}
	
	if (dir)
		last = curr;
	
	*result = 0;
	if (last) {
		*result = last->value;
		return last->type;
	}
	return 0;
}


/*
 * converts an escaped char into its value
 *
 * c = char to escape
 * returns escaped value
 */
char asm_escape_char(char c)
{
	switch (c) {
		case 'a':
			return 0x07;
			
		case 'b':
			return 0x08;
			
		case 'e':
			return 0x1B;
			
		case 'r':
			return 0x0D;
			
		case 'f':
			return 0x0C;
			
		case 'n':
			return 0x0A;
			
		case 't':
			return 0x09;
			
		case 'v':
			return 0x0B;
		
		case '\\':
			return 0x5C;

		case '\'':
			return 0x27;
			
		case '\"':
			return 0x22;
			
		case '\?':
			return 0x3F;
			
		default:
			return 0;
	}
}

/*
 * pops a value off the estack and evaluates it in the vstack
 *
 * eindex = pointer to expression index
 * vindex = pointer to value index
 */
void exp_estack_pop(int *eindex, int *vindex)
{
	uint16_t a, b, res;
	uint8_t at, bt, ot;
	char op;
	
	// check if expression stack is empty
	if (!(*eindex)) asm_error("expression stack depletion");
	
	// pop off estack
	op = exp_estack[--*eindex];
	
	// attempt to pop out two values from the value stack
	if (*vindex < 2) asm_error("value stack depletion");
	
	// grab values off the stack
	b = exp_vstack[--*vindex].value;
	bt = exp_vstack[*vindex].type;
	a = exp_vstack[--*vindex].value;
	at = exp_vstack[*vindex].type;
	
	switch (op) {
		case '!':
			res = a | ~b;
			break;
		
		case '+':
			res = a + b;
			break;
			
		case '-':
			res = a - b;
			break;
			
		case '*':
			res = a * b;
			break;
			
		case '/':
			if (b == 0) {
				if (asm_pass == 0) res = 0;
				else asm_error("zero divide");
			} else
				res = a / b;
			break;
			
		case '%':
			res = a % b;
			break;
			
		case '>':
			res = a >> b;
			break;
			
		case '<':
			res = a << b;
			break;
			
		case '&':
			res = a & b;
			break;
		
		case '^':
			res = a ^ b;
			break;
			
		case '|':
			res = a | b;
			break;
			
		case '(':
			asm_error("unexpected '('");
		
		default:
			res = 0;
			break;
	}
	
	// calculate types
	if (!at || !bt) {
		// any operation with an undefined type will also be undefined
		ot = 0;
	} else if (at != 4 && bt != 4) {
		// operations between two non-absolute types are forbidden
		asm_error("incompatable types");
	} else if (at == 4 && bt != 4) {
		// a is absolute, b is not
		// only addition is allowed here, ot becomes bt
		if (op != '+')
			asm_error("invalid type operation");
		ot = bt;
	} else if (at != 4 && bt == 4) {
		// b is absolute, a is not
		// either addition or subtraction is allowed here, ot becomes at
		if (op != '+' && op != '-')
			asm_error("invalid type operation");
		ot = at;
	} else {
		// both are absolute
		ot = 4;
	}
		
	
	// push into stack
	exp_vstack[*vindex].value = res;
	exp_vstack[(*vindex)++].type = ot;
}

/*
 * pushes a expression onto the estack
 *
 * eindex = pointer to expression idnex
 * op = expression to push
 */
void exp_estack_push(int *eindex, char op)
{
	if (*eindex >= EXP_STACK_DEPTH) asm_error("expression stack overflow");
	exp_estack[(*eindex)++] = op;
}

/*
 * pushes a value onto the vstack
 *
 * vindex = pointer to value index
 * val = value to push
 */
void exp_vstack_push(int *vindex, uint8_t type, uint16_t value)
{
	if (*vindex >= EXP_STACK_DEPTH) asm_error("value stack overflow");
	exp_vstack[*vindex].type = type;
	exp_vstack[(*vindex)++].value = value;
}

/*
 * returns the precedence of a specific token
 *
 * tok = token
 * returns precedence of token
 */
int asm_precedence(char tok)
{
	switch (tok) {
		case '!':
			return 1;
			
		case '+':
		case '-':
			return 2;
			
		case '*':
		case '/':
		case '%':
			return 3;
			
		case '>':
		case '<':
			return 4;
			
		case '&':
			return 5;
		
		case '^':
			return 6;
			
		case '|':
			return 7;
			
		case '(':
			return 0;
			
		default:
			return 99;
	}
}

/*
 * checks to see if there is a left parathesis in the expression stack
 *
 * size = size of stack
 * returns 1 if true, otherwise 0
 */
char exp_estack_has_lpar(int size) 
{
	int i;
	
	for (i = 0; i < size; i++)
		if (exp_estack[i] == '(') return 1;
	
	return 0;
}

/*
 * evaluates an expression that is next in the token queue
 *
 * result = pointer where result will be placed in
 * tok = initial token, 0 if none
 * returns status 0 = unresolved, 1 = text, 2 = data, 3 = bss, 4 = absolute, 5+ = external types
 */
uint8_t asm_evaluate(uint16_t *result, char itok)
{
	char tok, op, type, dosz;
	uint16_t num;
	struct symbol *sym;
	int vindex, eindex;
	
	// reset indicies
	vindex = eindex = 0;
	
	while (1) {
		// read token, or use inital token
		if (itok) {
			tok = itok;
			itok = 0;
		} else tok = asm_token_read();
		
		// default is absolute
		type = 4;
		
		if (tok == 'a' || tok == '$') {
			// it is a symbol
			
			// see if we are doing a size or value operation
			dosz = 0;
			if (tok == '$') {
				dosz = 1;
				tok = asm_token_read();
				if (tok != 'a')
					asm_error("unexpected token");
			}
			
			op = 0;
			sym = asm_sym_fetch(sym_table, token_buf);
			if (sym) {
				
				if (dosz) {
					// all sizes are absolute
					num = sym->size;
				} else {
					// get type
					type = sym->type;
					
					// get value
					num = sym->value;
				}
			} else {
				type = 0;
				num = 0;
			}
			
			// parse subtypes for symbols
			while (sio_peek() == '.') {
				
				asm_token_read();
				tok = asm_token_read();
				
				if (tok != 'a')
					asm_error("unexpected token");
				
				// don't both doing another lookup if sym is null
				if (sym)
					sym = asm_sym_fetch(sym, token_buf);
				
				if (sym) {
					if (dosz) {
						num = sym->size;
					} else {
						num += sym->value;
					}
				} else {
					type = 0;
					num = 0;
				}
			}
		} else if (tok == '0' || tok == '@') {
			// it is a numeric (maybe)
			op = 0;
		
			if (tok == '@') {
				// current asm pointer
				num = asm_address;
			} else if (asm_num(token_buf[0]) && (token_buf[1] == 'f' || token_buf[1] == 'b' || token_buf[1] == 'F' || token_buf[1] == 'B') && token_buf[2] == 0) {
				// nope, actually a local label
				type = asm_local_fetch(&num, loc_cnt, asm_char_parse(token_buf[0]), token_buf[1] == 'f' || token_buf[1] == 'F');
			} else {
				// its a numeric (for realz)
				num = asm_num_parse(token_buf);
			}
		} else if (tok == '\'') {
			// it is a char
			op = 0;
			
			// escape character
			if (sio_peek() == '\\') {
				sio_next();
				num = asm_escape_char(sio_next());
				
				if (!num) asm_error("unknown escape");
			} else {
				num = sio_next();
			}
			
			if (asm_token_read() != '\'')
				asm_error("expected \'");
		} else {
			// it is a token (hopefully mathematic)
			op = -1;
			
			if (tok == '+' || tok == '-' || tok == '*' || tok == '/' || 
				tok == '&' || tok == '|' || tok == '%' || tok == '!' ||
				tok == '^' || tok == '(' || tok == ')') op = tok;
				
			if (tok == '>' || tok == '<') {
				if (tok != sio_peek()) op = -1;
				else op = tok;
				
				asm_token_read();
			}
			
			if (op == -1) asm_error("unknown token in expression");
		}
		
		// now lets handle the token
		if (op != ')' && op != '(' && op) {
			// handle operators
			
			// pop off anything in the stack that is of higher precedence
			while (eindex && asm_precedence(op) <= asm_precedence(exp_estack[eindex - 1]))
				exp_estack_pop(&eindex, &vindex);
			
			exp_estack_push(&eindex, op);
		} else if (op == '(') {
			// handle left parathesis 
			exp_estack_push(&eindex, '(');
		} else if (op == ')') {
			if (!exp_estack_has_lpar(eindex))
				asm_error("unexpected ')'");
			
			while (exp_estack[eindex - 1] != '(')
				exp_estack_pop(&eindex, &vindex);
			
			// pop the '(' too
			eindex--;
		} else {
			// handle numbers
			exp_vstack_push(&vindex, type, num);
		}
		
		// check for ending conditions
		tok = sio_peek();
		if (tok == ',' || tok == '\n' || tok == ']' || tok == '}' || tok == -1) break;
		if (tok == ')' && !exp_estack_has_lpar(eindex)) break;
			
	}
	
	while (eindex) exp_estack_pop(&eindex, &vindex);
	
	if (vindex != 1) asm_error("value stack overpopulation");
	
	*result = exp_vstack[0].value;
	
	// return type
	return exp_vstack[0].type;
}

/*
 * parses a bracket if there is one to parses, else returns zero
 * nofail is used to emit an error if the bracket MUST be parsed
 *
 * nofail = fail if internal expression fails to parse
 * returns expression results
 */
uint16_t asm_bracket(char nofail)
{
	uint16_t result;
	char res;
	
	// if there is no bracket, just return 0
	if (sio_peek() != '[')
		return 0;
	
	asm_token_read();
	
	// evaluate
	res = asm_evaluate(&result, 0);
	
	asm_expect(']');
	
	if (!res) {
		if (nofail)
			asm_error("undefined expression");
		
		return 0;
	}
	
	if (res != 4)
		asm_error("must be absolute");
	
	return result;
}

/*
 * emits a byte into assembly output
 * no bytes emitted on first pass, only indicies updated
 *
 * value = value to emit
 * size = # of bytes that represent value
 */
void asm_emit(uint16_t value, uint8_t size)
{
	int i;
	

	// text segment?
	if (asm_seg == 1) {
	
		// get address
		i = asm_address;
		if (!is_lower)
			i -= 128;
		
		// make sure we aren't overruning the current bank
		if (i >= 128)
			asm_error("out of space in text bank");
		
		// write to output
		isr_out[128 * curr_bank + i] = value;
		sio_emit(value >> 8);
		sio_emit(value & 0xFF);
		asm_address++;
		
		// keep track of maximum bank
		if (curr_bank > max_bank)
			max_bank = curr_bank;
	}
	
	
	// data segment 
	else {
				
		// get address
		i = asm_address;
		
		// write to output
		if (size == 1) {
			// make sure we aren't overruning the current bank
			if (i >= 128)
				asm_error("out of space in data bank");
			
			data_out[128 * curr_bank + i] = value;
			sio_emit(value);
			asm_address++;
		} else {
			// make sure we aren't overruning the current bank
			if (i >= 127)
				asm_error("out of space in data bank");
			
			data_out[128 * curr_bank + i] = value >> 8;
			sio_emit(value >> 8);
			data_out[128 * curr_bank + i + 1] = value & 0xFF;
			sio_emit(value & 0xFF);
			asm_address += 2;
		}
		
		// check segment stuff
		if (asm_seg == 2) {
			// keep track of maximum bank
			if (curr_bank > max_bank)
				max_bank = curr_bank;
		} else {
			// no data in bss!!!
			if (value)
				asm_error("data in bss");
		}
	}

}

/*
 * emits a string found in the char stream
 */
void asm_emit_string()
{
	char c, state;
	int radix, length;
	uint8_t decode, num;
	
	// zero state, just accept raw characters
	state = 0;
	
	sio_next();
	while (1) {
		c = sio_next();
		
		// we are done (maybe)
		if (c == -1) break;
		if (c == '"') {
			if (state != 1) {
				if (state == 3) {
					asm_emit(decode, 1);
				}
				
				break;
			}
		}
		
		// just emit the char outright
		if (!state) {
			// sets the state to 1
			if (c == '\\') 
				state = 1;
			else 
				asm_emit(c, 1);
			
			
		} else if (state == 1) {
			// escape character
			decode = asm_escape_char(c);
			
			// simple escape
			if (decode) {
				asm_emit(decode, 1);
				state = 0;
			} else if (asm_num(c)) {
				state = 3;
				radix = 8;
				length = 3;
			} else if (c == 'x') {
				state = 2;
				radix = 16;
				length = 2;
			} else {
				asm_error("unknown escape");
			}
		}
		
		if (state == 3) {
			// numeric parsing
			num = asm_char_parse(c);
			
			if (num == -1) asm_error("unexpected character in numeric");
			if (num >= radix) asm_error("radix mismatch in numeric");
			
			decode = (decode * radix) + num;
			
			num = asm_classify_radix(sio_peek());
			length--;
			
			// end the parsing
			if (length < 1 || num == -1 || num >= radix) {
				state = 0;
				asm_emit(decode, 1);
			}
		}
		
		// this is to consume the 'x' identifier 
		if (state == 2) state = 3;
	}
	
	// make sure we don't land in whitespace
	asm_wskip();
}

/*
 * fills a region with either zeros or undefined allocated space
 *
 * size = number of bytes to fill
 */
void asm_fill(uint16_t size)
{
	while (size--) asm_emit(0, 1);
}

/*
 * helper function to evaluate an expression and emit the results
 * will handle relocation tracking and pass related stuff
 *
 * size = maximum size of space
 */
void asm_emit_expression(uint16_t size, char tok)
{
	uint16_t value;
	uint8_t type;
	
	type = asm_evaluate(&value, tok);
	
	if (!type) {
		// if we are on the second pass, error out
		if (asm_pass)
			asm_error("undefined symbol");
		
		value = 0;
	}
	
	asm_emit(value, size);
}

/*
 * recursive function to do type-based definitions
 */
void asm_define_type(struct symbol *type)
{
	struct symbol *sym;
	char tok;
	uint16_t base, size;
	
	if (!type || !type->size)
		asm_error("not a type");
	
	size = type->size;
	base = asm_address;
	
	// get the first field
	asm_expect('{');

	sym = type->parent;
	while (sym) {
		// correct to required location
		if (asm_address > base + sym->value)
			asm_error("field domain overrun");
		asm_fill((base + sym->value) - asm_address);
		
		tok = sio_peek();
		if (tok == '"') {
			// emit the string
			asm_emit_string();
			
		} else if (tok == '{') {
			// emit the type (recursive)
			asm_define_type(sym->parent);
			
		} else {
			// emit the expression
			asm_emit_expression(sym->size, 0);
		}
		

		if (sym->next) {
			asm_expect(',');
		}
			
		sym = sym->next;
	}
	
	// finish corrections
	if (asm_address > base + size)
		asm_error("field domain overrun");
	asm_fill((base + size) - asm_address);
	
	asm_expect('}');
}

/*
 * parses a definition out of the token queue, and emits it
 *
 * type = type of data
 * count = number of data structures created
 */
void asm_define(char *type, uint16_t count)
{
	char tok;
	int i;
	struct symbol *parent;
	uint16_t size, addr;
	
	// get the symbol type
	parent = asm_type_size(type, &size);
	
	if (!size) asm_error("not a type");
	
	// record current address
	addr = asm_address;
	
	i = 0;
	while (sio_peek() != '\n' && sio_peek() != -1) {
		tok = sio_peek();
		if (tok == '"') {
			// emit the string
			asm_emit_string();
			
		} else if (tok == '{') {
			// emit the type
			asm_define_type(parent);
			
		} else {
			// emit the expression
			asm_emit_expression(size, 0);
		}
		
		// see how many elements we emitted, and align to size
		// first, correct size for instruction memory
		// sorta hacky, but whatever
		if (size == 2 && asm_seg == 1)
			size = 1;
		while (asm_address > addr) {
			addr += size;
			i++;
		}
		asm_fill(addr - asm_address);
		

		if (sio_peek() != '\n' && sio_peek() != -1) asm_expect(',');
	}
	
	// do count handling
	if (!count)
		return;
	
	if (i > count)
		asm_error("define domain overrun");
	
	asm_fill(size * (count - i));
}

/*
 * defines a new type structure
 */
void asm_type(char *name)
{
	char tok;
	struct symbol *type, *sym;
	uint16_t base, size, count;
	
	asm_expect('{');
	
	if (asm_pass) {
		while (sio_peek() != '}' && sio_peek() != -1)
			asm_token_read();
		
		asm_expect('}');
		return;
	}
	if (asm_sym_fetch(sym_table, name))
		asm_error("type already defined");
	
	type = asm_sym_update(sym_table, name, 4, NULL, 0);
	
	base = 0;
	while (1) {
		// read type
		tok = asm_token_read();
		
		if (tok != 'a')
			asm_error("expected symbol");
		
		sym = asm_type_size(token_buf, &size);
		
		if (!size)
			asm_error("not a type");
		
		count = asm_bracket(1);
		// there can be no zero counts
		if (!count) count = 1;
		
		// read name
		tok = asm_token_read();
		
		if (tok != 'a')
			asm_error("expected symbol");
		
		sym = asm_sym_update(type, token_buf, 4, sym, base);
		sym->size = size;

		base += size * count;
		
		if (sio_peek() == ',')
			asm_expect(',');
		else
			break;
	}
	type->size = base;
	
	asm_expect('}');
	
}


/*
 * helper function that outputs a high byte and a low byte
 *
 * high = this should be obvious
 * low = this too
 */
void asm_emit_isr(uint8_t high, uint8_t low)
{
	asm_emit((high << 8) | low, 2);
}

/*
 * parses an operand, used to extract an register
 */
uint8_t asm_arg() {
	int i;
	char tok;
	
	// check if there is anything next
	if (sio_peek() == '\n' || sio_peek() == -1)
		return 255;

	// read the token
	tok = asm_token_read();
	
	// maybe a register symbol?
	if (tok == 'a') {
		i = 0;
		while (op_table[i].type != 255) {
			if (asm_sequ(token_buf, op_table[i].mnem)) {
				return op_table[i].type;
			}
			i++;
		}
	} 
	
	return 255;
}

/*
 * assembles an instructions
 * if/elses that would make yandev blush
 *
 * isr = pointer to instruct
 * returns 0 if successful
 */
char asm_doisr(struct instruct *isr) {
	char type, tok;
	uint8_t src, dst;
	uint16_t value;
	
	// basic operation
	if (isr->type == BASIC) {
		asm_emit_isr(isr->opcode, 0x00);
	} 
	
	// arithmetic operation
	else if (isr-> type == ARITH) {
		dst = asm_arg();
		
		// we should get a simple register
		if (dst >= 4)
			return 1;
		
		// grab next arg and generate instruction
		asm_expect(',');
		src = asm_arg();
		if (src >= 4)
			return 1;
		
		asm_emit_isr(isr->opcode + (dst<<2) + src, 0x00);
	}
	
	// immediate operation
	else if (isr-> type == IMM) {
		dst = asm_arg();
		
		// we should get a simple register
		if (dst >= 4)
			return 1;
		
		// next arg should be an expression
		asm_expect(',');
		type = asm_evaluate(&value, 0);
		if (type == 0 && asm_pass)
			asm_error("undefined expression");
		
		asm_emit_isr(isr->opcode + (dst<<2), value);
	}
	
	// single pointer operation
	else if (isr-> type == PNT) {
		asm_expect('[');
		
		// evaluate expression
		type = asm_evaluate(&value, 0);
		if (type == 0 && asm_pass)
			asm_error("undefined expression");
		asm_expect(']');
		
		asm_emit_isr(isr->opcode, value);
	}
	
	// single pointer + register operation
	else if (isr-> type == PNTO) {
		asm_expect('[');
		src = asm_arg();
		
		// we should get a simple register
		if (src >= 4)
			return 1;
		
		// do we have an expression to add?
		value = 0;
		tok = asm_token_read();
		if (tok == '+') {
			// evaluate expression
			type = asm_evaluate(&value, 0);
			if (type == 0 && asm_pass)
				asm_error("undefined expression");
			asm_expect(']');
		} else if (tok != ']')
			return 1;
		
		asm_emit_isr(isr->opcode + (src<<2), value);
	}
	
	// load operation
	else if (isr-> type == LOAD) {
		dst = asm_arg();
		
		// we should get a simple register
		if (dst >= 4)
			return 1;
		
		// next arg should be a backet expression
		asm_expect(',');
		asm_expect('[');
		
		// evaluate expression
		type = asm_evaluate(&value, 0);
		if (type == 0 && asm_pass)
			asm_error("undefined expression");
		asm_expect(']');
		
		asm_emit_isr(isr->opcode + (dst<<2), value);
	}
	
	// load offset operation
	else if (isr-> type == LOADF) {
		dst = asm_arg();
		
		// we should get a simple register
		if (dst >= 4)
			return 1;
		
		// next arg should be a backet expression
		asm_expect(',');
		asm_expect('[');
		src = asm_arg();
		
		// we should get a simple register
		if (src >= 4)
			return 1;
		
		// do we have an expression to add?
		value = 0;
		tok = asm_token_read();
		if (tok == '+') {
			// evaluate expression
			type = asm_evaluate(&value, 0);
			if (type == 0 && asm_pass)
				asm_error("undefined expression");
			asm_expect(']');
		} else if (tok != ']')
			return 1;
		
		asm_emit_isr(isr->opcode + (dst<<2) + src, value);
	}
	
	// store operation
	else if (isr-> type == STORE) {
		// arg should be a backet expression
		asm_expect('[');
		
		// evaluate expression
		type = asm_evaluate(&value, 0);
		if (type == 0 && asm_pass)
			asm_error("undefined expression");
		asm_expect(']');
		asm_expect(',');
		src = asm_arg();
		
		// we should get a simple register
		if (src >= 4)
			return 1;
		
		asm_emit_isr(isr->opcode + (src<<2), value);
	}
	
	// store offset operation
	else if (isr-> type == STOREF) {
		// arg should be a backet expression
		asm_expect('[');
		dst = asm_arg();
		
		// we should get a simple register
		if (dst >= 4)
			return 1;
		
		// do we have an expression to add?
		value = 0;
		tok = asm_token_read();
		if (tok == '+') {
			// evaluate expression
			type = asm_evaluate(&value, 0);
			if (type == 0 && asm_pass)
				asm_error("undefined expression");
			asm_expect(']');
		} else if (tok != ']')
			return 1;
		asm_expect(',');
		
		src = asm_arg();
		
		// we should get a simple register
		if (src >= 4)
			return 1;
		
		asm_emit_isr(isr->opcode + (src<<2) + dst, value);
	}
	
	// single register operation
	else if (isr-> type == SINGLE) {
		dst = asm_arg();
		
		// we should get a simple register
		if (dst >= 4)
			return 1;
		
		// generate instruction
		asm_emit_isr(isr->opcode + (dst<<2), 0x00);
	}
	
	// branch operation
	else if (isr-> type == BRANCH) {
		// evaluate expression
		type = asm_evaluate(&value, 0);
		if (type == 0 && asm_pass)
			asm_error("undefined expression");
		
		// calculate offset for instruction
		dst = value - (asm_address + 1);
		
		// generate instruction
		asm_emit_isr(isr->opcode, dst);
	}
	
	// single register pseudo-operation
	else if (isr-> type == PSEUDO) {
		dst = asm_arg();
		
		// we should get a simple register
		if (dst >= 4)
			return 1;
		
		// generate instruction
		asm_emit_isr(isr->opcode + (dst<<2) + dst, 0x00);
	}
	
	return 0;
}

/*
 * attempts to assemble an instruction assuming a symbol has just been tokenized
 *
 * in = pointer to string
 * returns 0 if an instruction is not matched, 1 if it is
 */
char asm_instr(char *in)
{
	int i;
	
	// search for and assemble instruction
	i = 0;
	while (isr_table[i].type) {
		if (asm_sequ(in, isr_table[i].mnem)) {
			if (asm_doisr(&isr_table[i]))
				asm_error("invalid operand");;
			return 1;
		}
		
		i++;
	}
	
	return 0;
}

/*
 * changes segments for first pass segment top tracking
 *
 * nseg = next segment
 * nbank = next bank
 */
void asm_change_seg(char nseg, char nbank)
{
	// first we put away the current pointer
	if (asm_seg == 1) {
		// text segment
		text_bank_addr[curr_bank] = asm_address;
	} else {
		// data / bss segment
		data_bank_addr[curr_bank] = asm_address;
	}
	
	// change bank and segment
	asm_seg = nseg;
	curr_bank = nbank;
	
	// get the pointer back
	if (asm_seg == 1) {
		// text segment
		asm_address = text_bank_addr[curr_bank];
	} else {
		// data / bss segment
		asm_address = data_bank_addr[curr_bank];
	}
}

/*
 * generates the final binary
 */
void asm_generate_binary()
{
	int i, o;
	
	for (o = 0; o <= max_bank; o++) {
		// output header
		sio_out(0x02);
		sio_out(0x81);
		for (i = 0; i < 126; i++)
			sio_out(0xFF);
		
		// output data segment
		for (i = 0; i < 128; i++)
			sio_out(data_out[o * 128 + i]);
		
		// output isr segment
		for (i = 0; i < 128; i++) {
			sio_out(isr_out[o * 128 + i] >> 8);
			sio_out(isr_out[o * 128 + i] & 0xFF);
		}
	}
}

/*
 * perform assembly functions
 */
void asm_assemble(char flagv, char flagl)
{
	char tok, type, next;
	int ifdepth, trdepth, i;
	uint16_t result, size;
	struct symbol *sym;

	// set lower flag
	is_lower = flagl;

	// reset data structures
	asm_reset();

	// start at pass 1
	asm_pass = 0;

	// place pointer starts
	asm_address = is_lower ? 0 : 128;
	for (i = 0; i < 256; i++) {
		data_bank_addr[i] = 0;
		text_bank_addr[i] = is_lower ? 0 : 128;
	}
	
	// reset the segments too
	asm_seg = 1;
	curr_bank = 0;
	
	// reset local count
	loc_cnt = 0;
	
	// reset if and true depth
	ifdepth = trdepth = 0;
	
	// reset outputs
	for (i = 0; i < 128 * 256; i++) {
		data_out[i] = 0;
		isr_out[i] = 0;
	}
	
	// general line input stuff
	while (1) {
		// read the next 
		tok = asm_token_read();
		sio_mark(asm_address, curr_bank);
		//if (tok != 'a') printf("reading: %c\n", tok);
		//else printf("reading: %s\n", token_buf);
		
		// at end of assembly, next pass or done
		if (tok == -1) {
			
			if (ifdepth)
				asm_error("unpaired .if");
			
			if (!asm_pass) {
				// first pass -> second pass
				if (flagv)
					printf("first pass done: %d symbols %d locals\n", sym_count, loc_count);
				asm_pass++;
				loc_cnt = 0;
				
				// place pointer starts
				asm_address = is_lower ? 0 : 128;
				for (i = 0; i < 256; i++) {
					data_bank_addr[i] = 0;
					text_bank_addr[i] = is_lower ? 0 : 128;
				}
				
				// reset segmenting
				asm_seg = 1;
				curr_bank = 0;

				// reset assembly pointer
				sio_rewind();
				
				continue;
			} else {

				// emit the binary
				asm_generate_binary();
				
				if (flagv)
					printf("second pass done: %d symbols %d locals\n", sym_count, loc_count);
				
				break;
			}
		}
		
		// command read
		if (tok == '.') {
			tok = asm_token_read();
			
			if (tok != 'a')
				asm_error("expected directive");
			
			
			// if directive
			if (asm_sequ(token_buf, "if")) {
				ifdepth++;
				
				// evaluate the expression
				type = asm_evaluate(&result, 0);
				
				if (type != 4)
					asm_error("must be absolute");
				
				if (result)
					trdepth++;
				
				asm_eol();
				continue;
			}
			
			// endif directive
			else if (asm_sequ(token_buf, "endif")) {
				if(!ifdepth)
					asm_error("unpaired .endif");
				
				if (ifdepth == trdepth)
					trdepth--;
				ifdepth--;
				
				asm_eol();
				continue;
			}
			
			// skip if in an untrue if segment
			if (ifdepth > trdepth) {
				asm_skip();
				continue;
			}
		
			
			next = 0;
			if (asm_sequ(token_buf, "text")) {
				next = 1;
			} else if (asm_sequ(token_buf, "data")) {
				next = 2;
			} else if (asm_sequ(token_buf, "bss")) {
				next = 3;
			}
			
			// change segment
			if (next != 0) {
				asm_change_seg(next, curr_bank);
				asm_eol();
				continue;
			}
			
			// bank directive
			if (asm_sequ(token_buf, "bank")) {

				// evaluate the expression
				type = asm_evaluate(&result, 0);
				
				if (type != 4)
					asm_error("must be absolute");
				
				if (result > 255)
					asm_error("invalid bank");
				
				asm_change_seg(asm_seg, result);
				asm_eol();
				continue;
			}
			
			// org directive
			if (asm_sequ(token_buf, "org")) {

				// evaluate the expression
				type = asm_evaluate(&result, 0);
				
				if (type != 4)
					asm_error("must be absolute");
				
				if (result > 255)
					asm_error("invalid origin");
				
				asm_address = result;
				asm_eol();
				continue;
			}
			
			
			// define directive
			else if (asm_sequ(token_buf, "def")) {
				tok = asm_token_read();
				if (tok != 'a') 
					asm_error("expected symbol");
				asm_token_cache(sym_name);
				result = asm_bracket(1);
				asm_define(sym_name, result);
				asm_eol();

			}
			
			// label define directive
			else if (asm_sequ(token_buf, "defl")) {
				tok = asm_token_read();
				if (tok != 'a') 
					asm_error("expected symbol");
				
				asm_token_cache(sym_name);
				result = asm_bracket(1);
				tok = asm_token_read();
				if (tok != 'a') 
					asm_error("expected symbol");
				
				sym = asm_type_size(sym_name, &size);
				if (!size)
					asm_error("not a type");
				
				sym = asm_sym_update(sym_table, token_buf, 4, sym, asm_address);
				sym->size = size;
				asm_define(sym_name, result);
				asm_eol();
			}
			
			// type directive
			else if (asm_sequ(token_buf, "type")) {
				tok = asm_token_read();
				if (tok == 'a') {
					asm_token_cache(sym_name);
					asm_type(sym_name);
					asm_eol();
				} else
					asm_error("expected symbol");
			} else
				asm_error("unexpected token");
			
			continue;
		}
		
		// skip if in an untrue if segment
		if (ifdepth > trdepth && tok != 'n') {
			asm_skip();
		}
		
		// symbol read
		else if (tok == 'a')  {
			
			// try to get the type of the symbol
			if (asm_instr(token_buf)) {
				// it's an instruction
				asm_eol();
			} else if (sio_peek() == '=') {
				// it's a symbol definition
				asm_token_cache(sym_name);
				asm_token_read();
				
				// evaluate the expression
				type = asm_evaluate(&result, 0);
				
				// set the new symbol
				asm_sym_update(sym_table, sym_name, 4, NULL, result);
				asm_eol();
			} else if (sio_peek() == ':') {
				// it's a label
				
				// set the new symbol (if it is the first pass)
				if (!asm_pass) {
					asm_sym_update(sym_table, token_buf, 4, NULL, asm_address);
				}
				
				asm_token_read();
			} else {
				asm_error("unexpected symbol");
			}
		} 
		
		else if (tok == '0') {
			// numeric read
			result = asm_num_parse(token_buf);
			
			if (result > 9)
				asm_error("local too large");
			
			asm_expect(':');
			
			loc_cnt++;
			if (!asm_pass)
				asm_local_add(result, 4, asm_address);
			
		} else if (tok != 'n') {
			asm_error("unexpected token");
		}
	}
	
}