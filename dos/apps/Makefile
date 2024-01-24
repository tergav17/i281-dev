I281_ASM = "../../i281as"

all: binary/hello.sv binary/dir.sv

binary/%.sv: dosdefs.s source/%.s
	$(I281_ASM) -o $* dosdefs.s source/$*.s
	mv $*.sav binary/$*.sv
	mv $*.lst listing
	
clean:
	rm listing/*
	rm binary/*