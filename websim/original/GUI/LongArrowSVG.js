import * as Constants from "./constants.js";
import TextSVG from "./TextSVG.js";
import PolygonSVG from "./PolygonSVG.js";


const FLAGS_DIST_BETWEEN = 30;
const BOX = [0, 0, 120, 0, 120, 40, 0, 40];
const BOX_OFFSET = [Constants.FLAGS_OFFSET[0] + Constants.FLAG_VPOS[0] + 15, Constants.FLAGS_OFFSET[1] + Constants.FLAG_VPOS[1] - 28];
const LABEL_TEXT_STYLE = "font-family: Times New Roman; font-size: 28px; text-anchor:middle;fill:black; ";
const SUBSCRIPT_TEXT_STYLE = "font-family: Times New Roman; font-size: 20px; text-anchor:middle;fill:black; ";

export default class ArrowSVG {
	constructor(arrow_id, i, text_pos, offset) {
        let TPOS;

        if(text_pos.toLowerCase() === "left")
            TPOS = [-30, 30];
        else if (text_pos.toLowerCase() === "right")
            TPOS = [25, 30];
        else if (text_pos.toLowerCase() === "leftup")
            TPOS = [-30, 20];
        else if (text_pos.toLowerCase() === "rightup")
            TPOS = [25, 20];
        else 
            TPOS = [0, -10];
        let sub_offset = i < 10 ? 12 : 16;
        this.arrow = new PolygonSVG(arrow_id, Constants.LONGARROW, Constants.ARROW_STYLE, offset);
		this.text = new TextSVG(TPOS[0], TPOS[1], "arrow" + i, "c", LABEL_TEXT_STYLE, offset);
        this.subscript = new TextSVG(TPOS[0] + sub_offset, TPOS[1] + 10, "arrowsub" + i, i, SUBSCRIPT_TEXT_STYLE, offset);

	}
    
	get_all_nodes() {
		let res = [];
		res.push(this.arrow.get_node());
		res.push(this.text.get_node());
        res.push(this.subscript.get_node());

		return res;
	}
    

}