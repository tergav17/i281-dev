#ifndef SIO_H
#define SIO_H

/* These are the functions needed to interface with the rest of the assembler */
void sio_open(int argc, char *argv[], char *name);
void sio_close();
char sio_peek();
char sio_next();
void sio_rewind();
void sio_status();
void sio_mark();

void sio_out(char out);

#endif