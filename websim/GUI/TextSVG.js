import * as Constants from "./constants.js";

export default class TextSVG {
	constructor(x, y, id, txt_val, style, offset) {
		this.x = x;
		this.y = y;
		this.id = id;
		this.txt_val = txt_val;
		this.node = document.createElementNS("http://www.w3.org/2000/svg", "text");
		this.node.setAttribute("x", x);	
		this.node.setAttribute("y", y);
		this.node.appendChild(document.createTextNode(txt_val));
		this.node.setAttribute(Constants.ID_ATTR, id);
		this.node.setAttribute(Constants.STYLE_ATTR, style);

		var asm = cpu.instructions;
		if(typeof id !== 'undefined'){
			var IMEMEnable = id.search("imem_val");
			if(IMEMEnable != -1)
			{
				var hold = id.split("_");
				var spot = hold[1].split("val"); //Should hold the asm spot
				if(asm[spot[1]] !== undefined){
					let build = "	";
          			for(var i=0; i<asm[spot[1]].length; i++){
            			if(asm[spot[1]].length==3 && i==1){
              				build+=asm[spot[1]][i]+", ";
            			}
            			else{ 
              				build+=asm[spot[1]][i]+" ";
            			}
					}
					this.node.setAttribute("data-toggle", "tooltip");
					this.node.setAttribute("data-original-title", build);
				}
			}

			var DMEMEnable = id.search("dmem_val");
			if(DMEMEnable!=-1){
				var comments = cpu.dMemComments;
				var hold = id.split("_");
				var spot = hold[1].split("val");
				if(comments[spot[1]]!=null){
					this.node.setAttribute("data-toggle", "tooltip");
					this.node.setAttribute("data-original-title", comments[spot[1]]);
					this.node.setAttribute("data-placement","right")
				}
			}
		}

		var flagEnable = id.search("flag");
		if(flagEnable != -1)
		{
			this.node.setAttribute("data-toggle", "tooltip");
			var real = id.split("_")
			this.node.setAttribute("title", real[0]);
		}
		var ALUen = id.search("ALU")
		if(ALUen != -1)
		{
			this.node.setAttribute("data-toggle", "tooltip");
			this.node.setAttribute("title", txt_val);
		}

		// var jumpEnable = id.search("imem_addr");
		// if(jumpEnable != -1)
		// {
		// 	this.node.setAttribute("data-toggle", "tooltip");
		// 	var valid = -1;
		// 	var currentLook = 0;
		// 	while(typeof branchDest.get(currentLook) !== 'undefined')
		// 	{
		// 		if(branchDest.get(currentLook) == txt_val)
		// 		{
		// 			valid = 1;
		// 			break;
		// 		}
		// 		else
		// 		{
		// 			currentLook++;
		// 		}
		// 	}
		// 	if(valid == 1)
		// 	{
		// 		this.node.setAttribute("title", branchDest.get(currentLook));
		// 	}
		// }


		if(offset)
			this.translate(offset[0], offset[1]);
	}
    
	get_node () { return this.node; }
    
	set_attribute(key, val){
		if (val === undefined) return this.node.getAttribute(key);
		this.node.setAttribute(key, val);
	}
    
	set_point(x, y) {
		this.x = x;
		this.y = y;
		this.node.setAttributeNS(null,"x", x);	
		this.node.setAttributeNS(null,"y", y);
	}

	translate(x, y) {
		this.x += x;
		this.y += y;
		this.node.setAttributeNS(null,"x", this.x);	
		this.node.setAttributeNS(null,"y", this.y);		

	}
}


function getOpcode(txt_val)
{
	switch(txt_val)
	{
		case "0000":
			return "NOOP";
		case "0001":
			return "INPUT";
		case "0010":
			return "MOVE";
		case "0011":
			return "LOADI/LOADP";
		case "0100":
			return "ADD";
		case "0101":
			return "ADDI";
		case "0110":
			return "SUB";
		case "0111":
			return "SUBI";		
		case "1000":
			return "LOAD";
		case "1001":
			return "LOADF";
		case "1010":
			return "STORE";
		case "1011":
			return "STOREF";
		case "1100":
			return "SHIFT";
		case "1101":
			return "CMP";
		case "1110":
			return "JUMP";
		case "1111":
			return "BRANCH";		
	}
}
