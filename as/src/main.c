#include <stdio.h>
#include <stdlib.h>

#include "sio.h"
#include "asm.h"

#define VERSION "1.1"

/* flags */
char flagv = 0;
char flagl = 0;

/* arg zero */
char *argz;

/*
 * print usage message
 */
void usage()
{
	printf("usage: %s [-vl] [-o output] source.s ...\n", argz);
	exit(1);
}


int main(int argc, char *argv[])
{
	int i, o, l;
	char *name;

	argz = argv[0];

	// default name is a
	name = "a";
	
	// flag switch
	for (i = 1; i < argc; i++) {
		if (argv[i][0] == '-') {
			l = o = 1;
			while (argv[i][o] && l) {
				switch (argv[i][o++]) {
						
					case 'v':
						flagv++;
						break;
						
					case 'l':
						flagl++;
						break;
						
					case 'o':
						i++;
						l = 0;
						if (i >= argc)
							usage();
						name = argv[i];
						break;
						
					default:
						usage();
				}
			}
		} else
			break;
	}

	// check to see if there are any actual arguments
	if (i == argc) 
		usage();
	
	// intro message
	if (flagv)
		printf("i281as cross assembler v%s\n", VERSION);
	
	// open up the source files
	sio_open(--i, argc, argv, name);
	
	// do the assembly
	asm_assemble(flagv, flagl);
	
	// all done
	sio_close();
} 