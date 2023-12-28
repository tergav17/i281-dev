/*
 * simulator.js
 *
 * Handles the user-facing functions of the simulator
 */


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

// Do initial drawing of canvas
updateFlow(true);


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
	
	// Set up style commons
	flow_ctx.font = "10px courier";
	flow_ctx.lineCap = "round";
	let x, y;
	
	// Draw Code Memory Section
	x = 30; y = 20;
	flow_ctx.strokeStyle = "black";
	flow_ctx.roundRect(x, y, 100, 150, 5);
	flow_ctx.stroke();
	flow_ctx.fillText("Code Memory", x + 17, y + 10);
	flow_ctx.fillText("ISR: 0x" + (cpu.isr).toString(16).padStart(4, '0').toUpperCase(), x + 5, y + 30);
	flow_ctx.fillText("SELECT: 0x" + (cpu.select).toString(16).padStart(2, '0').toUpperCase(), x + 5, y + 45);
	flow_ctx.fillText("BANK: " + cpu.ctrl[0] + " [C0]", x + 5, y + 125);
	flow_ctx.fillText("WRITE: " + cpu.ctrl[1] + " [C1]", x + 5, y + 140);
	
	// Draw Code Memory Section
	x = 30; y = 200;
	flow_ctx.strokeStyle = "black";
	flow_ctx.roundRect(x, y, 100, 75, 5);
	flow_ctx.stroke();
	flow_ctx.fillText("Code Writeback", x + 6, y + 10);
	flow_ctx.fillText("OUT: 0x" + (cpu.write_out).toString(16).padStart(4, '0').toUpperCase(), x + 5, y + 30);
	flow_ctx.fillText("CACHE: 0x" + (cpu.write_cache).toString(16).padStart(2, '0').toUpperCase(), x + 5, y + 45);
	flow_ctx.fillText("WRITE: " + cpu.ctrl[3] + " [C3]", x + 5, y + 65);
	
	
	// Draw Instruction Decoder
	x = 180; y = 20;
	flow_ctx.strokeStyle = "black";
	flow_ctx.roundRect(x, y, 250, 50, 5);
	flow_ctx.stroke();
	flow_ctx.fillText("Instruction Decoder", x + 26, y + 10);
	
	// Draw Register File Section
	x = 180; y = 100;
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
	x = 350; y = 120;
	flow_ctx.strokeStyle = "black";
	flow_ctx.roundRect(x, y, 100, 160, 5);
	flow_ctx.stroke();
	flow_ctx.fillText("ALU", x + 20, y + 10);
	

	// Draw Program Counter Section
	x = 180; y = 300;
	flow_ctx.strokeStyle = "black";
	flow_ctx.roundRect(x, y, 100, 75, 5);
	flow_ctx.stroke();
	flow_ctx.fillText("Program Counter", x + 5, y + 10);
	flow_ctx.fillText("PC: 0x" + (cpu.pc).toString(16).padStart(2, '0').toUpperCase(), x + 5, y + 30);
	flow_ctx.fillText("NEXT: 0x" + (cpu.pc_next).toString(16).padStart(2, '0').toUpperCase(), x + 5, y + 45);
	flow_ctx.fillText("BRANCH: " + cpu.ctrl[2] + " [C2]", x + 5, y + 65);
	
	// Draw Data Memory Section
	x = 470; y = 100;
	flow_ctx.strokeStyle = "black";
	flow_ctx.roundRect(x, y, 100, 150, 5);
	flow_ctx.stroke();
	flow_ctx.fillText("Data Memory", x + 20, y + 10);
	
	// Draw C11 Multiplexer
	drawMux(cpu, 470, 300, 11);
}

/*
 * Helper function to draw multiplexers
 */
function drawMux(cpu, x, y, signal) {
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
	
	let vWidth = Math.floor(640 * 1.2);
	let vHeight = Math.floor(360 * 1.2);
	
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
		flow_ctx.setTransform(1, 0, 0, 1, 0, 0);
		flow_ctx.scale(flow_ctx.canvas.width / vWidth, flow_ctx.canvas.height / vHeight);
		
	}
	
	// Redraw the flow
	drawFlow(cpu_state);
}
