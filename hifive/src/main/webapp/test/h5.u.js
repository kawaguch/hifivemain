/*
 * Copyright (C) 2012 NS Solutions Corporation, All Rights Reserved.
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


$(function() {

	var CREATE_NAMESPACE_PASS_REASON = '名前空間オブジェクトを作成したので、undefinedでなくオブジェクトが入っているはず';

	module("h5.u");

	test('名前空間作成 (h5.u.obj.ns)', 3, function() {
		var ns = h5.u.obj.ns('nssol');

		strictEqual(ns, window.nssol, 'ns()の戻り値は作成した名前空間オブジェクト');
		notStrictEqual(window.nssol, undefined, CREATE_NAMESPACE_PASS_REASON);

		window.nssol = undefined;
		strictEqual(window.nssol, undefined, '（クリーンアップ）');
	});

	test('名前空間作成 (h5.u.obj.ns) 異常系', 8, function() {
		try {
			h5.u.obj.ns();
			ok(false, 'h5.u.obj()（引数なし）でエラーが発生しませんでした。');
		} catch (e) {
			ok(true, '引数なし:' + e.message);
		}
		try {
			h5.u.obj.ns(undefined);
			ok(false, 'h5.u.obj(undefined)でエラーが発生しませんでした。');
		} catch (e) {
			ok(true, 'undefined:' + e.message);
		}
		try {
			h5.u.obj.ns(null);
			ok(false, 'h5.u.obj(null)でエラーが発生しませんでした。');
		} catch (e) {
			ok(true, 'null:' + e.message);
		}
		try {
			h5.u.obj.ns(1);
			ok(false, 'h5.u.obj(1)でエラーが発生しませんでした。');
		} catch (e) {
			ok(true, '1:' + e.message);
		}
		try {
			h5.u.obj.ns(true);
			ok(false, 'h5.u.obj(true)でエラーが発生しませんでした。');
		} catch (e) {
			ok(true, 'true:' + e.message);
		}
		try {
			h5.u.obj.ns({});
			ok(false, 'h5.u.obj({})でエラーが発生しませんでした。');
		} catch (e) {
			ok(true, '{}:' + e.message);
		}
		try {
			h5.u.obj.ns([]);
			ok(false, 'h5.u.obj([])でエラーが発生しませんでした。');
		} catch (e) {
			ok(true, '[]:' + e.message);
		}
		try {
			h5.u.obj.ns(['a']);
			ok(false, 'h5.u.obj([\'a\'])でエラーが発生しませんでした。');
		} catch (e) {
			ok(true, '[\'a\']:' + e.message);
		}
	});
	test('名前空間作成-ドット区切りでネスト  (h5.u.obj.ns)', function() {
		var ns = h5.u.obj.ns("jp.co.nssol.sysrdc");

		strictEqual(ns, jp.co.nssol.sysrdc, 'ns()の戻り値は作成した名前空間オブジェクト。ネストしている場合は一番末尾のオブジェクトであること。');
		notStrictEqual(jp, undefined, CREATE_NAMESPACE_PASS_REASON);
		notStrictEqual(jp.co, undefined, CREATE_NAMESPACE_PASS_REASON);
		notStrictEqual(jp.co.nssol, undefined, CREATE_NAMESPACE_PASS_REASON);
		notStrictEqual(jp.co.nssol.sysrdc, undefined, CREATE_NAMESPACE_PASS_REASON);

		window.jp = undefined;
		strictEqual(window.jp, undefined, '（クリーンアップ）');
	});

	test('名前空間作成-パラメータにオブジェクトを指定する (h5.u.obj.ns)', 2, function() {
		var test = {
			dummy: 'DUMMY'
		};

		try {
			h5.u.obj.ns(test);
		} catch (e) {
			ok(e, 'オブジェクトをパラメータに指定するとエラーとして処理されること。');
		}

		strictEqual(window.dummy, undefined, 'ns()のパラメータにString型以外を指定した場合はエラーとして処理されること。');
	});

	test('jp.co.nssol.sysrdcにオブジェクトを公開する (h5.u.obj.ns)', function() {
		var jpStr = 'JP';
		var coStr = 'CO';

		window.jp = {
			dummy: jpStr
		};
		window.jp.co = {
			dummy: coStr
		};

		var sysrdc = h5.u.obj.ns('jp.co.nssol.sysrdc');

		equal(jp.dummy, jpStr);
		equal(jp.co.dummy, coStr);
		strictEqual(sysrdc, jp.co.nssol.sysrdc, 'nsの戻り値と作成された名前空間が同一であること。');
		notStrictEqual(jp.co.nssol.sysrdc, undefined, '存在しない分については新規作成されていること。');
	});

	test('h5test1.exposeにオブジェクトを公開する (h5.u.obj.expose)', 5, function() {
		h5.u.obj.expose('h5test1.expose', {
			test: 1
		});

		ok(window.h5test1.expose, '名前空間が作成され公開されていること。');
		strictEqual(window.h5test1.expose.test, 1, 'window.h5test1.expose.test = 1 であること。');

		try {
			h5.u.obj.expose('h5test1', {
				expose: {
					test2: 1
				}
			});
		} catch (e) {
			ok(e, 'expose()で名前空間を上書きするとエラーが発生すること。');
		}

		strictEqual(window.h5test1.expose.test, 1, 'window.h5test1.expose.test = 1 であること。');
		strictEqual(window.h5test1.expose.test2, undefined,
				'window.h5test1.expose.test2 = undefined であること。');

		window.h5test1 = undefined;
	});

	test('h5test1.expose.testに1を設定後、expose()でtestに10を設定する (h5.u.obj.expose)', 3, function() {
		h5.u.obj.expose('h5test1.expose', {
			test: 1
		});

		strictEqual(window.h5test1.expose.test, 1, 'window.h5test1.expose.test = 1 であること。');

		try {
			h5.u.obj.expose('h5test1.expose', {
				test: 10
			});
		} catch (e) {
			ok(e, 'expose()で名前空間を上書きするとエラーが発生すること。');
		}

		strictEqual(window.h5test1.expose.test, 1, 'window.h5test1.expose.test = 10 に更新されること。');
		window.h5test1 = undefined;
	});

	test('expose()の第一引数に、String以外のオブジェクトを指定する。 (h5.u.obj.expose)', 1, function() {
		function Hoge() {
		//
		}
		Hoge.prototype.test = 10;

		window.h5test1 = new Hoge();

		try {
			h5.u.obj.expose(window.h5test1, {
				test: 2
			});
		} catch (e) {
			ok(e, 'expose()にString以外を指定するとエラーが発生すること。');
		}

		window.h5test1 = undefined;
	});

	test('html文字列をエスケープする(h5.u.str.espaceHtml)', function() {
		var str = '<div>hogehoge<span>TEST</span>hoge.!</script>';
		var escapeStr = h5.u.str.escapeHtml(str);
		$('#qunit-fixture').append(escapeStr);
		strictEqual(escapeStr,
				'&lt;div&gt;hogehoge&lt;span&gt;TEST&lt;/span&gt;hoge.!&lt;/script&gt;',
				'エスケープされること。');
		strictEqual(h5.u.str.escapeHtml(0), 0, '文字列のみエスケープされること。');
		strictEqual(h5.u.str.escapeHtml(undefined), undefined, '文字列のみエスケープされること。');
		var obj = {
			aaa: 10
		};
		strictEqual(h5.u.str.escapeHtml(obj), obj, '文字列のみエスケープされること。');
	});

	test('文字列のプレフィックスを判定する (h5.u.str.startsWith)', function() {
		var str = "abcdefg";
		var prefix1 = "abc";
		var prefix2 = "abe";

		strictEqual(h5.u.str.startsWith(str, prefix1), true, '文字列のプレフィックスが abc であること。');
		notStrictEqual(h5.u.str.startsWith(str, prefix2), true, '文字列のプレフィックスが abe ではないこと。');
	});

	test('文字列のサフィックスをを判定する (h5.u.str.endsWith)', function() {
		var str = "abcdefg";
		var suffix1 = "efg";
		var suffix2 = "efa";

		strictEqual(h5.u.str.endsWith(str, suffix1), true, '文字列のサフィックスが efg であること。');
		notStrictEqual(h5.u.str.endsWith(str, suffix2), true, '文字列のサフィックスが efg 指定したものではないこと。');
	});

	test('スクリプトのロード(h5.u.loadScript)', function() {
		h5.u.loadScript('data/sample.js');

		ok(window.h5samplefunc, 'スクリプトがロードできたか');
		window.h5samplefunc = undefined;
		h5.u.loadScript('data/sample.js');
		ok(!window.h5samplefunc, '2重読み込みの防止はされていること。');
		h5.u.loadScript('data/sample.js', {
			force: true
		});
		ok(window.h5samplefunc(), 'forceオプションは有効か');
		window.h5samplefunc = undefined;
	});

	test('スクリプトの同期ロード(h5.u.loadScript)', function() {
		h5.u.loadScript(['data/test1.js', 'data/test2.js', 'data/test3.js'], {
			force: true
		});

		ok(window.test1.a, 'スクリプトが同期的にロードされたか1');
		ok(window.test2.b, 'スクリプトが同期的にロードされたか2');
		ok(window.test3.c, 'スクリプトが同期的にロードされたか3');

		strictEqual(window.test1, window.test2.test1, 'スクリプトはシーケンシャルに読み込まれたか1');
		strictEqual(window.test1, window.test3.test1, 'スクリプトはシーケンシャルに読み込まれたか2');
		strictEqual(window.test2, window.test3.test2, 'スクリプトはシーケンシャルに読み込まれたか3');

		window.test1 = undefined;
		window.test2 = undefined;
		window.test3 = undefined;
	});

	asyncTest('スクリプトの非同期(parallel=true)ロード(h5.u.loadScript)', function() {
		var promise = h5.u.loadScript(['data/test1.js', 'data/test2.js', 'data/test3.js'], {
			async: true,
			force: true,
			parallel: true
		});

		ok(!window.test1, 'スクリプトが非同期にロードされたか1');
		ok(!window.test2, 'スクリプトが非同期にロードされたか2');
		ok(!window.test3, 'スクリプトが非同期にロードされたか3');

		promise.done(function() {
			start();

			ok(window.test1.a, 'スクリプトが非同期にロードされたか4');
			ok(window.test2.b, 'スクリプトが非同期にロードされたか5');
			ok(window.test3.c, 'スクリプトが非同期にロードされたか6');

			window.test1 = undefined;
			window.test2 = undefined;
			window.test3 = undefined;
		});

	});

	asyncTest('スクリプトの非同期(parallel=false)ロード(h5.u.loadScript)', function() {
		var promise = h5.u.loadScript(['data/test1.js', 'data/test2.js', 'data/test3.js'], {
			async: true,
			force: true,
			parallel: false
		});

		ok(!window.test1, 'スクリプトが非同期にロードされたか1');
		ok(!window.test2, 'スクリプトが非同期にロードされたか2');
		ok(!window.test3, 'スクリプトが非同期にロードされたか3');

		promise.done(function() {
			start();

			ok(window.test1.a, 'スクリプトが非同期にロードされたか4');
			ok(window.test2.b, 'スクリプトが非同期にロードされたか5');
			ok(window.test3.c, 'スクリプトが非同期にロードされたか6');

			strictEqual(window.test1, window.test2.test1, 'スクリプトはシーケンシャルに読み込まれたか1');
			strictEqual(window.test1, window.test3.test1, 'スクリプトはシーケンシャルに読み込まれたか2');
			strictEqual(window.test2, window.test3.test2, 'スクリプトはシーケンシャルに読み込まれたか3');

			window.test1 = undefined;
			window.test2 = undefined;
			window.test3 = undefined;
		});

	});

	test('文字列のフォーマット(h5.u.str.format)', function() {
		var str = 'このテストは、{0}によって実行されています。{1}するはず、です。{0}いいですね。';
		strictEqual(h5.u.str.format(str, 'qUnit', '成功'),
				'このテストは、qUnitによって実行されています。成功するはず、です。qUnitいいですね。', '文字列がフォーマットされること。');

		strictEqual('', h5.u.str.format(null, 1), 'nullを渡すと空文字列が返るか');
		strictEqual('', h5.u.str.format(undefined), 'undefinedを渡すと空文字列が返るか');
		strictEqual('nullが渡されました。', h5.u.str.format('{0}が渡されました。', null),
				'パラメータとしてnullを渡すと"null"という文字列になっているか');
		strictEqual('undefinedが渡されました。', h5.u.str.format('{0}が渡されました。', undefined),
				'パラメータとしてundefinedを渡すと"undefined"という文字列になっているか');
	});

	test('argumentsを配列に変換(h5.u.obj.argsToArray)', function() {
		var func = function(a, b, c, d) {
			return h5.u.obj.argsToArray(arguments);
		};
		var result = func(1, 2, 3, 4);
		strictEqual(result instanceof Array, true, 'Array型であること。');
		deepEqual(result, [1, 2, 3, 4], 'argumentsオブジェクトが配列に変換されていること。');
	});

	test('window.hoge 配下のオブジェクトを、名前空間の文字列を指定して取得。(h5.u.obj.getByPath)', function() {
		window.hoge = {
			hogehoge: {
				test: 10
			},
			hogehoge2: null,
			hogehoge3: {

			}
		};

		var objs = h5.u.obj.getByPath('hoge.hogehoge.test');
		same(objs, window.hoge.hogehoge.test, '10を取得できること。');
		objs = h5.u.obj.getByPath('hoge.hogehoge2');
		same(objs, window.hoge.hogehoge2, 'nullが取得できること。');
		objs = h5.u.obj.getByPath('hoge');
		same(objs, window.hoge, 'window.hogeオブジェクトが取得できること。');
		objs = h5.u.obj.getByPath('hoge.hogehoge4');
		same(objs, undefined, '指定した名前空間に何も存在しないので、undefinedが取得できること。');
		objs = h5.u.obj.getByPath('hoge.hogehoge4.hoge2');
		same(objs, undefined, '指定した名前空間に何も存在しないので、undefinedが取得できること。');
		objs = h5.u.obj.getByPath('hoge2');
		same(objs, undefined, '指定した名前空間に何も存在しないので、undefinedが取得できること。');
		raises(function() {
			h5.u.obj.getByPath(window.hoge);
		}, '文字列以外をパラメータに指定すると例外が発生すること。');
	});

	test('serialize/deserialize 文字列', 2, function() {
		var strs = ["helloWorld", 'o{"str1":"\"string1\""}'];
		for ( var i = 0, len = strs.length; i < len; i++) {
			var str = strs[i];
			var serialized = h5.u.obj.serialize(str, true);
			var deserialized = h5.u.obj.deserialize(serialized);
			same(deserialized, str, "シリアライズしてデシリアライズした文字列が元の文字列と同じ");
		}
	});

	test('serialize/deserialize 数字', 6, function() {
		var nums = [0, 1, -1.123, NaN, Infinity, -Infinity];
		for ( var i = 0, len = nums.length; i < len; i++) {
			var num = nums[i];
			var serialized = h5.u.obj.serialize(num);
			var deserialized = h5.u.obj.deserialize(serialized);
			same(deserialized, num, "シリアライズしてデシリアライズした数値が元の数値と同じ");
		}
	});

	test('serialize/deserialize 真偽値', 2, function() {
		var nums = [true, false];
		for ( var i = 0, len = nums.length; i < len; i++) {
			var num = nums[i];
			var serialized = h5.u.obj.serialize(num);
			var deserialized = h5.u.obj.deserialize(serialized);
			same(deserialized, num, "シリアライズしてデシリアライズした数値が元の数値と同じ");
		}
	});

	test('serialize/deserialize 日付', 2, function() {
		var dates = [new Date(0), new Date()];
		for ( var i = 0, len = dates.length; i < len; i++) {
			var date = dates[i];
			var serialized = h5.u.obj.serialize(date);
			var deserialized = h5.u.obj.deserialize(serialized);
			same(deserialized, date, "シリアライズしてデシリアライズしたDateオブジェクトが元のDateオブジェクトと同じ。"
					+ deserialized.getTime());
		}
	});

	test('serialize/deserialize 正規表現', 6, function() {
		var regExps = [/hello/, /^o*(.*)[a|b]{0,}?$/, /\\/g, /a|b/i, /x/gi, /\/\\\//img];
		for ( var i = 0, len = regExps.length; i < len; i++) {
			var regExp = regExps[i];
			var serialized = h5.u.obj.serialize(regExp);
			var deserialized = h5.u.obj.deserialize(serialized);
			same(deserialized, regExp, "シリアライズしてデシリアライズした正規表現が元の正規表現と同じ。" + regExp.toString());
		}
	});

	test('serialize/deserialize 配列', 3, function() {
		var arrays = [[1, 2, null, undefined, 'a[b]c,[][', new Date(), /ar*ay/i], [], ['@{}']];
		for ( var i = 0, len = arrays.length; i < len; i++) {
			var array = arrays[i];
			var serialized = h5.u.obj.serialize(array);
			var deserialized = h5.u.obj.deserialize(serialized);
			same(deserialized, array, "シリアライズしてデシリアライズした配列が元の配列と同じ。" + array.toString());
		}
	});

	test('serialize/deserialize 多次元配列', 1, function() {
		var arrays = [[[1, 2, 3], [4, '\\5\\"', ['\\\"6\\\"', [7, '\\\"8\\\"']]], 9]];
		for ( var i = 0, len = arrays.length; i < len; i++) {
			var array = arrays[i];
			var serialized = h5.u.obj.serialize(array);
			var deserialized = h5.u.obj.deserialize(serialized);
			same(deserialized, array, "シリアライズしてデシリアライズした配列が元の配列と同じ。" + array.toString());
		}
	});

	test('serialize/deserialize オブジェクトの配列', 2, function() {
		var arrays = [[{
			a: 'A',
			b: 'B'
		}, {
			c: 'C',
			d: 'D'
		}], [{
			a: 'A',
			b: 'B'
		}, [1, [{
			c: 'C',
			d: 'D'
		}, 3]], {
			e: 'E',
			f: 'F'
		}]];
		for ( var i = 0, len = arrays.length; i < len; i++) {
			var array = arrays[i];
			var serialized = h5.u.obj.serialize(array);
			var deserialized = h5.u.obj.deserialize(serialized);
			same(deserialized, array, "シリアライズしてデシリアライズした配列が元の配列と同じ。" + array.toString());
		}
	});

	test('serialize/deserialize 連想配列', 22, function() {
		var array1 = [];
		array1['key'] = 'value';

		var array2 = [0, , 2, undefined, 4];
		// IE6用 代入式でundefinedを入れないとhasOwnPropertyがtrueの要素にならない。
		array2[3] = undefined;

		array2['a'] = 'A';
		array2['b'] = 'B';
		array2['u'] = undefined;
		var b = [];
		b['aa'] = 'AA';
		array2['obj'] = {
			a: 'A',
			b: b
		};

		var arrays = [array1, array2];
		for ( var i = 0, len = arrays.length; i < len; i++) {
			var array = arrays[i];
			var serialized = h5.u.obj.serialize(array);
			var deserialized = h5.u.obj.deserialize(serialized);
			same(deserialized, array, "シリアライズしてデシリアライズした配列が元の配列と同じ。" + array.toString());
			same(deserialized.length, array.length, "シリアライズしてデシリアライズした配列のlengthが元の配列と同じ。");
			for ( var key in array) {
				var compFunction = strictEqual;
				if (typeof array[key] === 'object') {
					compFunction = same;
				}
				compFunction(deserialized[key], array[key], "シリアライズしてデシリアライズした配列の値が各要素で同じ。 key = "
						+ key);
				compFunction(deserialized.hasOwnProperty(key), array.hasOwnProperty(key),
						"シリアライズしてデシリアライズした配列のhasOwnProperty()の値が各要素で同じ。 key = " + key);
			}
		}
	});


	test('serialize/deserialize プリミティブラッパー', 16,
			function() {
				var primitives = [new String("hello"), new String(), new Number(123),
						new Number('NaN'), new Number('Infinity'), new Number('-Infinity'),
						new Boolean(true), new Boolean(false)];
				for ( var i = 0, len = primitives.length; i < len; i++) {
					var primitive = primitives[i];
					var serialized = h5.u.obj.serialize(primitive);
					var deserialized = h5.u.obj.deserialize(serialized);
					strictEqual(typeof deserialized, 'object', 'デシリアライズした結果がプリミティブ型');
					// NaN === NaN ではないため、NaNの時は二つともNaNかどうか調べる
					if (isNaN(deserialized.valueOf())) {
						ok(isNaN(primitive.valueOf()), "シリアライズしてデシリアライズした値が元の値と同じ。"
								+ primitive.toString());
						continue;
					}
					strictEqual(deserialized.valueOf(), primitive.valueOf(),
							"シリアライズしてデシリアライズした値が元の値と同じ。" + primitive.toString());
				}
			});

	test('serialize/deserialize null/undefined', 2, function() {
		var exps = [null, undefined];
		// IE6用 代入式でundefinedを入れないとhasOwnPropertyがtrueの要素にならない。
		exps[1] = undefined;

		for ( var i = 0, len = exps.length; i < len; i++) {
			var exp = exps[i];
			var serialized = h5.u.obj.serialize(exp);
			var deserialized = h5.u.obj.deserialize(serialized);
			strictEqual(deserialized, exp, "シリアライズしてデシリアライズしたnull/undefinedが元と同じ。" + exp);
		}
	});

	test('serialize/deserialize オブジェクト：文字列、数値、日付、正規表現、null、undefined、配列、プリミティブ型各種', function() {
		var obj = {
			str: "string",
			num: 456,
			date: new Date(),
			ary: [0, 1, 2],
			ary2: [3, [4, 5], 6],
			reg: /[a-z]*/,
			nul: null,
			und: undefined,
			NUM: new Number(123),
			BOL: new Boolean(true),
			STR: new String('STRING')
		};
		var serialized = h5.u.obj.serialize(obj);
		var deserialized = h5.u.obj.deserialize(serialized);
		strictEqual(typeof deserialized.STR, typeof obj.STR,
				'元のオブジェクトの中身のプリミティブ型Stringの要素と、シリアライズしてデシリアライズした同要素の型が同じ。');
		strictEqual(deserialized.STR.valueOf(), obj.STR.valueOf(),
				'元のオブジェクトの中身のプリミティブ型Stringの要素と、シリアライズしてデシリアライズした同要素の値が同じ。');
		strictEqual(typeof deserialized.NUM, typeof obj.NUM,
				'元のオブジェクトの中身のプリミティブ型Numberの要素と、シリアライズしてデシリアライズした同要素の型が同じ。');
		strictEqual(deserialized.NUM.valueOf(), obj.NUM.valueOf(),
				'元のオブジェクトの中身のプリミティブ型Numberの要素と、シリアライズしてデシリアライズした同要素の値が同じ。');
		strictEqual(typeof deserialized.NUM, typeof obj.NUM,
				'元のオブジェクトの中身のプリミティブ型Booleanの要素と、シリアライズしてデシリアライズした同要素の型が同じ。');
		strictEqual(deserialized.BOL.valueOf(), obj.BOL.valueOf(),
				'元のオブジェクトの中身のプリミティブ型Booleanの要素と、シリアライズしてデシリアライズした同要素の値が同じ。');

		delete obj.STR;
		delete deserialized.STR;
		delete obj.NUM;
		delete deserialized.NUM;
		delete obj.BOL;
		delete deserialized.BOL;

		same(deserialized, obj, "プリミティブ型を除いて、シリアライズしてデシリアライズしたオブジェクトが元のオブジェクトと同じ");
	});

	test('serialize/deserialize オブジェクトの入れ子', 2, function() {
		var obj1 = {
			obj2: {},
			obj3: {
				obj: {}
			},
			obj4: {}
		};
		var obj2 = {
			str1: "string",
			num1: 147,
			date1: new Date(),
			reg1: /[a-z]*/,
			nul1: null,
			und1: undefined,
			ary1: [1, 2],
			obj2: {
				str2: "string2\\\"\\",
				num2: 258,
				date2: new Date(),
				reg2: /[0-9]*/,
				nul2: null,
				und2: undefined,
				ary2: [3, [4, [5, 6], {
					a: 'A',
					b: ['B', {
						c: 'C'
					}]
				}], 8],
				obj3: {
					str3: "\\\"string3\\\"\\",
					num3: 369,
					date3: new Date(),
					reg3: /ABC|DEF|GHI/,
					nul3: null,
					und3: undefined,
					ary3: [3, [4, [5, 6], 7], 8]
				}
			}
		};
		var hashArray1 = [0, , , 3, undefined];
		// IE6用 代入式でundefinedを入れないとhasOwnPropertyがtrueの要素にならない。
		hashArray1[4] = undefined;

		hashArray1['key'] = {
			a: 'a',
			b: []
		};

		obj2.obj2.hashArray = hashArray1;
		var objs = [obj1, obj2];
		for ( var i = 0, len = objs.length; i < len; i++) {
			var obj = objs[i];
			var serialized = h5.u.obj.serialize(obj);
			var deserialized = h5.u.obj.deserialize(serialized);
			same(deserialized, obj, "シリアライズしてデシリアライズしたオブジェクトが元のオブジェクトと同じ");
		}
	});

	test('serialize/deserialize オブジェクト/配列/連想配列：循環参照でエラーが出ること', function() {
		var a = {};
		a.obj = a;

		var b = {};
		b.obj = {};
		b.obj.obj = b;

		var c = {};
		c.obj1 = {};
		c.obj2 = {};
		c.obj1.obj1 = {};
		c.obj1.obj2 = {};
		c.obj1.obj1.obj1 = {};
		c.obj1.obj1.obj2 = {};
		c.obj1.obj2.obj1 = {};
		c.obj1.obj2.obj2 = {};
		c.obj1.obj2.obj1 = c.obj1;

		var d = [];
		d.push(d);

		var e = [];
		e[5] = e;

		var f = [];
		f.push([], []);
		f[0].push([], []);
		f[0][0].push([], []);
		f[0][1].push([], []);
		f[0][1][1] = f[0];

		var g = [];
		g['roop'] = g;

		var h = [];
		h['roop'] = f;

		var objs = [a, b, c, d, e, f, g, h];
		for ( var i = 0, len = objs.length; i < len; i++) {
			var obj = objs[i];
			try {
				var serialized = h5.u.obj.serialize(obj);
				ok(false, 'エラーが投げられていません。' + serialized);
			} catch (e) {
				ok(true, "エラーメッセージ：" + e.message);
			}
		}
	});

	test('serialize/deserialize オブジェクト/配列/連想配列：同じインスタンスを内部に重複して持つが、循環参照はしていない時にエラーが出ないこと。', 6,
			function() {
				var a = {};
				a.obj1 = {};
				a.obj2 = {};
				a.obj2.obj1 = a.obj1;

				var b = {};
				b.obj1 = {};
				b.obj2 = {};
				b.obj1.obj1 = {};
				b.obj1.obj2 = {};
				b.obj1.obj1.obj1 = {};
				b.obj1.obj1.obj2 = {};
				b.obj1.obj2.obj1 = {};
				b.obj1.obj2.obj2 = {};
				b.obj1.obj2.obj1 = b.obj2;
				b.obj1.obj2.obj1 = b.obj1.obj1;

				var c = [];
				c[1] = a;
				c['key'] = b;

				var d = [];
				d['key1'] = {};
				d['key2'] = d['key1'];

				var e = [];
				e.push([], []);
				e[0].push([], []);
				e[0][0].push([], []);
				e[0][1].push([], []);
				e[0][1][1] = e[1];

				var f = [a, b, c, d, e];

				var objs = [a, b, c, d, e, f];
				for ( var i = 0, len = objs.length; i < len; i++) {
					var obj = objs[i];
					try {
						var serialized = h5.u.obj.serialize(obj);
						var deserialized = h5.u.obj.deserialize(serialized);
						same(deserialized, obj, "シリアライズしてデシリアライズした配列が元の配列と同じ。");
					} catch (e) {
						ok(false, "エラーメッセージ：" + e.message);
					}
				}
			});

	test(
			'serialize/deserialize 値としてのundefinedと、未定義のundefinedを含む配列の各要素のhasOwnProperty()の結果が一致すること。',
			10, function() {
				// [,]の長さが1でないとき、最後のカンマを1つ減らす。(IE8以前とそれ以外でテストの数が変わらないようにするため)。
				var array = ([, ].length === 1) ? [0, , 2, undefined, 4, , undefined, , ] : [0, ,
						2, undefined, 4, , undefined, ];

				// IE6用 代入式でundefinedを入れないとhasOwnPropertyがtrueの要素にならない。
				array[3] = undefined;
				array[6] = undefined;

				var serialized = h5.u.obj.serialize(array);
				var deserialized = h5.u.obj.deserialize(serialized);
				same(deserialized, array, "シリアライズしてデシリアライズした配列が元の配列と同じ。" + array.toString());
				same(deserialized.length, array.length, "シリアライズしてデシリアライズした配列のlengthが元の配列と同じ。"
						+ array.length);
				for ( var i = 0, l = array.length; i < l; i++) {
					strictEqual(deserialized.hasOwnProperty(i), array.hasOwnProperty(i),
							"シリアライズしてデシリアライズした配列のhasOwnProperty()の値が各要素で同じ。" + i);
				}
			});

	test('serialize/deserialize プロトタイプの中身はシリアライズ化されないこと', function() {
		var P = function() {};
		P.prototype = {
			b: 'b',
			c: function() {
				console.log(this);
			}
		};
		var obj = new P();
		obj.a = 'a';
		var serialized = h5.u.obj.serialize(obj);
		var deserialized = h5.u.obj.deserialize(serialized);
		var hasOwnObj = {};
		for ( var p in obj) {
			if (obj.hasOwnProperty(p)) {
				hasOwnObj[p] = obj[p];
			}
		}
		same(deserialized, hasOwnObj, "シリアライズしてデシリアライズしたオブジェクトが元のオブジェクトと同じ");
	});

	test('serialize/deserialize 関数をserializeするとエラーが出ること。', function() {
		var func = function() {
			return 'hoge';
		};
		try {
			var serialized = h5.u.obj.serialize(func);
			ok(false, 'エラーが投げられていません。' + serialized);
		} catch (e) {
			ok(true, e.message);
		}
	});

	test('serialize/deserialize シリアライズしたバージョンの違う文字列をデシリアライズできないこと。', function() {
		var serialized = "2|shello";
		try {
			h5.u.obj.deserialize(serialized);
			ok(false, 'エラーが投げられていません。' + serialized);
		} catch (e) {
			ok(true, e.message);
		}
	});

	test('serialize/deserialize 関数を含むオブジェクト、配列、連想配列で、関数を持つプロパティは無視されること。', function() {
		var hash = [1, 2];
		hash['f'] = function() {};
		hash['key'] = 'value';
		var objs = [{
			a: 'A',
			f: function() {},
			b: 'B'
		}, [0, function() {}, , function() {}], hash];
		var hashNoFunction = [1, 2];
		hashNoFunction['key'] = 'value';
		var noFuncArray = [0, undefined, , undefined];
		// IE6用 undefinedを代入式で代入しないと値としてのundefinedにならないため
		noFuncArray[1] = undefined;
		noFuncArray[3] = undefined;


		var objsNoFunction = [{
			a: 'A',
			b: 'B'
		}, noFuncArray, hashNoFunction];

		for ( var i = 0, len = objs.length; i < len; i++) {
			var obj = objs[i];
			var objNoFunction = objsNoFunction[i];
			var serialized = h5.u.obj.serialize(obj);
			var deserialized = h5.u.obj.deserialize(serialized);
			same(deserialized, objNoFunction, "シリアライズしてデシリアライズしたオブジェクトが元のオブジェクトと同じ");
			for ( var key in deserialized) {
				strictEqual(deserialized.hasOwnProperty(key), objNoFunction.hasOwnProperty(key),
						"シリアライズしてデシリアライズした配列のhasOwnProperty()の値が各要素で同じ。key = " + key);
			}
		}
	});

});