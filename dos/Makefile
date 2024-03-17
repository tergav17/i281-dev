I281_ASM = "../i281as"

all: dos281.img

dos281.img: binary/mbr.sav binary/kernel.sav apps/binary/* other/*
	python3 GenerateImage.py binary/mbr.sav 62464 8
	cp splash_base.txt other/splash.txt
	date +"%d/%m/%y, %T" >> other/splash.txt
	python3 AddFile.py dos281.img 0 apps/binary/*
	python3 AddFile.py dos281.img 1 other/*
	python3 AddFile.py dos281.img 2 apps/source/* apps/dosdef.s
	python3 AddFile.py dos281.img 3 source/*
	python3 AddFile.py dos281.img 4 ../programs/examples/binary/*

binary/%.sav: source/*.s
	cd source; ../$(I281_ASM) -o ../mbr common.s mbr.s
	cd source; ../$(I281_ASM) -o ../kernel common.s low.s core.s tty.s blk.s fs.s sys.s alloc.s end.s
	cp kernel.sav apps/binary/kernel.sy
	mv *.sav binary
	mv *.lst listing

clean:
	rm listing/*
	rm binary/*