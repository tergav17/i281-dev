; DIR.S
; LIST FILES IN DIRECTORY

.BANK 1
.TEXT
	; START HERE
	; SET OUT BANK TO BANK 0
START:	LOADI	A,0
	STORE	[DBANK],A
	
	; SET UP STACK
	LOADI	D,0X60-2
	
	; FIRST ORDER OF BUISNESS: CLOSE EXISTING FILE
	
	; SET UP SYSTEM CALL ARGUMENTS
	LOADI	B,S_CLOSE
	
	; SET UP RETURN ADDRESS
	LOADI	C,1	; RETURN BANK
	STOREF	[D+1],C
	LOADI	C,@+2	; RETURN ADDRESS
	
	; AND DO SYSCALL
	JUMP	SYSCALL
	
	; PROCESS ARGUMENTS
	LOADI	B,3
	LOADI	C,DOARGS
	JUMP	INDIR
	
	; START THE SEARCH
	; SET THE SYSTEM CALL TYPE
	; AND EXECUTE
BEGIN:	LOADI	B,S_FSRCH
	LOADI	C,@+2
	JUMP	SYSCALL
	LOADI	B,1
	STORE	[ARG_BNK],B
	
	; MAKE SURE WE GET A FILE
	ADDI	A,0
	LOADI	A,NOFILE
	LOADI	B,S_PUTS
	LOADI	C,END
	BRNZ	SYSCALL
	
	; RESET RECORD KEEPING
	LOADI	A,0
	STORE	[NUMFILE],A
	STORE	[NUMFILE+1],A
	STORE	[NUMFILE+2],A
	STORE	[NUMFILE+3],A
	
	; PRINT HEADER
	LOADI	A,HEADER
	LOADI	B,S_PUTS
	LOADI	C,@+2
	JUMP	SYSCALL
	
	; PRINT THE FILE LISTING
	; UPDATE THE FILE COUNTER
PRINTFI:LOAD	A,[NUMFILE+1]
	ADDI	A,1
	STORE	[NUMFILE+1],A
	BRNC	0F
	LOAD	A,[NUMFILE]
	ADDI	A,1
	STORE	[NUMFILE],A

	; MOVE THE USER AREA
0:	LOAD	A,[CF_USR]
	LOADI	B,1
	STORE	[DBANK],B
	STORE	[LSSTART],A
	LOADI	B,0
	STORE	[DBANK],B

	; PRINT OUT THE START OF THE LISTING
	LOADI	A,LSSTART
	LOADI	B,S_PUTS
	LOADI	C,@+2
	JUMP	SYSCALL

	; START PRINTING OUT THE NAME PROPER
	LOADI	A,6
	STORE	[MAXIMUM],A
	LOADI	A,0
	
	; STORE THE COUNTER
0:	STORE	[COUNT],A

	; GET THE CHARACTER FROM THE NAME
	LOADF	A,[A+CF_NAME]
	LOADI	B,S_PUTC
	LOADI	C,@+2
	JUMP	SYSCALL
	
	; DO WE COUNT UP?
	LOAD	A,[COUNT]
	LOAD	B,[MAXIMUM]
	ADDI	A,1
	CMP	A,B
	BRAE	1F
	JUMP	0B
	
	; EITHER PRINT A '.' OR MOVE ON TO THE NEXT FILE
1:	SUBI	A,8
	BRZ	FINISH
	
	; PRINT A '.'
	LOADI	A,'.'

	; SET THE SYSTEM CALL TYPE
	LOADI	B,S_PUTC
	
	; SET UP RETURN ADDRESS
	; AND DO SYSCALL
	LOADI	C,@+2
	JUMP	SYSCALL
	
	LOADI	A,8
	STORE	[MAXIMUM],A
	LOADI	A,6
	JUMP	0B
	
	; FINISH OFF THE FILE LISTING
FINISH:	LOADI	A,0x20
	LOADI	B,S_PUTC
	LOADI	C,@+2
	JUMP	SYSCALL
	
	; ADD THE FILE SIZE TO THE RUNNING COUNT
	LOAD	A,[NUMBLK+1]
	LOAD	B,[CF_SIZE+1]
	ADD	A,B
	STORE	[NUMBLK+1],A
	LOAD	A,[NUMBLK]
	BRNC	2F
	ADDI	A,1
2:	LOAD	B,[CF_SIZE]
	ADD	A,B
	STORE	[NUMBLK],A
	
	; PRINT THE FILE SIZE
	LOADI	A,0
	LOADI	C,NEXT
	STOREF	[D],C
	LOADI	B,2
	LOADI	C,PRINTD
	JUMP	INDIR
	
	; GET THE NEXT FILE
	; PRINT NEW LINE
NEXT:	LOADI	A,CRLF
	LOADI	B,S_PUTS
	LOADI	C,@+2
	JUMP	SYSCALL
	
	; LOOK UP NEXT FILE
	LOADI	B,S_NEXT
	LOADI	C,@+2
	JUMP	SYSCALL
	
	; CHECK TO SEE IF IT WORKED
	ADDI	A,0
	BRZ	PRINTFI
	
	; PRINT OUT THE FILE STATS
	LOADI	B,2
	LOADI	C,ENDMSG
	JUMP	INDIR

	; AND EXIT
END:	LOADI	B,0
	JUMP	SYSJUMP	
	
.BANK	2
	
	; PRINTS THE SIZE AS A 8 OR 16 BIT BASE-10 NUMBER
	; A = 0: 8 BIT 1: 16 BIT
PRINTD: SUBI	D,2
	
	; SET PADDING TO NULL CHARACTER AT FIRST
	LOADI	C,0
	STORE	[PADDING],C
	
	; SEE IF WE ARE DOING 8 OR 16 BIT
	ADDI	A,0
	BRZ	0F
	
V	= 10000
	LOADI	A,V/256
	LOADI	B,V%256
	LOADI	C,@+2
	JUMP	DOCHAR
	
V	= 1000
	LOADI	A,V/256
	LOADI	B,V%256
	LOADI	C,@+2
	JUMP	DOCHAR
	
V	= 100
0:	LOADI	A,V/256
	LOADI	B,V%256
	LOADI	C,@+2
	JUMP	DOCHAR
	
V	= 10
	LOADI	A,V/256
	LOADI	B,V%256
	LOADI	C,@+2
	JUMP	DOCHAR
	
	LOADI	A,'0'
	STORE	[PADDING],A
	
V	= 1
	LOADI	A,V/256
	LOADI	B,V%256
	LOADI	C,@+2
	JUMP	DOCHAR
	
	ADDI	D,2 
	JUMP	IRET
	
	; A = UPPER SUB
	; B = LOWER SUB
DOCHAR:	STORE	[LEAFRET],C
	LOAD	C,[PADDING]	
	STORE	[CHAR],C
	
	; PARK THE STACK
	STORE	[SPARK],D

	; GET THE SIZE
0:	LOAD	C,[CF_SIZE]
	LOAD	D,[CF_SIZE+1]
	
	; DO 16 BIT SUBTRACTION
1:	SUB	D,B
	BRC	2F
	SUBI	C,1
	BRNC	4F
2:	SUB	C,A
	BRNC	4F
	
	; SAVE VALUE
	STORE	[CF_SIZE],C
	STORE	[CF_SIZE+1],D
	
	; GET THE CHAR AND CHECK TO SEE IF IT IS A WHITESPACE
	LOAD	C,[CHAR]
	LOADI	D,0X20
	CMP	C,D
	BRA	3F
	
	; SET PADDING AND CHAR TO '0'
	LOADI	C,'0'
	STORE	[PADDING],C
	
3:	ADDI	C,1
	STORE	[CHAR],C
	JUMP	0B
	
	; RESTORE THE STACK
4:	LOAD	D,[SPARK]
	
	; SEE IF IT IS ZERO
	LOAD	A,[CHAR]
	ADDI	A,0
	BRNZ	5F
	LOAD	C,[LEAFRET]
	JUMPR	C
	
	; PRINT THE CHARACTER
5:	LOADI	B,S_PUTC
	LOADI	C,2	; RETURN BANK
	STOREF	[D+1],C
	LOAD	C,[LEAFRET]
	JUMP	SYSCALL
	
ENDMSG:	LOADI	C,2
	STOREF	[D+1],C
	LOADI	A,CRLF
	LOADI	B,S_PUTS
	LOADI	C,@+2
	JUMP	SYSCALL

	; MOVE NUM FILES
	LOAD	A,[NUMFILE]
	STORE	[CF_SIZE],A
	LOAD	A,[NUMFILE+1]
	STORE	[CF_SIZE+1],A
	
	; PRINT NUMBER OF FILES
	LOADI	A,1
	LOADI	C,@+3
	STOREF	[D],C
	JUMP	PRINTD
	
	; PRINT FIRST PART OF MESSAGE
	LOADI	A,ENDMSG0
	LOADI	B,S_PUTS
	LOADI	C,@+2
	JUMP	SYSCALL
	
	; MOVE NUM BLOCKS
	LOAD	A,[NUMBLK]
	STORE	[CF_SIZE],A
	LOAD	A,[NUMBLK+1]
	STORE	[CF_SIZE+1],A
	
	; PRINT NUMBER OF BLOCKS
	LOADI	A,1
	LOADI	C,@+3
	STOREF	[D],C
	JUMP	PRINTD
	
	; PRINT SECOND PART OF MESSAGE
	LOADI	A,ENDMSG1
	LOADI	B,S_PUTS
	LOADI	C,@+2
	JUMP	SYSCALL
	
	; EXIT
	LOADI	B,0
	JUMP	SYSJUMP
	
.BANK	3

	; DO ARGUMENT PROCESSING
	; SWITCH TO ARGUMENT PAGE
DOARGS:	LOAD	A,[CMDL_B]
	STORE	[ARG_BNK],A
	STORE	[DBANK],A
	
	; SET UP POINTER
	LOADI	C,0
	
	; SKIP THE INITIAL COMMAND
0:	LOADF	A,[C]
	LOADI	B,0X20
	CMP	A,B
	BRBE	1F
	ADDI	C,1
	JUMP	0B

	; LOOK FOR THE FIRST ARGUMENT
1:	LOADF	A,[C]
	ADDI	A,0
	BRZ	2F
	CMP	A,B
	BRA	3F
	ADDI	C,1
	JUMP	1B
	
	; NO MORE ARGS, USE DEFAULT PATH
2:	LOADI	A,DFTPATH
	LOADI	B,1
	JUMP	9F
	
	; THERE IS AN ARG, SEE IF IT IS IN THE FORMAT OF '0:'
3:	LOADF	A,[C+1]
	SUBI	A,':'
	BRNZ	4F
	LOADF	A,[C+2]
	SUBI	A,0X20
	BRA	4F
	
	; YEP, LETS ADD THE *.* AND RETURN
	LOADI	A,'*'
	STOREF	[C+2],A
	STOREF	[C+4],A
	LOADI	A,'.'
	STOREF	[C+3],A
	LOADI	A,0
	STOREF	[C+5],A
	
	; RETURN
4:	MOV	A,C
	LOADI	B,1
	LOADI	C,0
	STORE	[DBANK],C
	LOADI	C,BEGIN
	JUMP	INDIR
	
9:	LOADI	C,0
	STORE	[DBANK],C
	STORE	[ARG_BNK],B
	LOADI	B,1
	LOADI	C,BEGIN
	JUMP	INDIR



.BANK	1
.DATA

	; CR / LF
.DEFL BYTE CRLF		0X0A,0X0D,0

	; FILE LISTING HEADER
.DEFL BYTE HEADER	"UA NAME   EX SIZE",0X0A,0X0D,0

	; FILE LIST START
.DEFL BYTE LSSTART	"0: ",0

	; DEFAULT PATH TO SEARCH
.DEFL BYTE DFTPATH		"*.*",0

	; OPERATION END MESSAGE STRINGS
.DEFL BYTE ENDMSG0	" FILES OVER ",0
.DEFL BYTE ENDMSG1	" BLOCKS",0X0A,0X0D,0

	; NO FILE MESSAGE
.DEFL BYTE NOFILE	"NO FILES",0X0A,0X0D,0

.BANK 0
.BSS
	; DEFINE SOME SPACE ON THE ZERO BANK FOR STATE INFORMATION

	; GENERAL PURPOSE COUNTER
.DEFL BYTE COUNT	0

	; COUNTER MAXIMUM
.DEFL BYTE MAXIMUM	0

	; VALUE FOR DECIMAL NUMBER PRINT
.DEFL BYTE CHAR		0

	; PADDING FOR DECIMAL NUMBER PRINT
.DEFL BYTE PADDING	0

	; RETURN FOR LEAF FUNCTIONS
.DEFL BYTE LEAFRET	0

	; STACK PARKING SPACE
.DEFL BYTE SPARK	0

	; RECORD KEEPING
.DEFL BYTE NUMFILE	0,0
.DEFL BYTE NUMBLK	0,0