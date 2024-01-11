; BUBBLE.S
; BUBBLE SORT EXAMPLE
.TEXT

LAST	= 7

	LOADI  A, 0                  ; I = 0;
OUTER:  LOADI  D, LAST             ; LOAD LAST INTO D
        LOADI  B, 0                  ; J = 0;
        CMP    A, D                  ; I < LAST
        BRGE   END                   ; IF I >= LAST BREAK OUT OF THE OUTER LOOP

LOOP:	LOADI  D, LAST               ; RE-LOAD LAST INTO D (THIS REGISTER IS SHARED)
        SUB    D, A                  ; D = D - A  (I.E., D = LAST - I)
        CMP    B, D                  ; J < LAST - I
        BRGE   IINC                  ; IF J >= LAST-I  BRANCH TO IINC
	LOADF  C, [B+ARRAY]          ; C = ARRAY[J]
        LOADF  D, [B+ARRAY+1]        ; D = ARRAY[J+1] (COMPILER ADDS 1 TO ADDR. OF ARRAY)
        CMP    D, C                  ; IF ARRAY[J+1] < ARRAY[J]  (SWITCHED DIRECTION)
        BRGE   JINC
SWAP:   STOREF [B+ARRAY], D
        STOREF [B+ARRAY+1], C
JINC:   ADDI   B, 1                  ; J++
        JUMP   LOOP		     ; JUMP BACK TO LINE 14
IINC:   ADDI   A, 1                  ; I++
        JUMP   OUTER
END:    JUMP   END                   ; DO NOTHING

.DATA

.DEFL BYTE ARRAY	8, 7, 6, 5, 4, 3, 2, 1
.DEFL BYTE TEMP		0
