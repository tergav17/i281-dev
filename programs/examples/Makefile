I281_ASM = "../../i281as"

all: binary/bounc2.sav binary/bubble.sav binary/merge.sav binary/echo.sav binary/hello.sav binary/bounce.sav binary/banner.sav binary/pong.sav binary/printa.sav

binary/%.sav: source/%.s
	$(I281_ASM) -o $* source/$*.s
	mv $*.sav binary
	mv $*.lst listing
	
clean:
	rm listing/*
	rm binary/*