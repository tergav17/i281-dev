/*
 * simulator.js
 *
 * Handles the user-facing functions of the simulator
 */

// Lookup table to draw 7-segment display numbers
const bin_to_hex = [
	0b00111111,	// 0
	0b00000110,	// 1
	0b01011011,	// 2
	0b01001111,	// 3
	0b01100110,	// 4
	0b01101101,	// 5
	0b01111101,	// 6
	0b00000111,	// 7
	0b01111111,	// 8
	0b01101111,	// 9
	0b01110111,	// A
	0b01111100,	// b
	0b00111001,	// C
	0b01011110,	// d
	0b01111001,	// E
	0b01110001	// F
];

const diag_flow = document.getElementById("diagflow");

// Attempt to get the context for the diag flow
if (diag_flow.getContext) {
	var flow_ctx = diag_flow.getContext("2d");
} else {
	alert("Canvas not supported!");
}

// Add listeners for events
window.addEventListener('keyup',keyUpListener,false);
window.addEventListener('keydown',keyDownListener,false); 
window.addEventListener('resize', resizeCanvas, false);
diag_flow.addEventListener('mousedown', mouseDown);

// Keep track of scaling for mouse events
var scaleX = 1.0;
var scaleY = 1.0;

// Do initial drawing of canvas
updateFlow(true);

// event farm!!!! :)

function mouseDown(e) {
	canvasRect = diag_flow.getBoundingClientRect()
	let mx = (e.clientX - canvasRect.left) / scaleX;
	let my = (e.clientY - canvasRect.top) / scaleY;
	
	// I really should have some proper button handling code
	// but I don't wanna so we are going to hardcode one instead
	//
	// cry about it
	x = 385; y = 390; // Switch block position
	for (let i = 0; i < 16; i++) {
		bx = x + 5 + (22 * i) + (i >= 8 ? 10 : 0)
		by = y + 5
		
		if (mx >= bx && mx < bx + 15 && my >= by && my < by + 30) {
			cpu_state.switches ^= 0x8000>>i;
		}
	}
	
	propagate(cpu_state, cpu_state.switches);
	updateFlow(false);
	
}

function keyUpListener(e) {
	let k = e.key.toLowerCase();
	
	if (k == "a") {
		// Do something
	}
}

function keyDownListener(e) {
	let k = e.key.toLowerCase();
	
	if (k == "a") {
		// Do something
	}
}

function resizeCanvas() {
	updateFlow(true);
}

/*
 * Redraws the CPU flow chart to the current state
 */
function drawFlow(cpu) {
	
	// Clear
	flow_ctx.reset();
	flow_ctx.setTransform(1, 0, 0, 1, 0, 0);
	flow_ctx.scale(scaleX, scaleY);
	flow_ctx.clearRect(0, 0, diag_flow.width, diag_flow.height);
	
	
	// Set up style commons
	flow_ctx.font = "10px courier";
	flow_ctx.lineCap = "round";
	flow_ctx.lineWidth = 1;
	let x, y;
	
	// Draw Code Memory Section
	x = 30; y = 30;
	flow_ctx.strokeStyle = "black";
	flow_ctx.roundRect(x, y, 100, 150, 5);
	flow_ctx.stroke();
	flow_ctx.fillText("Code Memory", x + 17, y + 10);
	flow_ctx.fillText("ISR: 0x" + (cpu.isr).toString(16).padStart(4, '0').toUpperCase(), x + 5, y + 30);
	flow_ctx.fillText("SELECT: 0x" + (cpu.select).toString(16).padStart(2, '0').toUpperCase(), x + 5, y + 45);
	flow_ctx.fillText("BANK: 0x" + (cpu.isr_bank).toString(16).padStart(2, '0').toUpperCase(), x + 5, y + 60);
	flow_ctx.fillText("BANK: " + cpu.ctrl[0] + " [C0]", x + 5, y + 125);
	flow_ctx.fillText("WRITE: " + cpu.ctrl[1] + " [C1]", x + 5, y + 140);
	
	// Draw Code Writeback Section
	x = 30; y = 200;
	flow_ctx.strokeStyle = "black";
	flow_ctx.roundRect(x, y, 100, 75, 5);
	flow_ctx.stroke();
	flow_ctx.fillText("Code Writeback", x + 6, y + 10);
	flow_ctx.fillText("OUT: 0x" + (cpu.write_out).toString(16).padStart(4, '0').toUpperCase(), x + 5, y + 30);
	flow_ctx.fillText("CACHE: 0x" + (cpu.write_cache).toString(16).padStart(2, '0').toUpperCase(), x + 5, y + 45);
	flow_ctx.fillText("PRGM: " + cpu.ctrl[3] + " [C3]", x + 5, y + 65);
	
	
	// Draw Instruction Decoder
	x = 180; y = 30;
	flow_ctx.strokeStyle = "black";
	flow_ctx.roundRect(x, y, 460, 50, 5);
	flow_ctx.stroke();
	flow_ctx.fillText("Instruction Decoder - " + cpu.isr_mnem, x + 130, y + 10);
	flow_ctx.fillText("C0  C1  C2  C3  C4  C5  C6  C7  C8  C9  C10 C11 C12 C13 C14 C15 C16 C17 C18", x + 5, y + 30);
	let ctrl_bits = "";
	for (let i = 0; i <= 18; i++) {
		ctrl_bits += " " + cpu.ctrl[i] + "  ";
	}
	flow_ctx.fillText(ctrl_bits, x + 5, y + 40);
	
	// Draw Register File Section
	x = 180; y = 120;
	flow_ctx.strokeStyle = "black";
	flow_ctx.roundRect(x, y, 120, 150, 5);
	flow_ctx.stroke();
	flow_ctx.fillText("Register File", x + 20, y + 10);
	flow_ctx.fillText("A: 0x" + (cpu.regs[0]).toString(16).padStart(2, '0').toUpperCase(), x + 5, y + 30);
	flow_ctx.fillText("B: 0x" + (cpu.regs[1]).toString(16).padStart(2, '0').toUpperCase(), x + 5, y + 45);
	flow_ctx.fillText("C: 0x" + (cpu.regs[2]).toString(16).padStart(2, '0').toUpperCase(), x + 5, y + 60);
	flow_ctx.fillText("D: 0x" + (cpu.regs[3]).toString(16).padStart(2, '0').toUpperCase(), x + 5, y + 75);
	flow_ctx.fillText("Port 0:", x + 65, y + 35);
	flow_ctx.fillText("0x" + (cpu.port0).toString(16).padStart(2, '0').toUpperCase(), x + 72, y + 45);
	flow_ctx.fillText("Port 1:", x + 65, y + 65);
	flow_ctx.fillText("0x" + (cpu.port1).toString(16).padStart(2, '0').toUpperCase(), x + 72, y + 75);	
	flow_ctx.fillText("RP0: " + cpu.ctrl[4] + "" + cpu.ctrl[5] + " [C4, C5]", x + 5, y + 95);
	flow_ctx.fillText("RP1: " + cpu.ctrl[6] + "" + cpu.ctrl[7] + " [C6, C7]", x + 5, y + 110);
	flow_ctx.fillText("WP: " + cpu.ctrl[8] + "" + cpu.ctrl[9] + " [C8, C9]", x + 5, y + 125);
	flow_ctx.fillText("WRITE: " + cpu.ctrl[10] + " [C10]", x + 5, y + 140);
	
	// Draw ALU Section
	x = 400; y = 120;
	flow_ctx.strokeStyle = "black";
	flow_ctx.roundRect(x, y, 120, 100, 5);
	flow_ctx.stroke();
	flow_ctx.fillText("ALU", x + 50, y + 10);
	flow_ctx.fillText("RESULT: 0x" + (cpu.alu_result).toString(16).padStart(2, '0').toUpperCase(), x + 5, y + 30);
	flow_ctx.fillText("FLAGS: " + cpu.flags[3] + "" + cpu.flags[2] + "" + cpu.flags[1] + "" + cpu.flags[0], x + 5, y + 45);
	flow_ctx.fillText("      (CONZ)", x + 5, y + 55);
	flow_ctx.fillText("OPR: " + cpu.ctrl[12] + "" + cpu.ctrl[13] + " [C12, C13]", x + 5, y + 75);
	flow_ctx.fillText("WFLAGS: " + cpu.ctrl[14] + " [C14]", x + 5, y + 90);

	// Draw Program Counter Section
	x = 180; y = 320;
	flow_ctx.strokeStyle = "black";
	flow_ctx.roundRect(x, y, 100, 75, 5);
	flow_ctx.stroke();
	flow_ctx.fillText("Program Counter", x + 5, y + 10);
	flow_ctx.fillText("PC: 0x" + (cpu.pc).toString(16).padStart(2, '0').toUpperCase(), x + 5, y + 30);
	flow_ctx.fillText("NEXT: 0x" + (cpu.pc_next).toString(16).padStart(2, '0').toUpperCase(), x + 5, y + 45);
	flow_ctx.fillText("BRANCH: " + cpu.ctrl[2] + " [C2]", x + 5, y + 65);
	
	// Draw Data Memory Section
	x = 590; y = 200;
	flow_ctx.strokeStyle = "black";
	flow_ctx.roundRect(x, y, 100, 120, 5);
	flow_ctx.stroke();
	flow_ctx.fillText("Data Memory", x + 20, y + 10);
	let a, b, c, d;
	a = b = c = d = "";
	for (let i = 0; i < 4; i++) {
		a += (dataFetch(cpu, i)).toString(16).padStart(2, '0').toUpperCase();
		b += (dataFetch(cpu, i+4)).toString(16).padStart(2, '0').toUpperCase();
		c += (dataFetch(cpu, i+8)).toString(16).padStart(2, '0').toUpperCase();
		d += (dataFetch(cpu, i+12)).toString(16).padStart(2, '0').toUpperCase();
	} 
	flow_ctx.fillText("0x00: " + a, x + 5, y + 30);
	flow_ctx.fillText("0x04: " + b, x + 5, y + 45);
	flow_ctx.fillText("0x08: " + c, x + 5, y + 60);
	flow_ctx.fillText("0x0C: " + d, x + 5, y + 75);
	flow_ctx.fillText("WRITE: " + cpu.ctrl[17] + " [C17]", x + 5, y + 95);
	flow_ctx.fillText("READ: " + cpu.ctrl[18] + " [C18]", x + 5, y + 110);
	
	// Draw C11 Multiplexer
	drawMux(cpu, 350, 170, 11);
	
	// Draw C15 Multiplexer
	drawMux(cpu, 550, 150, 15);
	
	// Draw C16 Multiplexer
	drawMux(cpu, 500, 300, 16);
	
	// Draw C18 Multiplexer
	drawMux(cpu, 720, 165, 18);
	
	// Line Time!
	flow_ctx.beginPath();
	
	// Draw Conencting Lines
	// Code Writeback -> Code Memory
	flow_ctx.moveTo(80, 200);
	flow_ctx.lineTo(80, 180);
	
	// Program Counter -> Code Memory
	flow_ctx.moveTo(280, 357);
	flow_ctx.lineTo(300, 357);
	flow_ctx.lineTo(300, 425);
	flow_ctx.lineTo(15, 425);
	flow_ctx.lineTo(15, 130);
	flow_ctx.lineTo(30, 130);
	
	// Code Memory -> Instruction Decoder
	flow_ctx.moveTo(130, 55);
	flow_ctx.lineTo(180, 55);
	
	// Code Memory -> Mux C11 -> Mux C15
	flow_ctx.moveTo(145, 55);
	flow_ctx.lineTo(145, 285);
	flow_ctx.lineTo(335, 285);
	flow_ctx.lineTo(335, 215);
	flow_ctx.lineTo(350, 215);
	flow_ctx.moveTo(335, 285);
	flow_ctx.lineTo(535, 285);
	flow_ctx.lineTo(535, 195);
	flow_ctx.lineTo(550, 195);
	
	// Port 0 -> ALU
	flow_ctx.moveTo(300, 155);
	flow_ctx.lineTo(400, 155);
	
	// Port 1 -> Mux C11
	flow_ctx.moveTo(300, 185);
	flow_ctx.lineTo(350, 185);
	
	// Port 1 -> Code Writeback
	flow_ctx.moveTo(315, 185);
	flow_ctx.lineTo(315, 300);
	flow_ctx.lineTo(95, 300);
	flow_ctx.lineTo(95, 275);
	
	// Port 1 -> C16 Mux
	flow_ctx.moveTo(315, 300);
	flow_ctx.lineTo(315, 315);
	flow_ctx.lineTo(500, 315);
	
	// Mux C11 -> ALU
	flow_ctx.moveTo(370, 200);
	flow_ctx.lineTo(400, 200);
	
	// ALU -> Mux C15
	flow_ctx.moveTo(520, 165);
	flow_ctx.lineTo(550, 165);
	
	// Mux C15 -> Mux C18
	flow_ctx.moveTo(570, 180);
	flow_ctx.lineTo(720, 180);
	
	// Mux C15 -> Code Memory
	flow_ctx.moveTo(655, 180);
	flow_ctx.lineTo(655, 15);
	flow_ctx.lineTo(15, 15);
	flow_ctx.lineTo(15, 80);
	flow_ctx.lineTo(30, 80);
	
	// Mux C15 -> Data Memory
	flow_ctx.moveTo(580, 180);
	flow_ctx.lineTo(580, 235);
	flow_ctx.lineTo(590, 235);
	
	// Mux C16 -> Data memory
	flow_ctx.moveTo(520, 330);
	flow_ctx.lineTo(535, 330);
	flow_ctx.lineTo(535, 300);
	flow_ctx.lineTo(590, 300);
	
	// Data Memory -> Mux C18
	flow_ctx.moveTo(690, 235);
	flow_ctx.lineTo(702, 235);
	flow_ctx.lineTo(702, 210);
	flow_ctx.lineTo(720, 210);
	
	// Mux C18 -> Register File
	flow_ctx.moveTo(740, 195);
	flow_ctx.lineTo(755, 195);
	flow_ctx.lineTo(755, 105);
	flow_ctx.lineTo(165, 105);
	flow_ctx.lineTo(165, 155);
	flow_ctx.lineTo(180, 155);
	
	// Mux C18 -> Program Counter
	flow_ctx.moveTo(165, 155);
	flow_ctx.lineTo(165, 357);
	flow_ctx.lineTo(180, 357);
	
	// Data Memory -> 7-Segment Displays
	flow_ctx.moveTo(640, 320);
	flow_ctx.lineTo(640, 345);
	
	// Switches -> Code Writeback
	flow_ctx.moveTo(385, 410);
	flow_ctx.lineTo(65, 410)
	flow_ctx.lineTo(65, 275);
	
	// Switches -> Mux C16
	flow_ctx.moveTo(340, 410);
	flow_ctx.lineTo(340, 345)
	flow_ctx.lineTo(500, 345);
	
	// Draw all of the lines
	flow_ctx.stroke();
	
	// Draw circles
	flow_ctx.beginPath();
	flow_ctx.arc(335, 285, 3, 0, 2 * Math.PI);
	flow_ctx.fill();
	flow_ctx.beginPath();
	flow_ctx.arc(580, 180, 3, 0, 2 * Math.PI);
	flow_ctx.fill();
	flow_ctx.beginPath();
	flow_ctx.arc(315, 300, 3, 0, 2 * Math.PI);
	flow_ctx.fill();
	flow_ctx.beginPath();
	flow_ctx.arc(315, 185, 3, 0, 2 * Math.PI);
	flow_ctx.fill();
	flow_ctx.beginPath();
	flow_ctx.arc(655, 180, 3, 0, 2 * Math.PI);
	flow_ctx.fill();
	flow_ctx.beginPath();
	flow_ctx.arc(165, 155, 3, 0, 2 * Math.PI);
	flow_ctx.fill();
	flow_ctx.beginPath();
	flow_ctx.arc(340, 410, 3, 0, 2 * Math.PI);
	flow_ctx.fill();
	
	// Draw Switches
	x = 385; y = 390;
	flow_ctx.beginPath();
	flow_ctx.strokeStyle = "black";
	flow_ctx.roundRect(x, y, 365, 40, 5);
	flow_ctx.stroke();
	for (let i = 0; i < 16; i++) {
		drawSwitch(x + 5 + (22 * i) + (i >= 8 ? 10 : 0), y + 5, cpu.switches & (0x8000>>i));
	}
	
	// Draw 7-segment display
	x = 550; y = 345;
	flow_ctx.beginPath();
	flow_ctx.strokeStyle = "black";
	flow_ctx.roundRect(x, y, 200, 40, 5);
	flow_ctx.stroke();
	for (let i = 0; i < 8; i++) {
		drawDisplay(x + 5 + (25 * i), y + 5, cpu.segments[i], cpu.game);
	}
}

function drawSwitch(x, y, position) {
	flow_ctx.beginPath();
	flow_ctx.strokeStyle = "grey";
	flow_ctx.fillStyle = "grey";
	flow_ctx.rect(x, y, 15, 30);
	flow_ctx.fill();
	
	flow_ctx.beginPath();
	flow_ctx.strokeStyle = "white";
	flow_ctx.fillStyle = "white";
	flow_ctx.rect(x + 2, y + 2 + (position == 0 ? 15 : 0), 11, 11);
	flow_ctx.fill();
}

/*
 * Helper function to draw 7-segment displays
 */
function drawDisplay(x, y, contents, game) {
	flow_ctx.beginPath();
	flow_ctx.strokeStyle = "red"
	flow_ctx.lineWidth = 2.5;
	
	// Convert content if in game mode
	if (!game) {
		contents = bin_to_hex[contents & 0x0F];
	}
	
	// Top Mid
	if (contents & 0x01) {
		flow_ctx.moveTo(x + 3, y);
		flow_ctx.lineTo(x + 12, y);
	}
	
	// Top Left
	if (contents & 0x20) {
		flow_ctx.moveTo(x, y + 3);
		flow_ctx.lineTo(x, y + 12);
	}
	
	// Top Right
	if (contents & 0x02) {
		flow_ctx.moveTo(x + 15, y + 3);
		flow_ctx.lineTo(x + 15, y + 12);
	}
	
	// Mid Mid
	if (contents & 0x40) {
		flow_ctx.moveTo(x + 3, y + 15);
		flow_ctx.lineTo(x + 12, y + 15);
	}
	
	// Bottom Left
	if (contents & 0x10) {
		flow_ctx.moveTo(x, y + 18);
		flow_ctx.lineTo(x, y + 27);
	}
	
	// Bottom Right
	if (contents & 0x04) {
		flow_ctx.moveTo(x + 15, y + 18);
		flow_ctx.lineTo(x + 15, y + 27);
	}
	
	// Bottom Mid
	if (contents & 0x08) {
		flow_ctx.moveTo(x + 3, y + 30);
		flow_ctx.lineTo(x + 12, y + 30);
	}
	
	flow_ctx.stroke();

}

/*
 * Helper function to draw multiplexers
 */
function drawMux(cpu, x, y, signal) {
	flow_ctx.beginPath();
	flow_ctx.strokeStyle = "black"
	flow_ctx.moveTo(x, y);
	flow_ctx.lineTo(x, y+60);
	flow_ctx.lineTo(x+20, y+44);
	flow_ctx.lineTo(x+20, y+16);
	flow_ctx.lineTo(x, y);
	flow_ctx.stroke();
	flow_ctx.moveTo(x+20, y+30);
	if (cpu.ctrl[signal]) {
		flow_ctx.lineTo(x, y+45);
	} else {
		flow_ctx.lineTo(x, y+15);
	}
	flow_ctx.stroke();
	flow_ctx.fillText("0", x + 2, y + 15);
	flow_ctx.fillText("1", x + 2, y + 50);
	flow_ctx.fillText("C" + signal, x + 10, y + 3);
}

/*
 * Handles a resize or redraw operation
 */
function updateFlow(doResize) {
	
	let vWidth = Math.floor(768);
	let vHeight = Math.floor(432);
	
	// Handle resizing
	if (doResize) {
		
		let ratioX = vWidth;			// Keep the same aspect ratio as the virtual screen
		let ratioY = vHeight;
		let offsetX = 20;				// How far should we be from the right side of the screen? 
		let minimumLowerSpace = 400;	// How much horizontal space is NOT canvas
		let minimumWidth = 320;			// Minimum width of the simulator screen
		
		// Initially, try to fill up the entire width of the screen
		let newWidth = window.innerWidth - offsetX;
		let newHeight = ratioY * newWidth / ratioX;
		
		// See if the new height is going to be too tall
		let remaining = window.innerHeight - newHeight;
		if (remaining < minimumLowerSpace) {
			newWidth = ratioX * (window.innerHeight - minimumLowerSpace) / ratioY;
		}
		
		// Ensure that the new width meets the minimum size
		if (newWidth < minimumWidth)
			newWidth = minimumWidth;
		
		// Resize the window to meet standards
		flow_ctx.canvas.width = newWidth;
		flow_ctx.canvas.height = ratioY * flow_ctx.canvas.width / ratioX;
		
		// Set the graphical scale
		scaleX = flow_ctx.canvas.width / vWidth;
		scaleY = flow_ctx.canvas.height / vHeight;
	}
	
	// Redraw the flow
	drawFlow(cpu_state);
}
