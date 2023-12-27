import * as Constants from "./constants.js";

export default class PathSVG {
	constructor(id, path, style_obj, offset) {
		this.id = id;
		this.node = document.createElementNS("http://www.w3.org/2000/svg", "path");
		this.node.setAttribute(Constants.ID_ATTR, id);
		this.style = Object.assign({}, style_obj);
		this.build_style(this.style);
		var list = []
		if(path)
			path.forEach(val => list.push(val));
		
		this.node.setAttribute(Constants.STYLE_ATTR, this.curr_style);

		if(offset){
			//console.log(id + " " + offset[0] + " "+ offset[1])
			//console.log(path[1]+" "+path[2])
			this.translate(list, offset[0], offset[1]);
		}
		if(path)
			this.node.setAttribute("d", this.build(list));
	}
	
	build_style(style_obj) {
		this.curr_style = "";
		for (const key of Object.keys(style_obj)) {
			this.curr_style += key + ": " + style_obj[key] + "; ";
		}
		
	}
	
	update_style(key, val) {
		if (val === undefined) return;
		this.style[key] = val;
		this.build_style(this.style);
		this.set_attribute(Constants.STYLE_ATTR, this.curr_style);
	}

	get_node() { return this.node; }
    
	set_attribute(key, val){
		if (val === undefined) return this.node.getAttribute(key);
		this.node.setAttribute(key, val);
	}
    
	set_point() {
		throw "Not Implemented";
	}

	translate(arg, x, y) {
		arg[1]+=x;
		arg[2]+=y
	}
    
	build(arg) {
		var res = "";
		for (let i = 0, l = arg.length; i < l; i++){
			//console.log(arg[i] + " " + this.id)
			res = res.concat(arg[i] + " ");
		}
		return res;
	}
}