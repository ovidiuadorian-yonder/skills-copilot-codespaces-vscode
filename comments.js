// Create web server

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const COMMENTS_FILE = path.join(__dirname, 'comments.json');

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
	fs.readFile(path.join(__dirname, 'comments.html'), (err, data) => {
	  if (err) {
		res.writeHead(500, { 'Content-Type': 'text/plain' });
		res.end('Internal Server Error');
		return;
	  }
	  res.writeHead(200, {
		'Content-Type': 'text/html',
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
		'Access-Control-Allow-Headers': 'Content-Type'
	  });
	  res.end(data);
	});
  } else if (req.method === 'POST' && req.url === '/comments') {
	let body = '';
	req.on('data', chunk => {
	  body += chunk.toString();
	});
	req.on('end', () => {
	  try {
		const comment = JSON.parse(body);
		if (typeof comment.name !== 'string' || typeof comment.comment !== 'string') {
		  res.writeHead(400, { 'Content-Type': 'application/json' });
		  res.end(JSON.stringify({ error: 'Invalid input' }));
		  return;
		}
		fs.readFile(COMMENTS_FILE, (err, data) => {
		  let comments = [];
		  if (!err) {
			try {
			  comments = JSON.parse(data);
			  if (!Array.isArray(comments)) throw new Error();
			} catch {
			  res.writeHead(500, { 'Content-Type': 'application/json' });
			  res.end(JSON.stringify({ error: 'Invalid comments file' }));
			  return;
			}
		  }
		  comment.id = comments.length ? comments[comments.length - 1].id + 1 : 1;
		  comments.push(comment);
		  fs.writeFile(COMMENTS_FILE, JSON.stringify(comments, null, 2), err => {
			if (err) {
			  res.writeHead(500, { 'Content-Type': 'application/json' });
			  res.end(JSON.stringify({ error: 'Failed to save comment' }));
			  return;
			}
			res.writeHead(201, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({ id: comment.id }));
		  });
		});
	  } catch {
		res.writeHead(400, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({ error: 'Invalid JSON' }));
	  }
	});
  } else {
	res.writeHead(405, { 'Content-Type': 'application/json' });
	res.end(JSON.stringify({ error: 'Method not allowed' }));
  }
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});


