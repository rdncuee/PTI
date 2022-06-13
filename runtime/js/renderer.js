/**
 *Build by Wiquid's PCI Generator for TAO platform Free to use
 **/

requirejs.config({
	shim: {
		jqueryui: ['jquery'],
		'./pivottable/pivot': ['jquery', 'jqueryui'],
		'./pivottable/c3_renderers': ['./pivottable/pivot', 'c3'],
	}
});

define([
	'jquery',
	'jqueryui',
	'OAT/util/html',
	'./jquery.csv',
	'moment',
	'./jquery.tablesorter',
	'd3',
	'c3',
	'./pivottable/pivot',
	'./pivottable/c3_renderers',
	'./i18n.translation'
],
	function ($, JQueryUI, html, JQueryCSV, moment, JQueryTablesorter, D3, C3, PivotUI, C3Renderers, i18nTr) {
		'use strict';

		// 言語設定：日本語
		const LANG_JP = 'ja-JP';

		// 言語設定：英語
		const LANG_EN = 'en-US';

		// 散布図は選択不可にする
		const GRAPH_TYPE_SCATTER_PLOT = 'Scatter Chart';

		/**
		 * 除外するAggregator
		 */
		const EXCLUDED_AGGREGATORS = [
			// "Count",
			"Count Unique Values",
			"List Unique Values",
			"Sum",
			// "Integer Sum",
			// "Average",
			"Median",
			"Sample Variance",
			"Sample Standard Deviation",
			// "Minimum",
			// "Maximum",
			"First",
			"Last",
			"Sum over Sum",
			"80% Upper Bound",
			"80% Lower Bound",
			"Sum as Fraction of Total",
			"Sum as Fraction of Rows",
			"Sum as Fraction of Columns",
			"Count as Fraction of Total",
			"Count as Fraction of Rows",
			"Count as Fraction of Columns"
		];

		// 数値を西暦と判断する閾値
		const GUESSING_YEAR = { from: 1600, to: 2200 };

		/**
		 * グラフの色指定
		 *	This list is part of chartjs-plugin-colorschemes (https://nagix.github.io/chartjs-plugin-colorschemes/).
		 *	Copyright (c) 2019 Akihiko Kusanagi (https://github.com/nagix)
		 */
		const DEFAULT_COLOR_SCHEME = ['#9e0142', '#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2']; // Spectral11

		// 基データ
		var rawData = {};
		// 有効なデータ
		var currentData = {};
		// オーサリング中フラグ
		var onAuthoring = false;
		// 操作ログ
		var operationLog = [];

		/**
		 *  値の有無をチェック
		 * 
		 * @param {*} data 
		 * @returns {Boolean}
		 */
		var isset = function (data) {
			if (data === "" || data === null || data === undefined) {
				return false;
			} else {
				return true;
			}
		};

		/**
		 * 操作ログを追加
		 * 
		 * @param {Node} Scontainer 
		 * @param {string} name 
		 * @param {string} operation 
		 * @param {*} value 
		 */
		function putOperationLog(Scontainer, name, operation, value) {
			var datetime = moment().format("YYYY-MM-DD HH:mm:ssZ");
			operationLog.push({
				operation: operation,
				name: name,
				value: value,
				datetime: datetime
			});
			// hiddenフォームに格納しておく
			Scontainer.find('input.operation-log').val(JSON.stringify(operationLog));
		}

		/**
		 * CSVをパースする
		 * 
		 * @param {string} data 
		 * @returns {Array} 要素の配列
		 */
		function parseCsv(data) {
			rawData = {
				'info': [],
				'data': []
			};
			// CSVを配列で読み込む
			var csv = $.csv.toArrays(data);
			// 一行毎の処理
			$(csv).each(function (row_idx) {
				if (this.length <= 0) {
					return true;
				}
				if (row_idx == 0) {
					// 最初の行には、カラム名が格納されている
					$(this).each(function (col_idx) {
						rawData['info'][col_idx] = {
							'index': col_idx,
							'caption': this,
							'isInteger': true,
							'isNumber': true,
							'isYear': true,
							'isString': false,
							'couldBeOptions': false,
							'choices': {}
						};
					});
				} else {
					rawData['data'][row_idx - 1] = {};
					// カラム毎の処理
					$(this).each(function (col_idx) {
						var value = this;
						var caption = rawData['info'][col_idx]['caption'];
						rawData['data'][row_idx - 1][caption] = value;
						if (value.match(/^[+,-]?\d+$/) || value.match(/^[+,-]?\d+(\.\d+)?$/)) {
							// 数値の場合
							value = Number.parseFloat(value);
							rawData['data'][row_idx - 1][caption] = value;
							rawData['info'][col_idx]['isInteger'] &&= Number.isInteger(value);
							rawData['info'][col_idx]['isNumber'] &&= true;
							rawData['info'][col_idx]['isYear'] &&= ((GUESSING_YEAR.from <= value) && (value <= GUESSING_YEAR.to));
							rawData['info'][col_idx]['isString'] ||= false;
						} else {
							// 数値でない場合
							rawData['info'][col_idx]['isInteger'] = false;
							rawData['info'][col_idx]['isNumber'] = false;
							rawData['info'][col_idx]['isYear'] = false;
							rawData['info'][col_idx]['isString'] = true;
						}
						// 選択肢になり得るかどうかチェックするために、同じ値の出現回数をまとめておく
						if (value in rawData['info'][col_idx]['choices']) {
							rawData['info'][col_idx]['choices'][value]++;
						} else {
							rawData['info'][col_idx]['choices'][value] = 1;
						}
					});
					rawData['data'][row_idx - 1]['__ID__'] = row_idx;
				}
			});
			// 件数
			var count = rawData['data'].length;
			// 選択肢になり得るかどうかチェック
			$.each(rawData['info'], function (index, val) {
				var choice_count = Object.keys(val['choices']).length;
				if ((choice_count >= 2) && ((choice_count <= 20) || (choice_count <= (count / 10)))) {
					// 選択肢数が (2以上 && (10以下 || 件数÷10以下)) なら　選択肢になり得る
					rawData['info'][index]['couldBeOptions'] = true;
				} else {
					rawData['info'][index]['couldBeOptions'] = false;
					delete rawData['info'][index]['choices'];
				}
			});
			return rawData;
		}

		/**
		 * 基データテーブルの描画
		 * 
		 * @param {string} id 
		 * @param {Node} Scontainer 
		 * @param {Object} config 
		 */
		function renderRawDataTable(id, Scontainer, config) {
			// 見出しを表示
			Scontainer.find('.rawDataCaption').text(config.rawDataCaption);
			if ((config.csvData === undefined) || (config.csvData === "")) {
				return;
			}
			// 基データテーブル
			var rawDataTable = Scontainer.find('table.table-csv-data');
			// CSVをパースする
			var rawData = parseCsv(config.csvData);
			// tableのヘッダのHTML作成
			var table_header = '<tr>';
			// 初期状態にソートしなおすために、隠しカラムを用意しておきます。
			table_header += '<th style="width: 2rem;" data-sorter="' + ((onAuthoring) ? 'false' : 'text') + '" class="text-center"><span class="icon icon-ol"></span></th>';
			// 各カラムのヘッダ
			$.each(rawData['info'], function (index, val) {
				table_header += '<th data-sorter="' + ((onAuthoring) ? 'false' : ((val.isInteger || val.isNumber) ? 'digit' : 'text')) + '">' + val['caption'] + '</th>';
			});
			table_header += '</tr>';
			rawDataTable.find("thead").append(table_header);
			// tableの中身のHTML作成
			var hidden_flags = '<span class="d-none element-highlighted">9</span><span class="d-none element-deleted">9</span>';
			$.each(rawData['data'], function (row_index, row_data) {
				var table_row = "<tr class='data-table data-table-" + row_data['__ID__'] + "' data-json='" + JSON.stringify(row_data) + "'>";
				table_row += '<td class="text-center td-flags">' + hidden_flags + '<span class="id d-none">' + ('00000' + row_data['__ID__']).slice(-5) + '</span></td>';
				var col_index = 0;
				$.each(row_data, function (col_name, col_data) {
					if (col_name === "__ID__") {
						// __ID__は画面に表示しない
						return false;
					}
					var td_class = '';
					if (rawData['info'][col_index]['isNumber']) {
						// 数値だったら右寄せ
						td_class = 'text-end';
						if (!rawData['info'][col_index]['isYear']) {
							// 西暦でなさそうなら、カンマ区切りで表示
							col_data = col_data.toLocaleString();
						}
					}
					else if (rawData['info'][col_index]['couldBeOptions']) {
						// 中央寄せ
						td_class = 'text-center';
					}
					else {
						// 左寄せ(デフォルト)
						td_class = 'text-start';
					}
					table_row += ('<td class="' + td_class + '">' + col_data + '</td>');
					col_index++;
				});
				table_row += '</tr>';
				rawDataTable.find("tbody").append(table_row);
			});
			// tablesorterの設定
			rawDataTable.tablesorter({
				// widgets        : ['zebra', 'columns'],
				// usNumberFormat : false,
				sortReset: true,
				sortRestart: true,
				// 最初のカラムでソートしておく
				sortList: [[0, 0]]
			});
		}

		/**
		 * 散布図の描画
		 * 
		 * @param {string} id 
		 * @param {Node} Scontainer 
		 * @param {Object} config 
		 * @param {Boolean} addEvent 
		 */
		var PivotTables = {};
		var currentTableConfig = {};
		function renderPivotTable(id, Scontainer, config, addEvent = true) {
			// 見出し設定
			Scontainer.find('.pivotTableCaption').text(config.pivotTableCaption);
			// 言語設定取得
			var i18nLocale = config.i18nLocale;
			// C3用の色設定
			var graphColorScheme = (isset(config.colorScheme)) ? (($.isArray(config.colorScheme)) ? config.colorScheme : JSON.parse(config.colorScheme)) : DEFAULT_COLOR_SCHEME;
			var graphColorSchemeLength = graphColorScheme.length;
			if (!isset(PivotTables[id])) {
				PivotTables[id] = [];
			}
			// 基データテーブルから有効なデータを抽出
			var rawDataTable = Scontainer.find("table.table-csv-data");
			currentData.data = [];
			rawDataTable.find('tbody').children('tr').not('.exclude').each(function () {
				currentData.data.push($(this).data('json'));
			});
			// グラフを描画
			var renderers = [];
			var aggregators = $.pivotUtilities.aggregators;
			$.each(EXCLUDED_AGGREGATORS, function (idx, exc_aggregator) {
				// Aggregatorを除外
				delete (aggregators[exc_aggregator]);
			});
			if ((i18nLocale !== LANG_EN) && (isset(i18nTr.getTranslationTable(i18nLocale)))) {
				// 言語設定
				var i18nTable = i18nTr.getTranslationTable(i18nLocale);
				var nFmt, nFmtInt, nFmtPct, nf, tpl;
				nf = $.pivotUtilities.numberFormat;
				tpl = $.pivotUtilities.aggregatorTemplates;
				nFmt = nf({
					thousandsSep: ",",
					decimalSep: "."
				});
				nFmtInt = nf({
					digitsAfterDecimal: 0,
					thousandsSep: ",",
					decimalSep: "."
				});
				nFmtPct = nf({
					digitsAfterDecimal: 1,
					scaler: 100,
					suffix: "%",
					thousandsSep: ",",
					decimalSep: "."
				});
				$.each(aggregators, function (key, aggregator) {
					delete (aggregators[key]);
					aggregators[i18nTr.getAggregator(i18nLocale, key)] = aggregator;
				});
				$.pivotUtilities.locales[i18nLocale] = {
					localeStrings: i18nTr.getLocaleStrings(i18nLocale),
					renderers: {
						[i18nTr.getRenderer(i18nLocale, 'Table')]: $.pivotUtilities.renderers["Table"],
						[i18nTr.getRenderer(i18nLocale, 'Table Barchart')]: $.pivotUtilities.renderers["Table Barchart"],
						[i18nTr.getRenderer(i18nLocale, 'Heatmap')]: $.pivotUtilities.renderers["Heatmap"],
						[i18nTr.getRenderer(i18nLocale, 'Row Heatmap')]: $.pivotUtilities.renderers["Row Heatmap"],
						[i18nTr.getRenderer(i18nLocale, 'Col Heatmap')]: $.pivotUtilities.renderers["Col Heatmap"],
						// ここからc3
						[i18nTr.getRenderer(i18nLocale, 'Line Chart')]: $.pivotUtilities.c3_renderers["Line Chart"],
						[i18nTr.getRenderer(i18nLocale, 'Horizontal Bar Chart')]: $.pivotUtilities.c3_renderers["Horizontal Bar Chart"],
						[i18nTr.getRenderer(i18nLocale, 'Horizontal Stacked Bar Chart')]: $.pivotUtilities.c3_renderers["Horizontal Stacked Bar Chart"],
						[i18nTr.getRenderer(i18nLocale, 'Bar Chart')]: $.pivotUtilities.c3_renderers["Bar Chart"],
						[i18nTr.getRenderer(i18nLocale, 'Stacked Bar Chart')]: $.pivotUtilities.c3_renderers["Stacked Bar Chart"],
						[i18nTr.getRenderer(i18nLocale, 'Area Chart')]: $.pivotUtilities.c3_renderers["Area Chart"],
						// 散布図は選択不可にする
						// [i18nTr.getRenderer(i18nLocale,'Scatter Chart')]: $.pivotUtilities.c3_renderers["Scatter Chart"]
					}
				}
				renderers = $.pivotUtilities.locales[i18nLocale].renderers;
			}
			else {
				renderers = $.extend($.pivotUtilities.renderers, $.pivotUtilities.c3_renderers);
				// 散布図は除く
				delete (renderers[GRAPH_TYPE_SCATTER_PLOT]);
			}
			// 選択可能な表/グラフ形式に含まれていないrendererは削除する
			$.each(renderers, function (key, renderer) {
				if ($.inArray(key, config.selectableGraphTypes) === -1) {
					delete renderers[key];
				}
			});
			if (isset(config.columnItems)) {
				if (!$.isArray(config.columnItems) && !$.isPlainObject(config.columnItems) && (config.columnItems !== '')) {
					config.columnItems = JSON.parse(config.columnItems);
				}
			}
			else {
				config.columnItems = [];
			}
			if (isset(config.rowItems)) {
				if (!$.isArray(config.rowItems) && !$.isPlainObject(config.rowItems) && (config.rowItems !== '')) {
					config.rowItems = JSON.parse(config.rowItems);
				}
			}
			else {
				config.rowItems = [];
			}
			// グラフの配色(繰り返して50個程用意しておく)
			let graphColorList = [];
			for (var idx = 0; idx < 50; idx++) {
				graphColorList.push(graphColorScheme[idx % graphColorSchemeLength]);
			}
			let isInitialize = {};
			if (!isset(currentTableConfig[id])) {
				currentTableConfig[id] = {};
			}
			$.each([1, 2, 3, 4], function (idx, graph_no) {
				var graphBlock = Scontainer.find("div.block-graph-" + graph_no);
				var PivotTableIndex = idx;
				var vals = [];
				if (config.attribute1 !== '') {
					vals.push(config.attribute1);
					if (config.attribute2 !== '') {
						vals.push(config.attribute2);
					}
				}
				isInitialize[graph_no] = true;
				currentTableConfig[id][graph_no] = {};
				/**
				 *  クロス集計表の描画
				 */
				graphBlock.find('div.div-pivot-table').pivotUI(currentData['data'], {
					rows: config.rowItems,
					cols: config.columnItems,
					vals: vals,
					hiddenAttributes: ['__ID__'],
					aggregators: aggregators,
					aggregatorName: config.aggregator,
					renderers: renderers,
					rendererName: config.graphType,
					rendererOptions: {
						c3: {
							size: { height: 480, width: 660 },
							color: {
								pattern: graphColorList
							}
						}
					},
					onRefresh: function (pivotTableConfig) {
						// 更新イベント
						var table_id = "table" + graph_no;
						var tableSettings = {};
						$.each([
							'cols',	// 横軸(列)
							'colOrder',	// ソート設定
							'rows',	// 縦軸(行)
							'rowOrder',	// ソート設定
							'aggregatorName',	// 集計方法
							'rendererName',	// 描画方法
							'vals',	// 集計のパラメータ
							'exclusions'	// 除外設定
						], function (idx, key) {
							// 変更があった設定のみ記録する
							if (JSON.stringify(currentTableConfig[id][graph_no][key]) != JSON.stringify(pivotTableConfig[key])) {
								tableSettings[key] = pivotTableConfig[key];
							}
						});
						currentTableConfig[id][graph_no] = JSON.parse(JSON.stringify(pivotTableConfig));
						if (isInitialize[graph_no]) {
							// 最初の描画はログを記録しない
							isInitialize[graph_no] = false;
						}
						else if (config.storeOperationLog) {
							// ログを格納
							putOperationLog(Scontainer, table_id, "change", tableSettings);
						}
					}
				},
					true, ((i18nLocale !== LANG_EN) ? i18nLocale : undefined)
				);
				if (onAuthoring) {
					// オーサリング中の場合は最初のクロス集計表だけ描画する
					return false;
				}
			});
			/**
			 * スタイル設定
			 **/
			Scontainer.find('td.pvtAxisContainer span.pvtAttr').addClass('pvtElement');
			Scontainer.find('div.pvtFilterBox button').addClass('btn').addClass('small');
			Scontainer.find('div.pvtFilterBox div.pvtCheckContainer').addClass('pt-3').addClass('pb-0');
			Scontainer.find('div.pvtFilterBox').each(function (idx, e) {
				// [全選択]ボタン
				$(this).find('div.pvtCheckContainer').prev().find('button.btn').eq(0).addClass('btn-info').prepend('<span class="icon icon-checkbox-checked"></span>');
				// [キャンセル]ボタン
				$(this).find('div.pvtCheckContainer').prev().find('button.btn').eq(1).addClass('btn-info').prepend('<span class="icon icon-checkbox"></span>');
				// [適用する]ボタン
				$(this).find('div.pvtCheckContainer').next().find('button.btn').eq(0).addClass('btn-success').prepend('<span class="icon icon-result-ok"></span>');
				// [キャンセル]ボタン
				$(this).find('div.pvtCheckContainer').next().find('button.btn').eq(1).addClass('btn-warning').prepend('<span class="icon icon-result-nok"></span>');
			});
			Scontainer.find('select.pvtAttrDropdown').addClass('mx-1');
			Scontainer.find('select.pvtAggregator>option').addClass('i18n');
			/**
			 * イベントハンドラを設定(初回のみ)
			 */
			if (addEvent) {
				// [リセット]、[グラフの追加]、[グラフの削除] ボタンのイベントハンドラ
				$(function () {
					// [リセット]ボタンのイベントハンドラ
					Scontainer.on('click', 'button.btn-reset-graph', function () {
						// グラフを再描画
						renderPivotTable(id, Scontainer, config, false);
						// 最初のグラフ以外を非表示にする
						Scontainer.find('div.block-graph-2').addClass('d-none');
						Scontainer.find('div.block-graph-3').addClass('d-none');
						Scontainer.find('div.block-graph-4').addClass('d-none');
						// [グラフを削除]ボタンを無効にする
						Scontainer.find('button.btn-remove-graph').addClass('disabled');
						// [グラフを追加]ボタンを有効にする
						Scontainer.find('button.btn-add-graph').removeClass('disabled');
						if (config.storeOperationLog) {
							// 操作ログ格納
							putOperationLog(Scontainer, $(this).attr("name"), 'resetTables', true);
						}
					});
					// [表を追加]ボタンのイベントハンドラ
					Scontainer.on('click', 'button.btn-add-graph', function () {
						var graphAddable = true;
						var graphRemovable = false;
						var targetTableId = '';
						$.each(['.block-graph-2', '.block-graph-3', '.block-graph-4'], function (idx, blockClass) {
							if (Scontainer.find(blockClass).hasClass('d-none')) {
								Scontainer.find(blockClass).removeClass('d-none');
								targetTableId = Scontainer.find(blockClass).attr("id");
								if (blockClass === '.block-graph-4') {
									graphAddable = false;
								}
								else {
									graphRemovable = true;
								}
								return false;
							}
						})
						if (graphRemovable) {
							// [グラフを削除]ボタンを表示する
							Scontainer.find('button.btn-remove-graph').removeClass('disabled');
						}
						if (!graphAddable) {
							// [グラフを追加]ボタンを非表示にする
							Scontainer.find('button.btn-add-graph').addClass('disabled');
						}
						if (config.storeOperationLog) {
							// 操作ログ格納
							putOperationLog(Scontainer, $(this).attr("name"), 'showTable', targetTableId);
						}
					});
					// [表を削除]ボタンのイベントハンドラ
					Scontainer.on('click', 'button.btn-remove-graph', function () {
						var graphAddable = false;
						var graphRemovable = true;
						var targetTableId = '';
						$.each(['.block-graph-4', '.block-graph-3', '.block-graph-2'], function (idx, blockClass) {
							if (!Scontainer.find(blockClass).hasClass('d-none')) {
								Scontainer.find(blockClass).addClass('d-none');
								targetTableId = Scontainer.find(blockClass).attr("id");
								if (blockClass === '.block-graph-2') {
									graphRemovable = false;
								}
								else {
									graphAddable = true;
								}
								return false;
							}
						})
						if (!graphRemovable) {
							// [グラフを削除]ボタンを無効にする
							Scontainer.find('button.btn-remove-graph').addClass('disabled');
						}
						if (graphAddable) {
							// [グラフを追加]ボタンを有効にする
							Scontainer.find('button.btn-add-graph').removeClass('disabled');
						}
						if (config.storeOperationLog) {
							// 操作ログ格納
							putOperationLog(Scontainer, $(this).attr("name"), 'hideTable', targetTableId);
						}
					});
					// pvtAttrDropdownだけは『オーサリング中にクロス集計表への操作を無効にする処理』で無効にできなかったので、動的に無効にする
					Scontainer.on('mousedown', '.pvtUiCell select.pvtAttrDropdown', function () {
						if (onAuthoring) {
							// オーサリング中の場合は、操作を無効にします
							Scontainer.find(".pvtUiCell select").prop("disabled", true);
						}
					});
				});
			}
			// オーサリング中の場合
			if (onAuthoring) {
				// 各種操作を無効にする
				setDisableOperations(id, Scontainer, config);
			}
		}

		/**
		 * クロス集計表、基データ等への操作を無効にする(オーサリング中に使用)
		 * 
		 * @param {string} id 
		 * @param {Node} Scontainer 
		 * @param {Object} config 
		 */
		function setDisableOperations(id, Scontainer, config) {
			// ボタンを無効にする
			Scontainer.find(".pivot-table-setting").prop('disabled', true);
			// 基データのソートを無効にする
			Scontainer.find("table.table-csv-data thead tr th").data('sorter', 'false');
			Scontainer.find("table.table-csv-data").trigger("update");
			// クロス集計表への操作を無効にする
			if (Scontainer.find(".pvtAxisContainer").hasClass('ui-sortable')) {
				Scontainer.find(".pvtAxisContainer").sortable({ 'disabled': true });
				Scontainer.find(".pvtAxisContainer [class^=axis_] span.pvtTriangle").remove();
				Scontainer.find(".pvtAxisContainer li").css('cursor', 'not-allowed');
				Scontainer.find(".pvtUiCell select").prop("disabled", true);
				Scontainer.find(".pvtUiCell a.pvtRowOrder").remove();
				Scontainer.find(".pvtUiCell a.pvtColOrder").remove();
			}
		}

		/**
		 * 画面表示メイン
		 */
		return {
			render: function (id, container, config, assetManager) {
				var Scontainer = $(container);
				// render rich text content in prompt
				html.render(Scontainer.find('.prompt'));
				// promptのタグにdata-html-editable-container="true"があったらオーサリング中と判断します
				onAuthoring = (Scontainer.find('.prompt').data('html-editable-container') == true) ? true : false;
				$('div.prompt').on('DOMSubtreeModified propertychange', function () {
					// 画面描画後にオーサリング中に書き換えられた場合に対応する
					if (onAuthoring) {
						return;
					}
					onAuthoring = (Scontainer.find('.prompt').data('html-editable-container') == true) ? true : false;
					if (onAuthoring) {
						// オーサリング中になったので、各種操作を無効にする
						setDisableOperations(id, Scontainer, config);
					}
				});
				// containerにIDのクラスを追加
				Scontainer.addClass(id);
				// 基データのtableを描画
				renderRawDataTable(id, Scontainer, config);
				// グラフの描画
				renderPivotTable(id, Scontainer, config);
				// i18n翻訳
				Scontainer.find(".i18n").each(function (idx, element) {
					var translated = i18nTr.translate(config.i18nLocale, $(this).text());
					if (translated !== undefined) {
						// 翻訳後の文字列に置き換える
						$(this).text(translated);
					}
				});
			},
			renderRawDataTable: function (id, container, config) {
				// 基データテーブルの描画
				renderRawDataTable(id, $(container), config);
			},
			renderPivotTable: function (id, container, config) {
				// 散布図の描画
				renderPivotTable(id, $(container), config);
			},
		};
	}
);
