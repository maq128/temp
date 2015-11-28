/**
 * 以当前的 WebView 为媒介，向其它 WebView 中的 js 提供服务接口。
 */
window.RpcServer = {
	/**
	 * 服务提供者调用此函数注册一个服务接口。
	 * @param {String} service_name 接口名称
	 * @param {Function} fnService 注册的服务函数，具有如下形式：
	 * 		function(params, finish) {
	 * 			// params 是调用参数。
	 * 			// finish 是回调函数，应该在服务完成后调用，并传入唯一参数表示服务执行结果。
	 * 			// 		即使服务出错，也要确保回调函数被调用，并用传入参数来表示错误状态。
	 * 		}
	 */
	expose: function(service_name, fnService) {
		var me = this;
		if (me.exposed[service_name] != undefined) {
			throw new Error('RpcServer.expose: service already exists: ' + service_name);
		}
		me.exposed[service_name] = fnService;
	},

	exposed: {}, // 注册的服务接口

	/**
	 * RpcClient 通过 evalJS() 调用此函数，访问服务接口。
	 * @param {String} service_name 服务接口名称
	 * @param {Mixed} params 入口参数
	 * @param {String} vw_id 调用源的 webview id
	 * @param {String} cb_id 调用源的 callback id
	 */
	invoke: function(service_name, params, vw_id, cb_id) {
		var fn = this.exposed[service_name];
		if (typeof fn != 'function') {
			throw new Error('RpcServer.invoke: service not found: ' + service_name);
		}
		fn(params, function(ret) {
			var vw = plus.webview.getWebviewById(vw_id);
			if (!vw) return;
			var js = 'RpcClient.callback(' + JSON.stringify(cb_id);
			js += ',' + JSON.stringify(ret);
			js += ')';
			vw.evalJS(js);
		});
	}
};
