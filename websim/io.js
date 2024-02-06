/*
 * io.js
 *
 * assorted input / output routines
 */
 
// I/O elements 
const dump_isr = document.getElementById("button-dump-isr");
const dump_data = document.getElementById("button-dump-data");
const upload_sav = document.getElementById("upload-sav");
const upload_img = document.getElementById("upload-img");
const terminal = document.getElementById("terminal");
const readout = document.getElementById("readout");
const dump_bank = document.getElementById("text-dump-bank");


/*
 * Writes a byte to I/O space
 */
function ioWrite(addr, val) {
	let register = addr & 0x0F;
	let device = addr & 0x70;
	
	switch (device) {
		
		// Set the data banking address
		case 0x00:
			cpu_state.data_bank = val;
			return;
			
		// Write to the UART
		case 0x10:
			uartWrite(register, val);
			return;
			
		// Write to CF card #1
		case 0x20:
			cfWrite(cf_state, register, val);
			return;
			
		default:
			return;
	}
}

/*
 * Reads a byte from I/O space
 */
function ioRead(addr) {
	let register = addr & 0x0F;
	let device = addr & 0x70;
	
	switch (device) {
		
		// Read from the UART
		case 0x10:
			return uartRead(register);
			
		// Read from CF card #1
		case 0x20:
			return cfRead(cf_state, register);
		
		default:
			return 0xFF;
	}
}

/* --- CF CARD STUFF --- */

cf_state = {
	
	// Data
	data: new Uint8Array(512 * 256 * 256), // 32MB array, boo hoo!
	
	// Buffer Information
	buffer: [], // Current operation buffer
	rdwri: 0,	// Reading or writing
	left: 0, 	// Bytes left
	last: 0,	// Last data byte read
	
	// Timing information
	lastAccessMs: 0,	// Milliseconds since last access
	
	// Registers
	error: 0,		// Error Register
	features: 0,	// Features Register
	count: 0,		// Sector Count Register
	lba0: 0,		// LBA 0 Register
	lba1: 0,		// LBA 1 Register
	lba2: 0,		// LBA 2 Register
	lba3: 0,		// LBA 3 Register
};

/*
 * Execute a CF command
 */
function cfCommand(cf, val) {
	// Reset the error
	error = 0x00;
	
	// Make sure that another command hasn't happened too soon
	if (cf.lastAccessMs + 1 >= Date.now())
		return;
	
	// Do command
	switch (val) {
		case 0x20:
			// Read
			cf.left = cf.count * 512;
			cf.buffer = [];
			cf.rdwri = 0;
			
			let pointer = (cf.lba0 << 9) + (cf.lba1 << 17);
			console.log("Read starting at: " + pointer + " (Block " + (pointer / 512) + ")");
			for (let i = 0; i < cf.left; i++) {
				cf.buffer.push(cf.data[pointer]);
				
				pointer = (pointer + 1) & 0x1FFFFFF;
			}
			break;
			
			
		case 0x30:
			// Write
			cf.left = cf.count * 512;
			cf.buffer = [];
			cf.rdwri = 1;
			break;
			
		default:
			break;
	}
	
	// Set time of last access
	cf.lastAccessMs = Date.now();
}

/*
 * Write a byte to a CF card
 */
function cfWrite(cf, register, val) {
	switch (register & 0x7) {
		
		case 0x0:
			// Data Write
			if (cf.left > 0 && cf.rdwri == 1) {
				// Place byte into buffer
				buffer.push(val)
				
				// Decrement the number of bytes to write
				cf.left--;
				
				// Do we write the buffer out?
				if (cf.left == 0) {
					let pointer = (cf.lba0 << 9) + (cf.lba1 << 17);
					for (let i = 0; i < cf.buffer.length; i++) {
						cf.data[pointer] = buffer[i];
						pointer = (pointer + 1) & 0x1FFFFFF;
					}
				}
			}
			
			break;
			
		case 0x1:
			// Feature Register
			cf.features = val;
			break;
			
		case 0x2:
			// Sector Count Register
			cf.count = val;
			break;
			
		case 0x3:
			// LBA 0 Register
			cf.lba0 = val;
			break;
			
		case 0x4:
			// LBA 1 Register
			cf.lba1 = val;
			break;
			
		case 0x5:
			// LBA 2 Register
			cf.lba2 = val;
			break;
			
		case 0x6:
			// LBA 3 Register
			cf.lba3 = val;
			break;
		
		case 0x7:
			// Command Register
			cfCommand(cf, val);
			break; 
		
		
		default:
			break;
	}
}

/*
 * Read a byte from a CF card
 */
function cfRead(cf, register) {
	switch (register & 0x7) {
		
		case 0x0:
			// Data Read
			if (cf.left > 0 && cf.rdwri == 0) {
				cf.left--;
				cf.last = cf.buffer.shift();
			}
			
			// console.log("Reading value: " + cf.last);
			
			// Just return the last byte read
			return cf.last;

			
		case 0x1:
			// Error Register
			return cf.error;
			
		case 0x2:
			// Sector Count Register
			return cf.count;
			
		case 0x3:
			// LBA 0 Register
			return cf.lba0;
			
		case 0x4:
			// LBA 1 Register
			return cf.lba1;
			
		case 0x5:
			// LBA 2 Register
			return cf.lba2;
			
		case 0x6:
			// LBA 3 Register
			return cf.lba3;
		
		case 0x7:
			// Status Register
			if (cf.lastAccessMs + 1 >= Date.now()) {
				// Not ready
				return 0b10000000;
			} else {
				// Ready
				return 0b01000000;
			}
			
		default:
			return 0xFF;
	}
}

/* --- TERMINAL STUFF --- */

/*
 * Write a byte to the UART
 */
function uartWrite(register, val) {
	switch (register & 0x7) {
		case 0x00:
			// Transmit Holding Register
			uartOutput(val);
			break;
		
		case 0x7:
			// Scratchpad Register
			uartScratchpad = val;
			break;
		
		default:
			break;
	}
}


/*
 * Reads a byte from the UART
 */
function uartRead(register) {
	switch (register & 0x7) {
		case 0x0:
			// Receive Holding Register
			uartHasCharacter = false;
			return uartChar & 0xFF;
			
		case 0x5:
			// Line Status Register
			return 0x20 + (uartHasCharacter ? 1 : 0);
			
		case 0x7:
			// Scratchpad Register
			return uartScratchpad;
		
		default:
			return 0xFF;
	}
}

/*
 * Inputs a value into the UART
 */
uartHasCharacter = false;
uartChar = 0;
uartScratchpad = 0; 
function uartInput(ch) {
	uartHasCharacter = true;
	uartChar = ch;
}

/*
 * Ouputs a value to the UART
 */
function uartOutput(ch) {
	
	switch (ch) {
		case 0x08:
			// Backspace
			terminal.value = terminal.value.substring(0, terminal.value.length-1);
			break;
			
		case 0x09:
			// Tab
			terminal.value += "\t";
			break;
			
		case 0x0A:
			// Line Feed
			terminal.value += "\n";
			terminal.scrollTop = terminal.scrollHeight;
			break;
			
		case 0x0D:
			// Carriage Return
			/*
			let str = terminal.value;
			
			// Janky, but kinda emulates the function of carriage return;
			while (str.length > 0 && str.substr(-1) != '\n')
				str = str.substring(0, str.length - 1);
			terminal.value = str;
			*/
			break;
			
		default: // Normal characters
			if (ch > 31 && ch < 127)
				terminal.value += String.fromCharCode(ch);
			break;
	}
}

// On key down event handler
// only really does special keys
terminal.onkeydown = function(e) {
	let ch = (e.keyCode || e.charCode);
	
	switch (ch) {
		case 8:
			uartInput(8);
			return false;
		
		case 46:
			uartInput(127);
			return false;
			
		default:
			break;
	}
}

// On key press event handler
terminal.onkeypress = function(e) {
	let ch = (e.keyCode || e.charCode);
	
	uartInput(ch);
	
	return false;
}

/* --- DEBUGGING STUFF --- */

// Instruction dump function
dump_isr.onclick = function() {
	// Grab the bank
	let bank = cpu_state.isr_bank;
	let manual = getManualBank();
	if (manual >= 0 && manual <= 255) {
		bank = manual;
	}
	
	// Dump header
	let content = "BANK : 0x" + (bank).toString(16).padStart(2, '0').toUpperCase() + "\n";
	
	// Dump contents
	for (let i = 0x80; i < 0x100; i++) {
		content += "0x" + (i).toString(16).padStart(2, '0').toUpperCase() + " : ";
		
		let isr = cpu_state.imem[128 * bank + (i & 0x7F)];
		content += (isr).toString(16).padStart(4, '0').toUpperCase() + " "
		content += decode([], isr, [0, 0, 0, 0]);
		content += "\n"
	}
	
	
	readout.value = content;
}

// Data dump function
dump_data.onclick = function() {
	// Grab the bank
	let bank = cpu_state.data_bank;
	let manual = getManualBank();
	if (manual >= 0 && manual <= 255) {
		bank = manual;
	}
	
	// Dump header
	let content = "BANK : 0x" + (bank).toString(16).padStart(2, '0').toUpperCase() + "\n";
	
	// Dump contents
	for (let i = 0; i < 0x80; i += 8) {
		content += "0x" + (i).toString(16).padStart(2, '0').toUpperCase() + " : ";
		
		for (let o = 0; o < 8; o++) {
			content += (cpu_state.dmem[bank * 128 + i + o]).toString(16).padStart(2, '0').toUpperCase() + " ";
		}
		
		content += " \"";
		for (let o = 0; o < 8; o++) {
			let b = cpu_state.dmem[bank * 128 + i + o];
			if (b >= 0x20 && b <= 0x7E) {
				content += String.fromCharCode(b);
			} else {
				content += ".";
			}
		}
		
		content += "\"\n"
	}
	
	
	readout.value = content;
}

function getManualBank() {
	let str = dump_bank.value.toLowerCase();
	
	if (str.startsWith("0x")) {
		return parseInt(str, 16);
	} else {
		return parseInt(str, 10);
	}
}

/* --- FILE LOADING STUFF --- */

// Link "LOAD .SAV" button to file input
document.getElementById("button-load-sav").onclick = function() {
	if (runClock) {
		alert("Halt processor before loading .SAV");
	} else {
		upload_sav.click();
	}
}

// Shove the .SAV into memory when uploaded
upload_sav.addEventListener('change', function(e) {
	let savFile = upload_sav.files[0];
	

	(async () => {
        let fileContent = new Uint8Array(await savFile.arrayBuffer());

        let block = 0;
		while (block + 512 <= fileContent.length) {
			if (fileContent[block] != 0x02 || fileContent[block + 1] != 0x81) {
				alert("Malformed .SAV File!");
				break;
			}
			
			// Get bank to load into
			bank = fileContent[block + 2];
			
			cpu_state.isr_bank = bank;
			cpu_state.data_bank = bank;
			
			for (let o = 0; o < 128; o++) {
				dataStore(cpu_state, o, fileContent[block + o + 128]);
				isrStore(cpu_state, o + 128, (fileContent[block + (o*2) + 256] << 8) + fileContent[block + (o*2) + 257]);
			}
			
			block += 512;
		}
		
		cpu_state.isr_bank = 1;
		cpu_state.data_bank = 1;
		cpu_state.pc = 0x80;
		
		// Make sure the visual display is updated 
		propagate(cpu_state, isrFetch(cpu_state, cpu_state.pc));
		updateFlow(false);
		upload_sav.value = null;
	})();
});

// Link "MOUNT .IMG" button to file input
document.getElementById("button-mount-img").onclick = function() {
	upload_img.click();
}

// Shove the .IMG into an emulated CF card
upload_img.addEventListener('change', function(e) {
	let imgFile = upload_img.files[0];
	

	(async () => {
        let fileContent = new Uint8Array(await imgFile.arrayBuffer());

		// Load into compact flash image
        let i = 0;
		while (i < fileContent.length && i < (512 * 256 * 256)) {
			cf_state.data[i] = fileContent[i];
			i++;
		}
		
	})();
});