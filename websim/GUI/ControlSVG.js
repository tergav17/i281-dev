import * as Constants from "./constants.js";
import TextSVG from "./TextSVG.js";
import PolygonSVG from "./PolygonSVG.js";

const TPOS = [40, 80];
const PC_VAL = [100, 75];
const BOX = [0, 0, 100, 0, 100, 40, 0, 40];
const BOX_OFFSET = [Constants.PC_VALUE_OFFSET[0] + PC_VAL[0] - 50, Constants.PC_VALUE_OFFSET[1] + PC_VAL[1] - 28];
const ARROW_DIST_BETWEEN = 40;
const LABEL_TEXT_STYLE = "font-family: Times New Roman; font-size: 28px; text-anchor:middle;fill:black; ";
const SUBSCRIPT_TEXT_STYLE = "font-family: Times New Roman; font-size: 20px; text-anchor:middle;fill:black; ";
const VALUE_STYLE = "font-family: Times New Roman; font-size: 28px; text-anchor:middle;fill:black; ";


export default class ControlSVG {
	constructor() {
		this.control = new PolygonSVG(Constants.CONTROL_ID, Constants.CONTROL_POLYGON, Constants.BLOCK_STYLE, Constants.CONTROL_OFFSET);
		this.control_text = new TextSVG(Constants.CONTROL_TPOS[0], Constants.CONTROL_TPOS[1], Constants.CONTROL_TEXT_ID, Constants.CONTROL_TEXT, Constants.COMPONENT_NAME_TEXT_STYLE, Constants.CONTROL_OFFSET);
		this.arrows = [];
		this.subscripts = [];
		this.labels = [];
		this.vals = [];
		for(let i = 1; i <= 18; ++ i)
		{ 
			let sub_offset = i < 10 ? 12 : 16;
			this.arrows.push( new PolygonSVG("control_c" + i, [...Constants.ARROW], Constants.ARROW_STYLE, [Constants.CONTROL_ARROW_OFFSET[0] + i * ARROW_DIST_BETWEEN - 15, Constants.CONTROL_ARROW_OFFSET[1]]));
			this.labels.push(new TextSVG(TPOS[0], TPOS[1], "label"+i, "c", LABEL_TEXT_STYLE, [Constants.CONTROL_OFFSET[0] + (i-1) * ARROW_DIST_BETWEEN -15 , Constants.CONTROL_OFFSET[1]]));
			this.subscripts.push(new TextSVG(TPOS[0] + sub_offset, TPOS[1] + 10, "sub"+i, i, SUBSCRIPT_TEXT_STYLE, [Constants.CONTROL_OFFSET[0] + (i-1) * ARROW_DIST_BETWEEN - 15, Constants.CONTROL_OFFSET[1]]));
			this.vals.push( new TextSVG(Constants.CONTROL_ARROW_OFFSET[0] + i * ARROW_DIST_BETWEEN - 7, Constants.CONTROL_ARROW_OFFSET[1] + 90, "c"+i+"val", "0", VALUE_STYLE ));
		}

	}
    
	get_all_nodes() {
		let res = [];
		res.push(this.control.get_node());
		res.push(this.control_text.get_node());
		this.vals.forEach(x => res.push(x.get_node()));
		this.labels.forEach(x => res.push(x.get_node()));
		this.subscripts.forEach(x => res.push(x.get_node()));
		this.arrows.forEach(x => res.push(x.get_node()));
		return res;
	}
    

}