/*
 * sio.c
 *
 * source input/output adapter
 */
#include "sio.h"
 
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

//todo: fix bytewise i/o on fout and tmp files

/* global copy of arguments */
char **sio_argv;
int sio_argc;
int sio_argi;
int sio_argini;

/* buffer state stuff */
char sio_buf[512];
int sio_bufc;
int sio_bufi;

/* current line number */
int sio_line;

/* current line being processed */
int sio_current;

/* currently open file */
FILE *sio_curr;

/* output file */
FILE *sio_fout;

char lname[256];

/*
 * loads up the first block of the next file
 */
void sio_nextfile()
{
	// close current file if open
	if (sio_curr) {
		fclose(sio_curr);
		sio_curr = NULL;
	}
	
	// attempt to open the next file
	for (sio_argi++; sio_argi < sio_argc; sio_argi++) {
		
		// reset line pointer
		sio_line = 1;
		sio_current = 1;
		
		// do not open arguments that start with '-'
		if (sio_argv[sio_argi][0] == '-')
			continue;

		if ((sio_curr = fopen(sio_argv[sio_argi], "r"))) {
			
			sio_bufi = 0;
			
			// attempt to read the initial block
			if (0 < (sio_bufc = fread(sio_buf, 1, 512, sio_curr))) {
				break;
			} else {
				fclose(sio_curr);
				sio_curr = NULL;
			}
			
		} else {
			// file open error
			printf("%s?\n", sio_argv[sio_argi]);
		}
	}
}

/*
 * uses passed arguments to open up files in need of assembly
 * arguments starting with '-' are ignored
 *
 * argc = argument count
 * argv = array of arguments
 */
void sio_open(int argini, int argc, char *argv[], char *name)
{
	sio_argv = argv;
	sio_argc = argc;
	sio_argini = argini;

	sprintf(lname, "%s.sav", name);

	if (!(sio_fout = fopen(lname, "wb"))) {
		printf("cannot open %s\n", lname);
		exit(1);
	}

	sio_curr = NULL;
	sio_rewind();
}

/*
 * closes source files when done
 */
void sio_close()
{
	if (sio_curr) fclose(sio_curr);
	fclose(sio_fout);
	sio_curr = NULL;
	sio_fout = NULL;
}

/*
 * returns what sio_next() would but does not move forward
 */
char sio_peek()
{
	return (sio_argi < sio_argc) ? sio_buf[sio_bufi] : -1;
}

/*
 * returns the next character in the source, or -1 if complete
 */
char sio_next()
{
	char out;
	
	// nothing more to read, return -1
	if (sio_argi >= sio_argc)
		return -1;
	
	out = sio_buf[sio_bufi];
	
	// if there is still bytes is the buffer, find the next one
	
	if (++sio_bufi >= sio_bufc) {
			// attempt to read the next block
			if (0 < (sio_bufc = fread(sio_buf, 1, 512, sio_curr))) {
				sio_bufi = 0;
			} else {
				sio_nextfile();
			}
	}
	
	// if we have just passed a line break, increment the pointer
	if (out == '\n') sio_line++;
	
	return out;
}

/*
 * brings the file pointer back to the beginning of source
 */
void sio_rewind()
{	

	printf("argini = %d\n", sio_argini);
	sio_argi = sio_argini;
	
	sio_nextfile();
}

/*
 * prints the current state of the input, whatever that looks like
 */
void sio_status()
{
	printf("%s:%d", (sio_argi < sio_argc) ? sio_argv[sio_argi] : sio_argv[sio_argc-1], sio_current);
}

/*
 * used by the assembler to mark what line is being assembled
 */
void sio_mark()
{
	sio_current = sio_line;
}

/*
 * outputs a byte onto a.out
 *
 * out = byte to output
 */
void sio_out(char out)
{
	fwrite(&out, 1, 1, sio_fout);
}