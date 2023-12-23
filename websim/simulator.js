const diag_flow = document.getElementById("diagflow");

// Attempt to get the context for the daig flow
if (diag_flow.getContext) {
	var flow_ctx = diag_flow.getContext("2d");
} else {
	alert("Canvas not supported!");
}

// Add listeners for key evens
window.addEventListener('keyup',keyUpListener,false);
window.addEventListener('keydown',keyDownListener,false); 

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

flow_ctx.scale(1.0, 2.0);
//flow_ctx.setTransform(1, 0, 0, 1, 0, 0);
flow_ctx.fillRect(0, 0, 10, 10);
