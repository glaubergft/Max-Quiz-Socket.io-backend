var http = require('http'),
    fs = require('fs'),
    index = fs.readFileSync(__dirname + '/index.html');

// Send index.html to all requests
var app = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(index);
});

// Socket.io server listens to our app
var io = require('socket.io').listen(app);
io.set('log level', 1);

//configura as quatro fases do campeonato para cada categoria:
var catGuid = new Object();
var guidsEmEspera = new Object();
for (var i1=1; i1<=7; i1++)
{
	for (var i2=1; i2<=4; i2++)
	{
		catGuid[i1+'_'+i2]=newGuid();
		console.log(i1+'_'+i2+':'+catGuid[i1+'_'+i2]);
	}
}

// Emit welcome message on connection
io.sockets.on('connection', function(socket) {
	var customData=socket.manager.handshaken[socket.id].query.customData.split('|');
	var categoriaFase=customData[0];
	var dadosUsuario=customData[1];
	var guid=catGuid[categoriaFase];
	console.log(categoriaFase);
	console.log(guid);
	socket.join(guid);
	if (guidsEmEspera[guid]==null)
	{
		guidsEmEspera[guid]=dadosUsuario;
	}
	else
	{
		var dadosUsuario_criadorSala=guidsEmEspera[guid];
		delete guidsEmEspera[guid];
		catGuid[categoriaFase]=newGuid();
		socket.broadcast.to(guid).emit('jogadorEncontrado', { jogadorNumero:2, informacoesUsuario:dadosUsuario });
		socket.emit('jogadorEncontrado', { jogadorNumero:1, informacoesUsuario:dadosUsuario_criadorSala });
	}
	
	socket.on('disconnect', function () {
		if(guidsEmEspera[guid]!=null)
		{
			delete guidsEmEspera[guid];
		}
        console.log('DISCONNESSO '+guid);
    });
	
	socket.on('acao', function(data) {
		console.log('Acao:'+data.acao+ ' ... '+data.parametro);
		socket.broadcast.to(guid).emit('acaoAdversario', data);
		if (data.acao=='sair')
		{
			socket.leave(guid);
		}
	});
});



var guidIndex=1;
function newGuid()
{
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		return v.toString(16);
	});
}

app.listen(3000);
