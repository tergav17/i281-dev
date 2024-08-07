; XMODEM.S
; SEND OR RECIEVE A FILE VIA XMODEM
; GAVIN TERSTEEG, 2024
; SDMAY24-14

; BUFFER WILL START AT BANK 2
BUFFER	= 2

; BANK ALLOCATION STUFF
BI	= 1
BD	= 1

; MAXIMUM ARGUMENTS
MAXARGS	= 1

; PROTOCOL VALUES
ACK	= 0X06
NAK	= 0X15
SOH	= 0X01
EOT	= 0X04
EOF	= 0X1A
CAN	= 0X18

.TEXT
.BANK	BI
CORE0_B	= BI

	; START BY PROCESSING THE ARGUMENTS
START:	LOADI	A,0
	STORE	[DBANK],A
	
	; RESET ARG STATE
	STORE	[SFLAG],A
	STORE	[TFLAG],A
	STORE	[ARGC],A
	
	; SET UP STACK
	LOADI	D,0X60-2
	
	; SYSCALL RETURN BANK
	LOADI	C,1	
	STOREF	[D+1],C
	
	; SET UP POINTER
	LOADI	C,0
	
	; GO TO ARGUMENT BANK
0:	LOAD	A,[CMDL_B]
	STORE	[ARG_BNK],A
	STORE	[DBANK],A

	; SKIP THE CURRENT ARGUMENT
1:	LOADF	A,[C]
	LOADI	B,0X20
	CMP	A,B
	BRBE	2F
	ADDI	C,1
	JUMP	1B

	; LOOK FOR AN ARGUMENT
2:	LOADF	A,[C]
	ADDI	A,0
	BRZ	ARGDONE
	CMP	A,B
	BRA	3F
	ADDI	C,1
	JUMP	2B

	; IS IT A FLAG?
3:	LOADI	B,'-'
	CMP	A,B
	BRNZ	5F
	
	; HANDLE FLAGS HERE	
4:	ADDI	C,1
	LOADF	A,[C]
	ADDI	A,0
	BRZ	ARGDONE
	LOADI	B,0X20
	CMP	A,B
	BRBE	2B
	
	; REGISTER THE FLAG
	LOADI	B,0
	STORE	[DBANK],B

	SUBI	A,'S'
	BRNZ	@+2
	LOADI	B,SFLAG
	SUBI	A,'T'-'S'
	BRNZ	@+2
	LOADI	B,TFLAG
	
	; IS IT A RECOGNIZED FLAG?
	ADDI	B,0
	BRZ	ARGBAD
	LOADI	A,1
	STOREF	[B],A

	; THERE MAY BE ANOTHER FLAG
	LOAD	B,[CMDL_B]
	STORE	[ARG_BNK],B
	STORE	[DBANK],B
	JUMP	4B

	; SAVE THE ARGUMENT
5:	LOADI	B,0
	STORE	[DBANK],B
	LOAD	B,[ARGC]
	STOREF	[B+ARGV],C
	
	; DID WE EXCEED THE ALLOWED NUMBER OF ARGUMENTS
	SUBI	B,MAXARGS
	BRC	ARGBAD
	ADDI	B,MAXARGS+1
	STORE	[ARGC],B
	JUMP	0B
	
	; BAD ARGUMENT
ARGBAD:	LOADI	A,0
	STORE	[DBANK],A
	
	LOADI	A,STR_B
	STORE	[ARG_BNK],A
	LOADI	A,ERROR0
	
	; PRINT ERROR MESSAGE
	LOADI	B,S_PUTS
	LOADI	C,EXIT
	JUMP	SYSCALL	

	; EXIT PROGRAM
EXIT:	LOADI	B,0
	JUMP	SYSJUMP
	
	; ARGUMENT PROCESSING DONE
ARGDONE:LOADI	A,0
	STORE	[DBANK],A
	
	; CHECK ARG COUNT
	LOAD	A,[ARGC]
	SUBI	A,1
	BRNZ	ARGBAD
	
	; DO WE RECIEVE A FILE?
	LOAD	A,[SFLAG]
	ADDI	A,0
	BRZ	RCOPEN
	
	; LETS TRANSMIT INSTEAD
	; OPEN THE FILE
	LOAD	A,[CMDL_B]
	STORE	[ARG_BNK],A
	LOAD	A,[ARGV]
	LOADI	B,S_OPEN
	LOADI	C,@+2
	JUMP	SYSCALL
	ADDI	A,0
	LOADI	B,TRANS_B
	LOADI	C,TRANSMT
	BRZ	INDIR
	
	LOADI	A,ERROR1
	JUMP	OERROR
	
	; START BY CREATING THE FILE WE WILL BE PLACING DATA INTO
RCOPEN:	LOAD	A,[CMDL_B]
	STORE	[ARG_BNK],A
	LOAD	A,[ARGV]
	LOADI	B,S_CREAT
	LOADI	C,@+2
	JUMP	SYSCALL
	ADDI	A,0
	LOADI	B,RECV_B
	LOADI	C,RECIEVE
	BRZ	INDIR
	
	; ERROR!
	LOADI	A,ERROR2
OERROR:	LOADI	B,STR_B
	STORE	[ARG_BNK],B
	LOADI	B,S_PUTS
	LOADI	C,EXIT
	JUMP	SYSCALL

	; BANK IS DONE, MOVE ON TO THE NEXT
BI	= BI+1
.TEXT
.BANK	BI
RECV_B	= BI

	; ERROR!
RERROR:	LOADI	B,STR_B
	STORE	[ARG_BNK],B
	LOADI	B,S_PUTS
	LOADI	C,9F
	JUMP	SYSCALL
	
	; RECIEVE A FILE VIA XMODEM
RECIEVE:LOADI	C,BI
	STOREF	[D+1],C
	
	; RESET THE READ-IN STATE
0:	LOADI	A,0
	STORE	[BLOCK],A
	STORE	[LASTB],A
	LOADI	A,1
	STORE	[EXPECT],A
	LOADI	A,BUFFER+1
	STORE	[BANK],A
	STORE	[ARG_BNK],A
	
	; START OF RECIEVE STATE MACHINE
	; WAIT TILL WE STOP RECIEVING INFORMATION
RSTART: LOADI	B,0
1:	STORE	[TIMEOUT],B
	LOADI	C,@+3
RSTAT:	LOADI	B,S_STAT
	JUMP	SYSCALL
	LOAD	B,[TIMEOUT]
	ADDI	B,1
	BRZ	0F
	ADDI	A,0
	BRZ	1B
	LOADI	C,RSTART
RGETC:	LOADI	B,S_GETC
	JUMP	SYSCALL
	
	; START SENDING OUT "NAK"S AND WAIT TILL WE GET SOMETHING
0:	LOADI	A,0
1:	STORE	[TIMEOUT],A
	LOADI	C,@+2
	JUMP	RSTAT
	ADDI	A,0
	BRNZ	RCONT
	LOAD	A,[TIMEOUT]
	ADDI	A,1
	BRNZ	1B
	
	; SEND THE NAK
2:	LOADI	A,NAK
	LOADI	C,0B
RPUTC:	LOADI	B,S_PUTC
	JUMP	SYSCALL

	; WE GOT SOMETHING
RCONT:	LOADI	C,@+2
	JUMP	RGETC
	
	; IS IT EOT?
	SUBI	A,EOT
	BRZ	8F
	
	; IS IT SOH?
	SUBI	A,SOH-EOT
	BRZ	3F
	
	; IS IT CAN?
	SUBI	A,CAN-SOH
	BRZ	8F
	
	; WHAT IS THIS?
RTFAIL:	LOADI	A,ERROR3
	JUMP	RERROR
	
	; GET THE BLOCK #
3:	LOADI	C,@+2
	JUMP	RGETC
	STORE	[CURRB],A
	LOADI	C,@+2
	JUMP	RGETC
	LOAD	B,[CURRB]
	ADD	A,B
	ADDI	A,1
	BRNZ	RSTART
	
	; COPY DATA INTO BUFFER
	LOADI	B,0
4:	STORE	[CHECKSUM],A
	STORE	[POINTER],B
	LOADI	C,@+2
	JUMP	RGETC
	LOAD	B,[POINTER]
	LOADI	C,BUFFER
	STORE	[DBANK],C
	STOREF	[B],A
	LOADI	C,0
	STORE	[DBANK],C
	LOAD	C,[CHECKSUM]
	ADD	A,C
	ADDI	B,1
	BRNN	4B

	; CHECK THE SUM
	STORE	[CHECKSUM],A
	LOADI	C,@+2
	JUMP	RGETC
	LOAD	B,[CHECKSUM]
	CMP	A,B
	BRNZ	RSTART
	
	; CHECK BLOCK STATE
	; IF ITS THE SAME, LETS TRY TO GET TO THE NEXT ONE
	LOAD	A,[CURRB]
	LOAD	B,[LASTB]
	LOAD	C,[EXPECT]
	CMP	A,B
	BRZ	7F
	STORE	[LASTB],A
	CMP	A,C
	BRNZ	RTFAIL
	ADDI	C,1
	STORE	[EXPECT],C
	
	; COPY INTO BUFFER
	LOAD	A,[BANK]
	LOADI	B,BUFFER+5
	CMP	A,B
	BRNZ	5F
	
	; WRITE OUT BUFFER
	LOAD	A,[BLOCK]
	LOADI	B,S_WRITE
	LOADI	C,@+2
	JUMP	SYSCALL
	LOAD	A,[BLOCK]
	ADDI	A,1
	STORE	[BLOCK],A
	LOADI	A,BUFFER+1

	; EXECUTE COPY
5:	STORE	[SPARK],D
	LOADI	B,BUFFER
	LOADI	C,0
6:	STORE	[DBANK],B
	LOADF	D,[C]
	STORE	[DBANK],A
	STOREF	[C],D
	ADDI	C,1
	BRNN	6B
	
	; UPDATE STATE
	LOADI	B,0
	STORE	[DBANK],B
	LOAD	D,[SPARK]
	ADDI	A,1
	STORE	[BANK],A
	
	; SEND OUT ACK AND CONTINUE
7:	LOADI	A,ACK
	LOADI	C,RCONT
	JUMP	RPUTC

	; TERMINATE BLOCK
	; SEND A FINAL ACK
8:	LOADI	A,TERM_B
	STOREF	[D+1],A
	LOADI	A,ACK
	LOADI	C,RTERM
	JUMP	RPUTC
	
	; EXIT
9:	LOADI	B,CORE0_B
	LOADI	C,EXIT
	JUMP	INDIR

	; BANK IS DONE, MOVE ON TO THE NEXT
BI	= BI+1
.TEXT
.BANK	BI
TERM_B	= BI

	; TERMINATE THE LATEST RECIEVED BLOCK
	; IF IT'S INCOMPLETE
RTERM:	LOAD	A,[BANK]
	LOAD	B,[TFLAG]
	LOADI	C,BUFFER+1
	CMP	A,C
	BRZ	3F
	SUBI	A,1
	ADDI	B,0
	BRZ	2F
	
	; CORRECT TEXT ENDING
	LOADI	C,0X7F
	STORE	[DBANK],A
0:	LOADF	B,[C]
	SUBI	B,EOF
	BRNZ	1F
	STOREF	[C],B
	SUBI	C,1
	BRC	0B
1:	LOADI	B,0
	STORE	[DBANK],B

	; FILL THE TEST OF THE BUFFER WITH ZEROS
2:	ADDI	A,1
3:	LOADI	B,BUFFER+5
	CMP	A,B
	BRZ	5F
	LOADI	B,0
	LOADI	C,0
	STORE	[DBANK],A
4:	STOREF	[C],B
	ADDI	C,1
	BRNN	4B
	JUMP	2B
	
	; WRITE THE BLOCK
5:	LOADI	C,0
	STORE	[DBANK],C
	LOADI	C,CORE0_B
	STOREF	[D+1],C
	LOAD	A,[BLOCK]
	LOADI	B,S_WRITE
	LOADI	C,EXIT
	JUMP	SYSCALL
	
	; BANK IS DONE, MOVE ON TO THE NEXT
BI	= BI+1
.TEXT
.BANK	BI
TRANS_B	= BI

	; ERROR!
TERROR:	LOADI	A,ERROR3
	LOADI	B,STR_B
	STORE	[ARG_BNK],B
	LOADI	B,S_PUTS
	LOADI	C,9F
	JUMP	SYSCALL

	; TRANSMIT A FILE USING XMODEM
TRANSMT:LOADI	C,BI
	STOREF	[D+1],C

	; RESET TRANSMIT STATE
	LOADI	A,BUFFER
	STORE	[BANK],A
	STORE	[ARG_BNK],A
	LOADI	A,1
	STORE	[CURRB],A
	LOADI	A,0
	STORE	[BLOCK],A
	
	; READ THE BLOCK INTO THE BUFFER
	LOADI	B,S_READ
	LOADI	C,@+2
	JUMP	SYSCALL
	ADDI	A,0
	BRNZ	8F
	
	; CONSUME ALL PREVIOUS CHARACTERS
0:	LOADI	B,S_STAT
	LOADI	C,@+2
	JUMP	SYSCALL
	ADDI	A,0
	BRZ	0F
	LOADI	C,0B
TGETC:	LOADI	B,S_GETC
	JUMP	SYSCALL
	
	; WAIT FOR THE RECEIVER
0:	LOADI	C,@+2
	JUMP	TGETC
	
	; GET THE BANK WE WANT TO SEND
	LOAD	C,[BANK]
	
	; IS IT NAK?
	SUBI	A,NAK
	BRZ	1F
	
	; IS IT ACK?
	SUBI	A,ACK-NAK
	BRNZ	TERROR
	
	; INCREMENT PACKET
	LOAD	A,[CURRB]
	ADDI	A,1
	STORE	[CURRB],A
	
	; INCREMENT BANK
	ADDI	C,1
	STORE	[BANK],C
	LOADI	B,BUFFER+4
	CMP	B,C
	BRNZ	1F
	
	; NEXT BLOCK
	LOAD	A,[BLOCK]
	ADDI	A,1
	STORE	[BLOCK],A
	BRZ	8F
	LOADI	B,S_READ
	LOADI	C,@+2
	JUMP	SYSCALL
	ADDI	A,0
	BRNZ	8F
	LOADI	C,BUFFER
	
	; SEND OUT THE PACKET
1:	STORE	[BANK],C

	; SEND OUT SOH
	LOADI	A,SOH
	LOADI	C,@+3
TPUTC:	LOADI	B,S_PUTC
	JUMP	SYSCALL
	
	; SEND OUT PACKET #
	LOAD	A,[CURRB]
	LOADI	C,@+2
	JUMP	TPUTC
	LOADI	A,0XFF
	LOAD	B,[CURRB]
	SUB	A,B
	LOADI	C,@+2
	JUMP	TPUTC
	
	; NOW WE SEND OUT THE PACKET ITSELF
	; RESET CHECKSUM FIRST
	LOADI	B,0
	STORE	[CHECKSUM],B
2:	LOAD	A,[CHECKSUM]
	STORE	[POINTER],B
	LOAD	C,[BANK]
	STORE	[DBANK],C
	LOADF	B,[B]
	LOADI	C,0
	STORE	[DBANK],C
	ADD	A,B
	STORE	[CHECKSUM],A
	MOV	A,B
	LOADI	C,@+2
	JUMP	TPUTC
	LOAD	B,[POINTER]
	ADDI	B,1
	BRNN	2B
	
	; SEND OUT THE CHECKSUM NOW
	LOAD	A,[CHECKSUM]
	LOADI	C,0B
	JUMP	TPUTC
	
	; END OF TRANSMISSION
8:	LOADI	A,EOT
	LOADI	C,@+2
	JUMP	TPUTC
	
	; EXIT
9:	LOADI	B,CORE0_B
	LOADI	C,EXIT
	JUMP	INDIR

.DATA
.BANK	BD
STR_B	= BD

	; ERROR MESSAGES
.DEFL BYTE ERROR0	"INVALID ARGUMENTS",0X0A,0X0D,
			"USAGE: XMODEM [-ST] FILE",0X0A,0X0D,0
.DEFL BYTE ERROR1	"CAN'T OPEN FILE",0X0A,0X0D,0
.DEFL BYTE ERROR2	"CAN'T CREATE FILE",0X0A,0X0D,0
.DEFL BYTE ERROR3	CAN,CAN,CAN,"TRANSFER FAILED",0X0A,0X0D,0

	; ZERO BANK STUFF
.BANK	0
.BSS

	; COMMAND LINE ARGUMENTS
.DEFL BYTE ARGC		0
.DEFL BYTE ARGV		0,0

	; COMMAND LINE FLAGS
.DEFL BYTE SFLAG	0
.DEFL BYTE TFLAG	0

	; XMODEM STATE
.DEFL BYTE POINTER	0
.DEFL BYTE BLOCK	0
.DEFL BYTE BANK		0
.DEFL BYTE TIMEOUT	0
.DEFL BYTE CHECKSUM	0
.DEFL BYTE CURRB	0
.DEFL BYTE LASTB	0
.DEFL BYTE EXPECT	0

	; STACK PARKING SPACE
.DEFL BYTE SPARK	0