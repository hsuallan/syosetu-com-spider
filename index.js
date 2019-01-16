const fs = require('fs')
const cheerio = require('cheerio')
const axios = require('axios');
const process = require('process');

function from_net_work(novel_id, page, deep = 0){
  if(deep > 2)
	throw "Retry times over: " + novel_id + ", " + page

  if(novel_id == null || page == null)
	throw "please input novel id and page number"

  return new Promise((res, rej) => {

  axios.get(`https://ncode.syosetu.com/${novel_id}/${page}/`)
  .then(({data}) => {
	//write_to(novel(data))
	res(data)
  })
  .catch(err => {
	  console.log(err)
	  from_net_work(novel_id, page, deep + 1)
          throw "Retry get: " + novel_id + ", " + page + " deep=" + deep
  })
  
  })
}


function novel(contents){
	const $ = cheerio.load(contents)

	const title = $('p[class="novel_subtitle"]').text() 
	const rows = []
	
	const max = 2000
	for(let i = 1; i< max;i++){
		const html = $(`p[id="L${i}"]`).html()
		if(html == null){
			if($(`p[id="L${i+1}"]`).html() == null)break //Both this row and next row are null
		}else{
			rows.push( $(`p[id="L${i}"]`).text())
		}
	}
	return {title, rows}
}

function line(str){
	return str + '\n'
}

function write_to(novel, index = ""){
	const stream = fs.createWriteStream("novels/" + index +"_" + novel.title+".kobako.txt", {encoding: 'utf8'});
	stream.once('open', function(fd) {
		stream.write(line(novel.title))
		novel.rows.forEach(r => {
			stream.write(line(r))
		})
		stream.end()
	})
}


//fs.readFile('393.txt', 'utf8', function(err, contents) {     
/*
fs.readFile('393.txt', 'utf8', function(err, contents) {     
	write_to(novel(contents))
});
*/

// 0 == node.exe 1 == thisfile's path
const novel_id = process.argv[2]
const min = process.argv[3]
const max = process.argv[4]


console.log(novel_id, min, max)

for(let i=min;i <= max;i++){
	console.log(i)
	from_net_work(novel_id, i).then(data => {
		write_to(novel(data), i)
	}).catch(err => {
		console.log(err)
	})
}

