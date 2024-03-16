; STAT.S
; SHOW FILE SYSTEM STATISTICS
; GAVIN TERSTEEG, 2024
; SDMAY24-14

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
	
	; RESET THE TELEMETRY
	LOADI	A,0
	STORE	[NUMFILE],A
	STORE	[NUMFILE+1],A
	STORE	[NUMBLK],A
	STORE	[NUMBLK+1],A
	
	; COUNT NUMBER OF FILES
	LOADI	A,1
	STORE	[ARG_BNK],A
	LOADI	A,PATH
	LOADI	B,S_FSRCH
	LOADI	C,@+2
	JUMP	SYSCALL
	
	; CHECK STATUS
0:	ADDI	A,0
	BRNZ	9F
	
	; UPDATE FILE COUNT
	LOAD	A,[NUMFILE+1]
	ADDI	A,1
	STORE	[NUMFILE+1],A
	BRNC	1F
	LOAD	A,[NUMFILE]
	ADDI	A,1
	STORE	[NUMFILE],A
	
	; ADD THE FILE SIZE TO THE RUNNING COUNT
1:	LOAD	A,[NUMBLK+1]
	LOAD	B,[CF_SIZE+1]
	ADD	A,B
	STORE	[NUMBLK+1],A
	LOAD	A,[NUMBLK]
	BRNC	2F
	ADDI	A,1
2:	LOAD	B,[CF_SIZE]
	ADD	A,B
	STORE	[NUMBLK],A
	LOAD	A,[NUMBLK+1]
	ADDI	A,1
	STORE	[NUMBLK+1],A
	BRNC	3F
	LOAD	A,[NUMBLK]
	ADDI	A,1
	STORE	[NUMBLK],A
		
	; TRY TO GET NEXT BLOCK
3:	LOADI	B,S_NEXT
	LOADI	C,0B
	JUMP	SYSCALL
	
	
9:	; MOVE BD_FREE TO VALUE
	LOAD	A,[NUMFILE]
	STORE	[VALUE],A
	LOAD	A,[NUMFILE+1]
	STORE	[VALUE+1],A
	
	; PRINT IT OUT
	LOADI	A,1
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,2
	LOADI	C,PRINTD
	JUMP	INDIR
	
	; PRINT OUT STRING TOO
	LOADI	A,FINUSE
	LOADI	B,S_PUTS
	LOADI	C,@+2
	JUMP	SYSCALL
	
	; MOVE BD_FREE TO VALUE
	LOAD	A,[NUMBLK]
	STORE	[VALUE],A
	LOAD	A,[NUMBLK+1]
	STORE	[VALUE+1],A
	
	; PRINT IT OUT
	LOADI	A,1
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,2
	LOADI	C,PRINTD
	JUMP	INDIR
	
	; PRINT OUT STRING TOO
	LOADI	A,BINUSE
	LOADI	B,S_PUTS
	LOADI	C,@+2
	JUMP	SYSCALL
	
	; CALCULATE NUMBER OF BLOCKS FREE
	LOADI	B,S_FREE
	LOADI	C,@+2
	JUMP	SYSCALL
	
	; MOVE BD_FREE TO VALUE
	LOAD	A,[BD_FREE]
	STORE	[VALUE],A
	LOAD	A,[BD_FREE+1]
	STORE	[VALUE+1],A
	
	; PRINT IT OUT
	LOADI	A,1
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,2
	LOADI	C,PRINTD
	JUMP	INDIR
	
	; PRINT OUT STRING TOO
	LOADI	A,BLKFREE
	LOADI	B,S_PUTS
	LOADI	C,@+2
	JUMP	SYSCALL
	
	; EXIT
EXIT:	LOADI	B,0
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
0:	LOAD	C,[VALUE]
	LOAD	D,[VALUE+1]
	
	; DO 16 BIT SUBTRACTION
1:	SUB	D,B
	BRC	2F
	SUBI	C,1
	BRNC	4F
2:	SUB	C,A
	BRNC	4F
	
	; SAVE VALUE
	STORE	[VALUE],C
	STORE	[VALUE+1],D
	
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
	
	
	
.BANK 1
.DATA

	; PATH TO SEARCH ALL FILES
.DEFL BYTE PATH		"?:*.*",0

	; ASSORTED MESSAGES
.DEFL BYTE FINUSE	" FILES IN USE",0X0A,0X0D,0
.DEFL BYTE BINUSE	" BLOCKS IN USE",0X0A,0X0D,0
.DEFL BYTE BLKFREE	" BLOCKS FREE",0X0A,0X0D,0
	
.BANK 0
.BSS
	; DEFINE SOME SPACE ON THE ZERO BANK FOR STATE INFORMATION

	; VALUE THAT WILL BE PRINTED
.DEFL BYTE VALUE	0,0

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