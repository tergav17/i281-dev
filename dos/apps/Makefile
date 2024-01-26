I281_ASM = "../../i281as"

all: binary/hello.sv binary/dir.sv binary/type.sv binary/cd.sv binary/echo.sv binary/stat.sv

binary/%.sv: dosdef.s source/%.s
	$(I281_ASM) -o $* dosdef.s source/$*.s
	mv $*.sav binary/$*.sv
	mv $*.lst listing
	
clean:
	rm listing/*
	rm binary/*