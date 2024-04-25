; SYS.S
; USER SYSTEM CALL HANDLER
; GAVIN TERSTEEG, 2024
; SDMAY24-14

.BANK BI
SYS0_B	= BI
.TEXT

	; SYSTEM CALL HANDLER
	; A = SYSTEM CALL ARGUMENT
	; [M0] = SYSTEM CALL #
SYSHNDL:LOAD	B,[M0]
	
	; 0: S_EXIT
	ADDI	B,0
	BRNZ	9F
	
	; CLOSE FILE AND JUMP TO PROMPT
	LOADI	C,CORE0_B
	STOREF	[D+1],C
	LOADI	C,DOCMD
	STOREF	[D],C
	
	LOADI	B,FS0_B
	LOADI	C,FCLOSE
	JUMP	INDIR
	
	; 1: S_PUTC
9:	SUBI	B,1
	BRNZ	9F

	LOADI	B,TTY0_B
	LOADI	C,TTYPUTC
	JUMP	INDIR
	
	; 2: S_GETC
9:	SUBI	B,1
	BRNZ	9F

	LOADI	B,TTY0_B
	LOADI	C,TTYGETC
	JUMP	INDIR
	
	; 3: S_STAT
9:	SUBI	B,1
	BRNZ	9F

	LOADI	B,TTY0_B
	LOADI	C,TTYSTAT
	JUMP	INDIR

	; 4: S_PUTS
9:	SUBI	B,1
	BRNZ	9F

	LOADI	B,TTY0_B
	LOADI	C,TTYPUTS
	JUMP	INDIR
	
	; 5: S_INPUT
9:	SUBI	B,1
	BRNZ	9F

	LOADI	B,TTY0_B
	LOADI	C,TTYINPT
	JUMP	INDIR
	
	; 6: S_OPEN
9:	SUBI	B,1
	BRNZ	9F

	; ALLOCATE SPACE ON THE STACK
	; AND STORE SEARCH ARGUMENT
	SUBI	D,3
	STOREF	[D+2],A

	; START BY CLOSING THE FILE
	LOADI	C,BI
	STOREF	[D+1],C
	LOADI	C,@+5
	STOREF	[D],C
	
	LOADI	B,FS0_B
	LOADI	C,FCLOSE
	JUMP	INDIR
	
	; GET THE DEFAULT USER AREA
	LOADI	C,0
	STORE	[DBANK],C
	LOAD	B,[DFT_USR]
	
	; SET THE WORKING USER AREA
	LOADI	C,WORK_B
	STORE	[DBANK],C
	STORE	[WRK_USR],B

	; ATTEMPT TO SET PARAMETERS FOR SEARCH
	LOADF	A,[D+2]
	LOADI	C,@+5
	STOREF	[D],C
	
	LOADI	B,FS0_B
	LOADI	C,SSPARAM
	JUMP	INDIR
	
	; CHECK TO MAKE SURE IT RETURNS 0X00
	ADDI	A,0
	BRNZ	SYSERR0
	
	; AND SEARCH FOR IT
	LOADI	A,0
	LOADI	C,@+5
	STOREF	[D],C
	
	LOADI	B,FS0_B
	LOADI	C,FSEARCH
	JUMP	INDIR
	
	; DID IT WORK?
	ADDI	A,0
	BRNZ	SYSERR0
	
	; NOW OPEN IT
	ADDI	D,3
	
	LOADI	B,FS0_B
	LOADI	C,FOPEN
	JUMP	INDIR
	
	; 7: S_CLOSE
9:	SUBI	B,1
	BRNZ	9F

	LOADI	B,FS0_B
	LOADI	C,FCLOSE
	JUMP	INDIR
	
	; 8: S_READ
9:	SUBI	B,1
	BRNZ	9F
	
	; CHECK TO MAKE SURE A FILE IS OPEN
	LOAD	B,[OF_OPEN]
	ADDI	B,0
	BRZ	SYSERR0

	LOADI	B,FS0_B
	LOADI	C,FREAD
	JUMP	INDIR
	
	; 9: S_WRITE
9:	SUBI	B,1
	STORE	[M0],B
	LOADI	B,SYS1_B
	LOADI	C,9F
	BRNZ	INDIR
	
	; CHECK TO MAKE SURE A FILE IS OPEN
	LOAD	B,[OF_OPEN]
	ADDI	B,0
	BRZ	SYSERR0

	LOADI	B,FS0_B
	LOADI	C,FWRITE
	JUMP	INDIR
	
	; SYSCALL ERROR
SYSERR0:ADDI	D,3
	LOADI	A,0XFF
	JUMP	IRET
	
	; BANK IS DONE, MOVE ON TO THE NEXT
BI	= BI-1
.BANK BI
SYS1_B	= BI
.TEXT

	; 10: S_FSRCH
9:	LOAD	B,[M0]
	SUBI	B,1
	BRNZ	9F
	
	; ALLOCATE SPACE ON THE STACK
	; AND STORE SEARCH ARGUMENT
	SUBI	D,3
	STOREF	[D+2],A
	
	; CHECK TO MAKE SURE THE FILE IS CLOSED
	LOAD	B,[OF_OPEN]
	ADDI	B,0
	BRNZ	SYSERR1
	
	; GET THE DEFAULT USER AREA
	LOADI	C,0
	STORE	[DBANK],C
	LOAD	B,[DFT_USR]
	
	; SET THE WORKING USER AREA
	LOADI	C,WORK_B
	STORE	[DBANK],C
	STORE	[WRK_USR],B

	; ATTEMPT TO SET PARAMETERS FOR SEARCH
	LOADI	C,BI
	STOREF	[D+1],C
	LOADF	A,[D+2]
	LOADI	C,@+5
	STOREF	[D],C
	
	LOADI	B,FS0_B
	LOADI	C,SSPARAM
	JUMP	INDIR
	
	; CHECK TO MAKE SURE IT RETURNS 0X00
	ADDI	A,0
	BRNZ	SYSERR1
	
	; AND SEARCH FOR IT
	LOADI	A,0
	ADDI	D,3
	
	LOADI	B,FS0_B
	LOADI	C,FSEARCH
	JUMP	INDIR
	
	; 11: S_NEXT
9:	SUBI	B,1
	BRNZ	9F
	
	; CHECK TO MAKE SURE THE FILE IS CLOSED
	LOAD	B,[OF_OPEN]
	ADDI	B,0
	LOADI	A,0XFF
	BRNZ	IRET

	LOADI	A,1
	LOADI	B,FS0_B
	LOADI	C,FSEARCH
	JUMP	INDIR
	
	; 12: S_DELET
9:	SUBI	B,1
	BRNZ	9F
	
	; CHECK TO MAKE SURE THE FILE IS OPEN
	LOAD	B,[OF_OPEN]
	ADDI	B,0
	LOADI	A,0XFF
	BRZ	IRET

	; FREE THE FILE
	LOADI	B,AL0_B
	LOADI	C,FFREE
	JUMP	INDIR
	
	; 13: S_CREAT
9:	SUBI	B,1
	BRNZ	9F

	LOADI	B,SYS2_B
	LOADI	C,SCREAT
	JUMP	INDIR
	
	; 14: S_FREE
9:	SUBI	B,1
	BRNZ	9F
	
	; CHECK TO MAKE SURE THE FILE IS CLOSED
	LOAD	B,[OF_OPEN]
	ADDI	B,0
	LOADI	A,0XFF
	BRNZ	IRET
	
	LOADI	A,0XFF
	LOADI	B,AL0_B
	LOADI	C,INDEX
	JUMP	INDIR
	
	; 15: S_EXEC
9:	SUBI	B,1
	BRNZ	9F
	
	; SET WORKING USER AREA TO COMMAND LINE BANK
	LOADI	A,CMDL_B
	STORE	[WRK_USR],A
	
	LOADI	B,CORE0_B
	LOADI	C,EXEC
	JUMP	INDIR
	
	; 16: S_PRNTC
9:	SUBI	B,1
	BRNZ	9F
	
	LOADI	B,PRT0_B
	LOADI	C,PRTPUTC
	JUMP	INDIR
	
	; 17: S_PSTAT
9:	SUBI	B,1
	BRNZ	9F
	
	LOADI	B,PRT0_B
	LOADI	C,PRTSTAT
	JUMP	INDIR
	
	; UNKNOWN SYSCALL
9:	LOADI	A,0XFF
	JUMP	IRET

	; SYSCALL ERROR
SYSERR1:ADDI	D,3
	LOADI	A,0XFF
	JUMP	IRET
	
	; BANK IS DONE, MOVE ON TO THE NEXT
BI	= BI-1
.BANK BI
SYS2_B	= BI
.TEXT

	; SYSTEM CREATE ROUTINE
	; ALLOCATE SPACE ON THE STACK
	; AND STORE SEARCH ARGUMENT
SCREAT:	SUBI	D,3
	STOREF	[D+2],A

	; START BY CLOSING THE FILE
	LOADI	C,BI
	STOREF	[D+1],C
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,FS0_B
	LOADI	C,FCLOSE
	JUMP	INDIR
	
	; GET THE DEFAULT USER AREA
	LOADI	C,0
	STORE	[DBANK],C
	LOAD	B,[DFT_USR]
	
	; SET THE WORKING USER AREA
	LOADI	C,WORK_B
	STORE	[DBANK],C
	STORE	[WRK_USR],B

	; ATTEMPT TO SET PARAMETERS FOR SEARCH
	LOADF	A,[D+2]
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,FS0_B
	LOADI	C,SSPARAM
	JUMP	INDIR
	ADDI	A,0
	BRNZ	SYSERR2
	
	; CHECK PATTERN FOR WILDCARDS
	LOADI	B,MATCH
	LOADI	C,10
0:	LOADF	A,[B]
	SUBI	A,'?'
	LOADI	A,0XFF
	BRZ	SYSERR2
	SUBI	C,1
	BRNZ	0B
	
	; AND SEARCH FOR IT
	LOADI	A,0
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,FS0_B
	LOADI	C,FSEARCH
	JUMP	INDIR
	ADDI	A,0
	BRNZ	1F
	
	; NOW OPEN IT
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,FS0_B
	LOADI	C,FOPEN
	JUMP	INDIR
	ADDI	A,0
	BRNZ	SYSERR2
	
	; AND FREE IT
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,AL0_B
	LOADI	C,FFREE
	JUMP	INDIR
	ADDI	A,0
	BRNZ	SYSERR2

	; NOW WE CAN ALLOCATE A NEW FILE
1:	ADDI	D,3
	LOADI	B,AL0_B
	LOADI	C,FALLOC
	JUMP	INDIR
	
	; SYSCALL ERROR
SYSERR2:ADDI	D,3
	LOADI	A,0XFF
	JUMP	IRET

	; BANK IS DONE, MOVE ON TO THE NEXT
BI	= BI-1
