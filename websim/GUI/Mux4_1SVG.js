import * as Constants from "./constants.js";
import TextSVG from "./TextSVG.js";
import PolygonSVG from "./PolygonSVG.js";
import PathSVG from "./PathSVG.js";

export default class Mux4_1SVG {
	constructor(mux_id, a_id, b_id, c_id, d_id, offset) {
		this.mux_polygon = 	new PolygonSVG(mux_id, [...Constants.MUX4_POlYGON], Constants.BLOCK_STYLE, offset);
		this.a_text = new TextSVG(Constants.MUX_A[0],Constants.MUX_A[1], a_id, Constants.MUX_A_TEXT, Constants.SMALL_TEXT_STYLE, offset);
		this.b_text = new TextSVG(Constants.MUX_B[0],Constants.MUX_B[1], b_id, Constants.MUX_B_TEXT, Constants.SMALL_TEXT_STYLE, offset);
		this.c_text = new TextSVG(Constants.MUX_C[0],Constants.MUX_C[1], c_id, Constants.MUX_C_TEXT, Constants.SMALL_TEXT_STYLE, offset);
		this.d_text = new TextSVG(Constants.MUX_D[0],Constants.MUX_D[1], d_id, Constants.MUX_D_TEXT, Constants.SMALL_TEXT_STYLE, offset);
		this.a_wire = new PathSVG (mux_id+"_sel"+0, Constants.MUX_A_WIRE, Constants.THIN_WIRE_STYLE, offset);
		this.b_wire = new PathSVG(mux_id+"_sel"+1, Constants.MUX_B_WIRE, Constants.THIN_WIRE_STYLE, offset);
		this.c_wire = new PathSVG (mux_id+"_sel"+2, Constants.MUX_C_WIRE, Constants.THIN_WIRE_STYLE, offset);
		this.d_wire = new PathSVG(mux_id+"_sel"+3, Constants.MUX_D_WIRE, Constants.THIN_WIRE_STYLE, offset);
		this.a_wire_id = mux_id+"_sel"+0;
		this.b_wire_id = mux_id+"_sel"+1;
		this.c_wire_id = mux_id+"_sel"+2;
		this.d_wire_id = mux_id+"_sel"+3;
		this.selected = -1;
	}
    
	get_all_nodes() {
		let res = [];
		res.push(this.mux_polygon.get_node());
		res.push(this.a_text.get_node());
		res.push(this.b_text.get_node());
		res.push(this.c_text.get_node());
		res.push(this.d_text.get_node());
		res.push(this.a_wire.get_node());
		res.push(this.b_wire.get_node());
		res.push(this.c_wire.get_node());
		res.push(this.d_wire.get_node());
		return res;
	}

	get_selected() {
		return this.selected;
	}

	set_selected(val) {
		this.selected = val;
		// TODO: highlight selected value
	}

	select(val) {
		this.selected = val;
		var a =  document.getElementById(this.a_wire_id);
		var b = document.getElementById(this.b_wire_id);
		var c = document.getElementById(this.c_wire_id);
		var d = document.getElementById(this.d_wire_id);		
		if(val===3) {
			a.style.visibility = "hidden";
			b.style.visibility = "hidden";
			c.style.visibility = "hidden";
			d.style.visibility = "visible";
		} else if (val === 2) {
			a.style.visibility = "hidden";
			b.style.visibility = "hidden";
			c.style.visibility = "visible";
			d.style.visibility = "hidden";
		} else if (val === 1) {
			a.style.visibility = "hidden";
			b.style.visibility = "visible";
			c.style.visibility = "hidden";
			d.style.visibility = "hidden";
		}
		else{
			a.style.visibility = "visible";
			b.style.visibility = "hidden";
			c.style.visibility = "hidden";
			d.style.visibility = "hidden";
		}
	}
    

}