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

function drawFlow() {
	
	// Set up style commons
	flow_ctx.font = "10px courier";
	let x, y;
	
	// Draw Code Memory Section
	x = 30; y = 20;
	flow_ctx.strokeStyle = "black";
	flow_ctx.roundRect(x, y, 100, 150, 5);
	flow_ctx.stroke();
	flow_ctx.fillText("Code Memory", x + 20, y + 10);
	
	// Draw Instruction Decoder
	x = 180; y = 20;
	flow_ctx.strokeStyle = "black";
	flow_ctx.roundRect(x, y, 250, 50, 5);
	flow_ctx.stroke();
	flow_ctx.fillText("Instruction Decoder", x + 26, y + 10);
	
	// Draw Register FIle Section
	x = 180; y = 100;
	flow_ctx.strokeStyle = "black";
	flow_ctx.roundRect(x, y, 150, 200, 5);
	flow_ctx.stroke();
	flow_ctx.fillText("Register File", x + 20, y + 10);
}

function updateFlow(doResize) {
	
	let vWidth = 640;
	let vHeight = 360;
	
	// Handle resizing
	if (doResize) {
		
		let ratioX = 16;
		let ratioY = 9;
		let offsetX = 20;
		let minimumLowerSpace = 400;
		let minimumWidth = 320;
		
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
		
		// 
		flow_ctx.setTransform(1, 0, 0, 1, 0, 0);
		flow_ctx.scale(flow_ctx.canvas.width / vWidth, flow_ctx.canvas.height / vHeight);
		
	}
	
	// Redraw the flow
	drawFlow();
}
