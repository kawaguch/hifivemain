/*
 * Copyright (C) 2012 NS Solutions Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * hifive
 */

/* ------ h5.core.data ------ */
(function() {
	// =========================================================================
	//
	// Constants
	//
	// =========================================================================

	//=============================
	// Production
	//=============================

	//TODO エラーコード定数等Minify版（製品利用版）でも必要なものはここに書く

	//=============================
	// Development Only
	//=============================

	var fwLogger = h5.log.createLogger('h5.core.data');

	/* del begin */

	//TODO Minify時にプリプロセッサで削除されるべきものはこの中に書く
	/* del end */


	// =========================================================================
	//
	// Cache
	//
	// =========================================================================
	var prefix = "h5";

	//TODO グローバルキャッシュに持っていくべき
	function getH5DataKey(key) {
		return 'data-' + prefix + '-' + key;
	}


	// =========================================================================
	//
	// Privates
	//
	// =========================================================================
	//=============================
	// Variables
	//=============================
	var globalBindSerialNumber = 0;

	var bindingMap = {};


	//=============================
	// Functions
	//=============================

	function createSerialNumber() {
		return globalBindSerialNumber++;
	}

	/**
	 * プロパティを作成する。 ES5のObject.definePropertyが使用できない場合は 非標準の__defineGetter__, __defineSetter__を使用する。
	 * どちらも使用できない場合は例外を発生させる。 参考：
	 * http://blogs.msdn.com/b/ie/archive/2010/09/07/transitioning-existing-code-to-the-es5-getter-setter-apis.aspx
	 */
	function defineProperty(obj, prop, desc) {
		var ieVer = h5.env.ua.browserVersion;
		var isIE = h5.env.ua.isIE;
		var isES5Compliant = Object.defineProperty && (!isIE || (isIE && (ieVer >= 9))); // TODO
		// Safari5.0も対応していないのではじく必要あり

		if (isES5Compliant) {
			Object.defineProperty(obj, prop, desc);
		} else if (Object.prototype.__defineGetter__) {
			if ('get' in desc) {
				obj.__defineGetter__(prop, desc.get);
			}
			if ('set' in desc) {
				obj.__defineSetter__(prop, desc.set);
			}
			if ('value' in desc) {
				obj[prop] = desc.value;
			}
		} else {
			throw new Error('defineProperty: プロパティを作成できません');
		}
	}


	/***********************************************************************************************
	 * @class
	 * @name h5.helper.EventDispatcher
	 **********************************************************************************************/
	function EventDispatcher(target) {
		//TODO eventListenerはクロージャで管理する（thisを汚さない）ようにする
		if (target) {
			this._eventTarget = target;
			var that = this;

			target.hasEventListener = function(type, listener) {
				that.hasEventListener(type, listener);
			};
			target.addEventListener = function(type, listener) {
				that.addEventListener(type, listener);
			};
			target.removeEventListener = function(type, listener) {
				that.removeEventListener(type, listener);
			};
			target.dispatchEvent = function(event) {
				that.dispatchEvent(event);
			};
		}
	}

	/**
	 * @memberOf h5.helper.EventDispatcher
	 * @param type
	 * @param listener
	 * @returns {Boolean}
	 */
	EventDispatcher.prototype.hasEventListener = function(type, listener) {
		if (!this._eventListeners) {
			return false;
		}
		var l = this._eventListeners[type];
		if (!l) {
			return false;
		}

		for ( var i = 0, count = l.length; i < count; i++) {
			if (l[i] === listener) {
				return true;
			}
		}
		return false;

	};

	/**
	 * @memberOf h5.helper.EventDispatcher
	 * @param type
	 * @param listener
	 */
	EventDispatcher.prototype.addEventListener = function(type, listener) {
		if (this.hasEventListener(type, listener)) {
			return;
		}

		if (!this._eventListeners) {
			this._eventListeners = {};
		}

		if (!(type in this._eventListeners)) {
			this._eventListeners[type] = [];
		}

		this._eventListeners[type].push(listener);
	};

	/**
	 * @memberOf h5.helper.EventDispatcher
	 * @param type
	 * @param lisntener
	 */
	EventDispatcher.prototype.removeEventListener = function(type, lisntener) {
		if (!this.hasEventListener(type, listener)) {
			return;
		}

		var l = this._eventListeners[type];

		for ( var i = 0, count = l.length; i < count; i++) {
			if (l[i] === listener) {
				l.splice(i, 1);
				return;
			}
		}

	};

	/**
	 * @memberOf h5.helper.EventDispatcher
	 * @param event
	 */
	EventDispatcher.prototype.dispatchEvent = function(event) {
		if (!this._eventListeners) {
			return;
		}
		var l = this._eventListeners[event.type];
		if (!l) {
			return;
		}

		if (!event.target) {
			event.target = this._eventTarget ? this._eventTarget : this;
		}

		for ( var i = 0, count = l.length; i < count; i++) {
			l[i].call(event.target, event);
		}
	};





	/***********************************************************************************************
	 * @class
	 **********************************************************************************************/
	function ObjectManager() {
		this.objectDescriptor = null;
		this.objects = {};
		this.objectArray = [];

		this.idKey = null;
		this.size = 0;

		function ObjectProxy() {}
		ObjectProxy.prototype = new EventDispatcher();

		defineProperty(ObjectProxy.prototype, '_proxy_triggerChange', {
			value: function(obj, prop, oldValue, newValue) {
				var event = {
					type: 'change',
					target: obj,
					property: prop,
					oldValue: oldValue,
					newValue: newValue
				};
				this.dispatchEvent(event);
			}
		});

		this.proxy = ObjectProxy;
	}

	/**
	 * @returns {ObjectManager}
	 */
	ObjectManager.createFromDescriptor = function(objectDescriptor) {
		if (!$.isPlainObject(objectDescriptor)) {
			throw new Error('objectDescriptorにはオブジェクトを指定してください。');
		}

		var om = new ObjectManager();
		om._init(objectDescriptor);
		return om;
	};

	ObjectManager.prototype = new EventDispatcher();

	//	ObjectManager.prototype.push = function(obj){
	//		//TODO 本当はpushは可変長引数に対応するのでその対応が必要
	//		this.size++;
	//		this.objectArray.push(obj);
	//	};
	//
	//	ObjectManager.prototype.pop = function() {
	//		//TODO
	//		this.size--;
	//		this.objectArray.pop();
	//	};

	/**
	 */
	ObjectManager.prototype._init = function(objectDescriptor) {
		this.objectDescriptor = objectDescriptor;

		var defineProxyProperty = function(obj, propName) {
			var p = '_' + propName;

			defineProperty(obj, propName, {
				enumerable: true,
				configurable: true,
				get: function() {
					return this[p];
				},
				set: function(value) {
					if (this[p] === value) {
						// 値の変更がない場合はchangeイベントは発火しない
						return;
					}

					var oldValue = this[p];

					if (this[p] === undefined) {
						defineProperty(this, p, {
							value: value,
							writable: true,
						});
					}

					this[p] = value;

					this._proxy_triggerChange(this, propName, oldValue, value);
				}
			});
		};

		var hasId = false;

		for ( var p in objectDescriptor) {
			defineProxyProperty(this.proxy.prototype, p);
			if (objectDescriptor[p] && (objectDescriptor[p].isId === true)) {
				if (hasId) {
					throw new Error('isIdを持つプロパティが複数存在します。 prop = ' + p);
				}

				this.idKey = p;
				hasId = true;
			}
		}

		if (!hasId) {
			throw new Error('id指定されたプロパティが存在しません。isId = trueであるプロパティが1つ必要です');
		}
	};

	/**
	 * @returns {Object}
	 */
	ObjectManager.prototype._createObjectById = function(id) {
		if (id === undefined || id === null) {
			throw new Error('ObjectManager.createObjectById: idが指定されていません');
		}
		if (id in this.objects) {
			throw new Error('ObjectManager.createObjectById: id = ' + id + ' のオブジェクトは既に存在します');
		}

		var obj = new this.proxy();
		obj[this.idKey] = id;

		this.objects[id] = obj;
		this.size++;

		return obj;
	};

	/**
	 * @returns {Object}
	 */
	ObjectManager.prototype.createObject = function(obj) {
		var id = obj[this.idKey];
		if (id === null || id === undefined) {
			throw new Error('ObjectManager.createObject: idが指定されていません');
		}

		var o = this._createObjectById(id);
		for (prop in obj) {
			if (prop == this.idKey) {
				continue;
			}
			o[prop] = obj[prop];
		}

		var that = this;
		o.addEventListener('change', function(event) {
			that.objectChangeListener(event);
		});

		var ev = {
			type: 'add',
			obj: o
		};
		this.dispatchEvent(ev);

		return o;
	};

	/**
	 * @returns {Object}
	 */
	ObjectManager.prototype.setObject = function(obj) {
		var idKey = this.idKey;

		var o = this.findById(obj[idKey]);
		if (!o) {
			// 新規オブジェクトの場合は作成
			return this.createObject(obj);
		}

		// 既に存在するオブジェクトの場合は値を更新
		for (prop in obj) {
			if (prop == idKey) {
				continue;
			}
			o[prop] = obj[prop];
		}
	};

	/**
	 */
	ObjectManager.prototype.removeObject = function(obj) {
		this.removeObjectById(obj[this.idKey]);
	};

	ObjectManager.prototype.removeObjectById = function(id) {
		if (id === undefined || id === null) {
			throw new Error('ObjectManager.removeObjectById: idが指定されていません');
		}
		if (!(id in this.objects)) {
			return;
		}

		var obj = this.objects[id];

		delete this.objects[id];

		this.size--;

		var ev = {
			type: 'remove',
			obj: obj
		};
		this.dispatchEvent(ev);
	};

	ObjectManager.prototype.getAllObjects = function() {
		var ret = [];
		var objects = this.objects;
		for ( var prop in objects) {
			ret.push(objects[prop]);
		}
		return ret;
	};

	/**
	 * @returns {Number} オブジェクトの個数
	 */
	ObjectManager.prototype.getSize = function() {
		return this.size;
	};

	/**
	 */
	ObjectManager.prototype.objectChangeListener = function(event) {
		var ev = {
			type: 'change',
			obj: event.target,
			property: event.property,
			oldValue: event.oldValue,
			newValue: event.newValue
		};
		this.dispatchEvent(ev);
	};

	/**
	 */
	ObjectManager.prototype.findById = function(id) {
		return this.objects[id];
	};

	ObjectManager.prototype.has = function(obj) {
		return !!this.findById(obj[this.idKey]);
	};


	/***********************************************************************************************
	 * @class
	 **********************************************************************************************/
	function GlobalEntityManager() {
		this.collections = {};
	}

	/**
	 * @memberOf GlobalEntityManager
	 */
	GlobalEntityManager.prototype.register = function(name, descriptor) {
		//TODO nameもdescriptorの中に入れられるようにする？
		this.collections[name] = createModelCollection(descriptor);
		return this.collections[name]; //TODO 高速化
	};

	GlobalEntityManager.prototype.getCollection = function(name) {
		//TODO undefチェック必要か
		return this.collections[name];
	};

	// =========================================================================
	//
	// Body
	//
	// =========================================================================

	//TODO モジュール本体のコードはここに書く

	function createModelCollection(descriptor) {
		return ObjectManager.createFromDescriptor(descriptor);
	}

	function DataBinder(controller, modelCollection, renderRoot, templateKey, converter) {
		this.collection = modelCollection;
		this.templateKey = templateKey;
		this.renderRoot = renderRoot; //TODO $find()的なことをする対応

		this.__controller = controller;

		//TODO KeyだけでなくDOM要素も受け取れるようにする
		this.templateCache = $(controller.view.get(templateKey)).clone();

		this.autoBind = true;

		var that = this;

		this.collection.addEventListener('add', function(event) {
			fwLogger.debug('collection added');
			//			that.applyBinding(event.obj);
		});

		this.collection.addEventListener('change', function(event) {

		});

		this.collection.addEventListener('remove', function(event) {

		});

	}

	DataBinder.prototype.getCurrentViewState = function(renderModel) {
		throw new Error('未実装');
	};

	DataBinder.prototype.setRenderControllFunction = function(func) {
		this.renderFunction = func;
	};

	/**
	 * converterFunctionの仕様： converterFunction(rootObject, object, key, value) { return
	 * value-for-key-or-object; } $.isPlainObject以外の値が返ってきた場合⇒ $.text()で文字列として流し込む Objectの場合⇒
	 * isHtmlがtrueなら$.html()、それ以外なら$.text()で valueにセットされている値を流し込む
	 */
	DataBinder.prototype.setConverter = function(converterFunction) {
		this.converter = converterFunction;
	};

	DataBinder.prototype.appendRenderer = function(elem){

	};

	DataBinder.prototype.removeRenderer = function(elem) {

	};

	function applyBinding(view, rootElement, templateKey, models) {
		//var target = getTarget(element, this.__controller.rootElement, true); //TODO getTarget
		var target = $(rootElement); //elementはターゲットとなる親要素

		var html = view.get(templateKey, models);
		var $html = $(html);

		var that = this;

		//		if (!(bindObjectName || $html.attr('data-bind-property'))) {

		//bindObjectName = bindObjectName ? bindObjectName : $html.attr('data-bind-property');

		//var models = param[bindObjectName];
		if (!models) {
			return;
		}
		//models = wrapInArray(models);

		var modelArray = models; //models.getAllObjects();

		//コレクションの数だけループ
		for ( var i = 0, len = modelArray.length; i < len; i++) {
			var model = modelArray[i];
			//要素数分使うのでクローンする
			var $clone = $html.clone();
			var uuid = createSerialNumber();

			bindingMap[uuid] = {
				m: model
			};

			$clone.attr(getH5DataKey('bind-key'), uuid);

			var $dataBind = $clone.find('*[' + getH5DataKey('bind') + ']');

			//モデル中の各要素について
			for ( var p in model) {
				fwLogger.debug('prop = {0}', p);

				var $dom = $dataBind.filter(function() {
					//					return $(this).attr('data-bind') === bindObjectName + '.' + p;

					//fwLogger.debug('attr = {0}, p = {1}', $(this).attr(getH5DataKey('bind')), p);

					return $(this).attr(getH5DataKey('bind')).lastIndexOf(p, 0) === 0;

//					return $(this).attr(getH5DataKey('bind')) === p;
					//TODO 子オブジェクトのバインドもできるように
				});

				//見つかった要素をバインド
				$dom.each(function() {
					var $this = $(this);

					if ($this.is('[data-h5-bind-template]')) {
						var templateKey = $this.attr('data-h5-bind-template');
						if(templateKey.indexOf) {
						}

						//ネストしてテンプレートを適用
						var childBindProp = $this.attr(getH5DataKey('bind'));
						//fwLogger.debug('child templateId = {0}',$this.attr(getH5DataKey('bind-template')));

						applyBinding(view, this, $this.attr(getH5DataKey('bind-template')),
								model[childBindProp]);
					} else {
						//						that.applyValue($this, model, p);
						if (that.converter) {
							var cv = that.converter(model, model, p, model[p]);

							if ($.isPlainObject(cv)) {
								//cv.valueがない場合のチェック

								if (cv.isHtml) {
									$this.html(cv.value);
								} else {
									$this.text(cv.value);
								}
							} else {
								$this.text(cv); //TODO オブジェクトが子要素の場合を考える。パス表記を渡すようにする？？
							}
						} else {
							$this.html(model[p]);
						}
					}
				});
			}


			target.append($clone);
		}
	}

	DataBinder.prototype.applyValue = function($elem, model, p) {
		//TODO
		var that = this;
		var $this = $elem;


		//そのまま要素の中身を書き換える
		//ただしコンバータが入っている場合はコンバートする
		//		if(that.converter) {
		//			var cv = that.converter(model, model, p, model[p]);
		//
		//			if($.isPlainObject(cv)) {
		//				//cv.valueがない場合のチェック
		//
		//				if(cv.isHtml) {
		//					$this.html(cv.value);
		//				}
		//				else {
		//					$this.text(cv.value);
		//				}
		//			}
		//			else {
		//				$this.text(cv); //TODO オブジェクトが子要素の場合を考える。パス表記を渡すようにする？？
		//			}
		//		}
		//		else {
		$this.html(model[p]);
		//		}
	};

	/**
	 * in/out transition関数の仕様：
	 * function transition(elem:DOM, operation:String, callbackWhenCompleted(elem)):elem
	 *   operationはstart/stop/goToEnd/goToStart
	 *   callbackは基となるDataBinderへのコールバック
	 * @param func
	 */
	DataBinder.prototype.setOutTransition = function(func) {
		this.outTransition = func;
	};

	DataBinder.prototype.setInTransition = function(func) {
		this.inTransition = func;
	};


	DataBinder.prototype.applyBinding = function() {
		fwLogger.debug('applyBinding called');
		//call使う必要があるかは要検討
		applyBinding.call(this, this.__controller.view, this.renderRoot, this.templateKey,
				this.collection.getAllObjects());
	};

	function createBinder(controller, modelCollection, renderRoot, template) {
		return new DataBinder(controller, modelCollection, renderRoot, template);
	}

	//=============================
	// Expose to window
	//=============================

	h5.u.obj.expose('h5.core.data', {
		manager: new GlobalEntityManager(),
		createModelCollection: createModelCollection,
		createBinder: createBinder,
	});
})();