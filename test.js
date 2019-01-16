const fs = require('fs')

const stream = fs.createWriteStream("novels/test.txt", {encoding: 'utf8'});

	stream.once('open', function(fd) {
		stream.write('test')
		stream.end()
	})

