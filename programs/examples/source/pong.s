.DATA
.DEFL BYTE EMPTY	0 ,   0 ,  0 ,  0    
.DEFL BYTE DISPLAY	64 ,  0 ,  0 ,  4    

.DEFL BYTE SHAPE	64 ,  8 ,  64 ,  1    

.DEFL BYTE INCDEC	1               
.DEFL BYTE SWITCH	0 ,  0 ,  3         

.TEXT
	NOOP
	NOOP
	LOADI  A ,  0                    
	LOADI  B ,  0                    
	LOADI  D ,  4                    
	STORE   [ SWITCH + 1 ]  ,  D
LOOP:   LOAD   C ,   [ DISPLAY + 3 ]  
	LOAD   D ,   [ SWITCH + 1 ] 
ERASEP: SUB    C ,  D
	STORE   [ DISPLAY + 3 ]  ,  C
READ:   INPUTD  [ SWITCH + 1 ]               
	LOAD   D ,   [ SWITCH + 1 ] 
	SUBI   D ,  64                   
	BRE    UP
DOWN:   LOADI  D ,  4                    
	JUMP   DRAWP
UP:     LOADI  D ,  2                                
DRAWP:  STORE   [ SWITCH + 1 ]  ,  D
	ADD    C ,  D                    
	STORE   [ DISPLAY + 3 ]  ,  C          
ERASEB: LOADF  C ,   [A+DISPLAY]           
	LOADF  D ,   [B+SHAPE]             
	SUB    C ,  D
	STOREF  [A+DISPLAY]  ,  C          
VPOS:   ADDI   B ,  1                    
	LOADI  D ,  4
	CMP    B ,  D
	BRNE   HPOS
	LOADI  B ,  0                    
HPOS:   LOAD   D ,   [ INCDEC ]              
	ADD    A ,  D
	LOADF  D ,   [D+SWITCH+1]          
	CMP    A ,  D
	BRNE   DRAWB
REVDIR: LOADI  D ,  0                    
	LOAD   C ,   [ INCDEC ] 
	SUB    D ,  C
	STORE   [ INCDEC ]  ,  D             
DRAWB:  LOADF  C ,   [A+DISPLAY]           
	LOADF  D ,   [B+SHAPE]             
	ADD    C ,  D                                
	STOREF  [A+DISPLAY]  ,  C          
CHECK:  LOADI  D ,  5                    
	LOAD   C ,   [ DISPLAY + 3 ] 
	CMP    C ,  D
	BRE    PRINT
	SHIFTL D                       
	CMP    C ,  D
	BRE    PRINT                   
	LOADI  D ,  256  
	LOADI	C,10
DELAY:  SUBI   D ,  1
	BRNE   DELAY
	SUBI	C,1
	BRNE	DELAY
	JUMP   LOOP
PRINT:  LOADI  C ,  121                  
	STORE   [ DISPLAY + 0 ]  ,  C
	LOADI  C ,  84                   
	STORE   [ DISPLAY + 1 ]  ,  C
	LOADI  C ,  94                   
	STORE   [ DISPLAY + 2 ]  ,  C
EXIT:   JUMP   EXIT
