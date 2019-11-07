var CHARSET = "abcdefghijkmnpqrstuvwxyzABCDEFGHIJKLMNPQRSTUVWXYZ0123456789";
function genPwd() {
	var pwd = "";
	for (var i=0; i<8; i++) {
		var idx = Math.floor(Math.random() * CHARSET.length);
		pwd += CHARSET[idx];
	}
	console.log(pwd)
	return pwd;
}

for (var i=0; i<10; i++) {
	genPwd();
}
