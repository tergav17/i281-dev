I281_ASM = "../../i281as"

all: binary/hello.sv binary/dir.sv binary/cat.sv binary/cd.sv binary/echo.sv binary/stat.sv binary/ed.sv binary/rm.sv binary/xmodem.sv binary/cp.sv binary/hdump.sv

binary/ed.sv: dosdef.s source/ed0.s source/ed1.s source/ed2.s source/ed3.s
	$(I281_ASM) -o ed dosdef.s source/ed0.s source/ed1.s source/ed2.s source/ed3.s
	mv ed.sav binary/ed.sv
	mv ed.lst listing

binary/%.sv: dosdef.s source/%.s
	$(I281_ASM) -o $* dosdef.s source/$*.s
	mv $*.sav binary/$*.sv
	mv $*.lst listing
	
clean:
	rm listing/*
	rm binary/*