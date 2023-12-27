import * as http from 'http';
import fs from 'fs';
import * as path from 'path';
import { CPU } from './simulator/cpu.js';

let cpu = new CPU();

http.createServer(function (request, response) {
    console.log('request ', request.url);

    var filePath = './src' + request.url;
    if (filePath == './src/') {
        filePath = './src/index.html';
    }
    /*
	var filePath = "./src" + request.url;
	if (filePath == "./src/") {
		filePath = "./src/index.html";
	}
    */
	var extname = String(path.extname(filePath)).toLowerCase();
	var mimeTypes = {
		".html": "text/html",
		".js": "application/javascript",
		".css": "text/css",
		".json": "application/json",
		".png": "image/png",
		".jpg": "image/jpg",
		".gif": "image/gif",
		".svg": "image/svg+xml",
		".wav": "audio/wav",
		".mp4": "video/mp4",
		".woff": "application/font-woff",
		".ttf": "application/font-ttf",
		".eot": "application/vnd.ms-fontobject",
		".otf": "application/font-otf",
		".wasm": "application/wasm"
	};

    var contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, function(error, content) {
        if (error) {
            if(error.code == 'ENOENT') {
                fs.readFile('./404.html', function(error, content) {
                    response.writeHead(404, { 'Content-Type': 'text/html' });
                    response.end(content, 'utf-8');
                });
            }
            else {
                response.writeHead(500);
                response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
            }
        }
        else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });
}).listen(3000, "127.0.0.1");