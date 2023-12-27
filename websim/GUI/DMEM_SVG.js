import * as Constants from "./constants.js";
import TextSVG from "./TextSVG.js";
import PolygonSVG from "./PolygonSVG.js";



const ADDR = [50, 0];
const VAL = [350/2, -24];

const BOX_OFFSET = [Constants.DATA_MEM_OFFSET[0] + VAL[0] - 60, Constants.DATA_MEM_OFFSET[1] + VAL[1]];
const BETWEEN_DIST = 38;

let addr = []
let box = []
let mem = [];

export default class DMEM_SVG {
	constructor() {
		this.dmem = new PolygonSVG(Constants.DMEM_ID, Constants.DATA_MEM_POLYGON, Constants.BLOCK_STYLE, Constants.DATA_MEM_OFFSET);
		var dmem_data = cpu.dMem.registers;

		for(var i=0; i<dmem_data.length; i++){
			addr.push(new TextSVG(ADDR[0], ADDR[1] + (BETWEEN_DIST * (i+1)), "dmem_addr"+i,this.pad((i).toString(2), 4), Constants.BLUE_TEXT_STYLE, Constants.DATA_MEM_OFFSET) );
		}
		
		for(var i=0; i<dmem_data.length; i++){
			box.push(new PolygonSVG("dmem_box"+i, [...Constants.REGISTER_BOX], Constants.THIN_BLOCK_STYLE, [BOX_OFFSET[0]-5, BOX_OFFSET[1] + (BETWEEN_DIST * (i+1))]));
		}

		for(var i=0; i<dmem_data.length; i++){
			mem.push(new TextSVG(VAL[0]+10, (BETWEEN_DIST * (i+1)), "dmem_val"+i, dmem_data[i], Constants.TEXT_STYLE, Constants.DATA_MEM_OFFSET));
		}
		this.label = new TextSVG(1974, 1480, "dmem_label", "Data Memory", Constants.COMPONENT_NAME_TEXT_STYLE);

	}

	pad(n, width, z) {
		z = z || '0';
		n = n + '';
		return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	  }
    
	get_all_nodes() {

		let res=[]
		res.push(this.dmem.get_node());

		for(var i=0; i<addr.length; i++){
			res.push(addr[i].get_node());
		}

		for(var i=0; i<box.length; i++){
			res.push(box[i].get_node())
		}

		for(var i=0; i<mem.length; i++){
			res.push(mem[i].get_node())
		}
		res.push(this.label.get_node());
		return res;
	}

}