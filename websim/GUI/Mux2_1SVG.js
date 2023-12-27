import * as Constants from "./constants.js";
import TextSVG from "./TextSVG.js";
import PolygonSVG from "./PolygonSVG.js";
import PathSVG from "./PathSVG.js"

function onClick (evt) {
	var modal = document.getElementById("modal_content");
	var modal_content = document.getElementById("modal_content");
	modal.style.visibility = "visible";
	modal.style.display = "block";

	modal_content.innerHTML = "";
	let img = document.createElement("img");
	img.src = "./GUI/img/mux.png";
	img.id = "mux_img";
	img.style = "justify-content: center; align-items: center;";
	modal_content.append(img);
}

export default class Mux2_1SVG {
	constructor(mux_id, true_id, false_id, offset) {
		this.mux_polygon = new PolygonSVG(mux_id, [...Constants.MUX_POLYGON], Constants.BLOCK_STYLE, offset, onClick);
		this.false_text = new TextSVG(Constants.MUX_FALSE[0], Constants.MUX_FALSE[1], false_id, Constants.MUX_FALSE_TEXT, Constants.TEXT_STYLE, offset);
		this.true_text = new TextSVG(Constants.MUX_TRUE[0], Constants.MUX_TRUE[1], true_id, Constants.MUX_TRUE_TEXT, Constants.TEXT_STYLE, offset);
		this.true_wire = new PathSVG (mux_id+"_"+Constants.MUX_TRUE_WIRE_ID, Constants.MUX_TRUE_WIRE, Constants.WIRE_STYLE, offset);
		this.false_wire = new PathSVG(mux_id+"_"+Constants.MUX_FALSE_WIRE_ID, Constants.MUX_FALSE_WIRE, Constants.WIRE_STYLE, offset);
		this.selected = -1;
		this.mux_id = mux_id;
	}
    
	get_all_nodes() {
		let res = [];
		res.push(this.mux_polygon.get_node());
		res.push(this.true_text.get_node());
		res.push(this.false_text.get_node());
		res.push(this.true_wire.get_node());
		res.push(this.false_wire.get_node());
		return res;
	}

	getSelected() {
		return this.selected;
	}

	select(val) {
		this.selected = val
		var t =  document.getElementById(this.mux_id+"_true_wire");
		var f = document.getElementById(this.mux_id+"_false_wire");
		
		if(val==0){
		t.style.visibility = "hidden";
		f.style.visibility = "visible"
		}

		else{
			t.style.visibility = "visible";
			f.style.visibility = "hidden";
		}
	}
    

}