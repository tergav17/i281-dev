all:
	make -C as
	make -C programs
	make -C dos
	
clean:
	make -C as clean
	make -C programs clean
	make -C dos clean