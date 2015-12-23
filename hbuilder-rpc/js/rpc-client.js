/**
 * 远程访问 RpcServer 提供的服务接口。
 */
window.RpcClient = {
	/**
	 * 调用一个远程服务接口。
	 * @param {String} server_id rpc server 的 webview id。
	 * @param {String} service_name 服务接口名称。
	 * @param {Mixed} params 服务入口参数。
	 * @param {Function} callback 回调函数，用于回传服务执行结果。
	 */
	invoke: function(server_id, service_name, params, callback) {
		var me = this;
		var cs = plus.webview.getWebviewById(server_id);
		if (!cs) throw new Error('RpcServer view not found: ' + server_id);
		var js = 'RpcServer.invoke(' + JSON.stringify(service_name);
		js += ',' + JSON.stringify(params);
		if (typeof callback == 'function') {
			js += ',' + JSON.stringify(plus.webview.currentWebview().id);
			js += ',' + me.next_callback_id;
			me.callbacks[me.next_callback_id] = callback;
			me.next_callback_id ++;
		}
		js += ')';
		cs.evalJS(js);
	},

	next_callback_id: 1,
	callbacks: {},
	callback: function(cb_id, ret) {
		var me = this;
		var cb = me.callbacks[cb_id];
		if (typeof cb != 'function') return;
		cb.call(undefined, ret);
		delete me.callbacks[cb_id];
	}
};
