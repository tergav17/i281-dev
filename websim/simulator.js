const diag_flow = document.getElementById("diagflow");
const monitor_text = document.getElementById("monitortext");

console.log(monitor_text);
// Attempt to get the context for the daig flow
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
draw(true);


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
	draw(true);
}

function draw(doResize) {
	
	// Handle resizing
	if (doResize) {
		
		//let r
		
		flow_ctx.setTransform(1, 0, 0, 1, 0, 0);
		flow_ctx.scale(1.0, 1.0);
		
		flow_ctx.canvas.width = window.innerWidth * (2/3);
		flow_ctx.canvas.height = 9 * flow_ctx.canvas.width / 16;
		monitor_text.style.height = (flow_ctx.canvas.height) + "px";
		
	}
	
	flow_ctx.fillRect(0, 0, 10, 10);
}
