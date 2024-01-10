/*
 * io.js
 *
 * assorted input / output routines
 */
 
// SAV upload element 
const dump_isr = document.getElementById("button-dump-isr");
const dump_data = document.getElementById("button-dump-data");
const upload_sav = document.getElementById("upload-sav");
const terminal = document.getElementById("terminal");
const readout = document.getElementById("readout");

// Instruction dump function
dump_isr.onclick = function() {
	let content = "";
	
	for (let i = 0x80; i < 0x100; i++) {
		content += "0x" + (i).toString(16).padStart(2, '0').toUpperCase() + " : ";
		
		let isr = cpu_state.imem[128 * cpu_state.isr_bank + (i & 0x7F)];
		content += (isr).toString(16).padStart(4, '0').toUpperCase() + " "
		content += decode([], isr, [0, 0, 0, 0]);
		content += "\n"
	}
	
	
	readout.value = content;
}

// Data dump function
dump_data.onclick = function() {
	let content = "";
	
	for (let i = 0; i < 0x80; i += 8) {
		content += "0x" + (i).toString(16).padStart(2, '0').toUpperCase() + " : ";
		
		for (let o = 0; o < 8; o++) {
			content += (cpu_state.dmem[cpu_state.data_bank * 128 + i + o]).toString(16).padStart(2, '0').toUpperCase() + " ";
		}
		
		content += "\n"
	}
	
	
	readout.value = content;
}

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
        const fileContent = new Uint8Array(await savFile.arrayBuffer());

        let block = 0;
		let bank = 0;
		while (block + 512 <= fileContent.length) {
			if (fileContent[block] != 0x02 || fileContent[block + 1] != 0x81) {
				console.log(fileContent);
				alert("Malformed .SAV File!");
				break;
			}
			
			cpu_state.isr_bank = bank;
			cpu_state.data_bank = bank;
			
			for (let o = 0; o < 128; o++) {
				dataStore(cpu_state, o, fileContent[block + o + 128]);
				isrStore(cpu_state, o + 128, (fileContent[block + (o*2) + 256] << 8) + fileContent[block + (o*2) + 257]);
			}
			
			bank++;
			block += 512;
		}
		
		cpu_state.isr_bank = 0;
		cpu_state.data_bank = 0;
		cpu_state.pc = 0x80;
		
		// Make sure the visual display is updated 
		propagate(cpu_state, isrFetch(cpu_state, cpu_state.pc));
		updateFlow(false);
		upload_sav.value = null;
	})();
});