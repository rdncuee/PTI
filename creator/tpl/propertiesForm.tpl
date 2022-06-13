<!-- StyleEditorのHTML -->
<div class="PivotTable">
	<!-- CSVファイルのフォーム -->
	<div class="panel">
		<label for="csv_file" class="csv-file-label i18n">CSV file</label>
		<input type="file" class="csv-select-form d-none" id="csvFile" name="csvFile" accept="text/csv" />
		<label for="csvFile" role="button" class="small btn-info d-block mx-3">
			<span class="icon-folder-open p-0 m-0 text-white"></span>
			<span class="i18n">Select file</span>
		</label>
		<input type="hidden" class="csv-raw-data" id="csvData" name="csvData" value='{{csvData}}' />
		<input type="hidden" class="csv-column-names" id="csvColumnNames" name="csvColumnNames"
			value='{{csvColumnNames}}' />
		<input type="hidden" class="i18n-locale" id="i18nLocale" name="i18nLocale" value='{{i18nLocale}}' />
	</div>
	<script>
		/**
		 * 文字コードチェック関数
		 * https://github.com/hcodes/isutf8 
		 * Author: Denis Seleznev
		/*
		   https://tools.ietf.org/html/rfc3629
		   UTF8-char = UTF8-1 / UTF8-2 / UTF8-3 / UTF8-4
		   UTF8-1    = %x00-7F
		   UTF8-2    = %xC2-DF UTF8-tail
		   UTF8-3    = %xE0 %xA0-BF UTF8-tail
					   %xE1-EC 2( UTF8-tail )
					   %xED %x80-9F UTF8-tail
					   %xEE-EF 2( UTF8-tail )
		   UTF8-4    = %xF0 %x90-BF 2( UTF8-tail )
					   %xF1-F3 3( UTF8-tail )
					   %xF4 %x80-8F 2( UTF8-tail )
		   UTF8-tail = %x80-BF
		*/
		/**
		 * Check if a Node.js Buffer or Uint8Array is UTF-8.
		 */
		function isUtf8(buf) {
			if (!buf) {
				return false;
			}
			var i = 0;
			var len = buf.length;
			while (i < len) {
				// UTF8-1 = %x00-7F
				if (buf[i] <= 0x7F) {
					i++;
					continue;
				}
				// UTF8-2 = %xC2-DF UTF8-tail
				if (buf[i] >= 0xC2 && buf[i] <= 0xDF) {
					// if(buf[i + 1] >= 0x80 && buf[i + 1] <= 0xBF) {
					if (buf[i + 1] >> 6 === 2) {
						i += 2;
						continue;
					}
					else {
						return false;
					}
				}
				// UTF8-3 = %xE0 %xA0-BF UTF8-tail
				// UTF8-3 = %xED %x80-9F UTF8-tail
				if (((buf[i] === 0xE0 && buf[i + 1] >= 0xA0 && buf[i + 1] <= 0xBF) ||
					(buf[i] === 0xED && buf[i + 1] >= 0x80 && buf[i + 1] <= 0x9F)) && buf[i + 2] >> 6 === 2) {
					i += 3;
					continue;
				}
				// UTF8-3 = %xE1-EC 2( UTF8-tail )
				// UTF8-3 = %xEE-EF 2( UTF8-tail )
				if (((buf[i] >= 0xE1 && buf[i] <= 0xEC) ||
					(buf[i] >= 0xEE && buf[i] <= 0xEF)) &&
					buf[i + 1] >> 6 === 2 &&
					buf[i + 2] >> 6 === 2) {
					i += 3;
					continue;
				}
				// UTF8-4 = %xF0 %x90-BF 2( UTF8-tail )
				//          %xF1-F3 3( UTF8-tail )
				//          %xF4 %x80-8F 2( UTF8-tail )
				if (((buf[i] === 0xF0 && buf[i + 1] >= 0x90 && buf[i + 1] <= 0xBF) ||
					(buf[i] >= 0xF1 && buf[i] <= 0xF3 && buf[i + 1] >> 6 === 2) ||
					(buf[i] === 0xF4 && buf[i + 1] >= 0x80 && buf[i + 1] <= 0x8F)) &&
					buf[i + 2] >> 6 === 2 &&
					buf[i + 3] >> 6 === 2) {
					i += 4;
					continue;
				}
				return false;
			}
			return true;
		}
		// FileReaderを作成
		var fileReader = new FileReader();
		// FileReaderのloadイベントハンドラ
		fileReader.addEventListener('load', function () {
			//ファイルの中身をarrayに格納する
			var array = new Uint8Array(this.result);
			var encodingUTF8 = isUtf8(array);
			var utf8String = '';
			// 文字コードのチェック
			if (encodingUTF8) {
				var text_decoder = new TextDecoder("utf-8");
				utf8String = text_decoder.decode(array);
			}
			else {
				alert("CSVファイルの文字コードがUTF-8ではありません。");
				return false;
			}
			// hiddenの値にファイルの中身を格納
			$('#csvData').val(utf8String).change();
		});
		// csvファイル選択時のイベントハンドラ
		$('input.csv-select-form').change(function (event) {
			console.log("CSVファイルが変更されました。");
			var files = event.target.files; // FileList object
			// 最初のファイルだけ処理する
			var f = files[0];
			// ファイル名
			var file_name = f.name;
			console.log("ファイル名:" + file_name);
			// ファイルの内容を配列に読み込む
			fileReader.readAsArrayBuffer(f);
		});
	</script>
	<!-- 基データラベル -->
	<div class="panel">
		<label for="rawDataCaptionAgent" class="has-icon i18n">{{__ "Raw data caption"}}</label>
		<input type="text" class="rawDataCaptionAgent" id="rawDataCaptionAgent" name="rawDataCaptionAgent"
			value="{{rawDataCaption}}" />
		<input type="hidden" class="rawDataCaption" id="rawDataCaption" name="rawDataCaption"
			value='{{rawDataCaption}}' />
		<script>
			// 基データラベルの更新イベントハンドラ
			// type=text のフォームをそのまま使用すると、KeyDown,KeyUpで更新イベント処理が動きすぎるので、
			// 仲介のフォームへの入力が終わったら type=hidden のフォームに値を移して change イベントをトリガーするように実装しています。
			$('input.rawDataCaptionAgent').change(function (event) {
				var rawDataCaption = $(this).val();
				$('input.rawDataCaption').val(rawDataCaption).change();
			});
		</script>
	</div>
	<!-- クロス集計表ラベル -->
	<div class="panel">
		<label for="pivotTableCaptionAgent" class="has-icon i18n">{{__ "Pivot Table caption"}}</label>
		<input type="text" class="pivotTableCaptionAgent" id="pivotTableCaptionAgent" name="pivotTableCaptionAgent"
			value="{{pivotTableCaption}}" />
		<input type="hidden" class="pivotTableCaption" id="pivotTableCaption" name="pivotTableCaption"
			value='{{pivotTableCaption}}' />
		<script>
			// クロス集計表ラベルの更新イベントハンドラ
			$('input.pivotTableCaptionAgent').change(function (event) {
				var pivotTableCaption = $(this).val();
				$('input.pivotTableCaption').val(pivotTableCaption).change();
			});
		</script>
	</div>
	<!-- 初期設定 列要素 -->
	<div class="panel">
		<label for="columnItems" class="i18n">{{__ "Column items"}}</label>
		<select name="columnItems" id="columnItems" data-has-search="false" size="8" multiple>
			{{#each columnItemsList}}
			<option value="{{@key}}" class="{{#if selected}}highlight{{/if}}" {{#if selected}}selected{{/if}} {{#if
				disabled}}disabled{{/if}}>{{label}}</option>
			{{/each}}
		</select>
		<script>
			$(document).ready(function () {
				$('select#columnItems').select2();
			});
		</script>
	</div>
	<!-- 初期設定 行要素 -->
	<div class="panel">
		<label for="rowItems" class="i18n">{{__ "Row items"}}</label>
		<select name="rowItems" id="rowItems" data-has-search="false" size="8" multiple>
			{{#each rowItemsList}}
			<option value="{{@key}}" class="{{#if selected}}highlight{{/if}}" {{#if selected}}selected{{/if}} {{#if
				disabled}}disabled{{/if}}>{{label}}</option>
			{{/each}}
		</select>
		<script>
			$(document).ready(function () {
				$('select#rowItems').select2();
			});
		</script>
	</div>
	<!-- グラフ種別指定 -->
	<div class="panel">
		<label for="selectableGraphTypes" class="i18n">{{__ "Selectable Table/Graph Types"}}</label>
		<select name="selectableGraphTypes" id="selectableGraphTypes" data-has-search="false" size="8" multiple>
			{{#each selectableGraphTypesList}}
			<option value="{{@key}}" {{#if selected}}selected{{/if}}>{{label}}</option>
			{{/each}}
		</select>
		<script>
			$(document).ready(function () {
				$('select#selectableGraphTypes').select2();
			});
		</script>
	</div>
	<!-- グラフ種別指定 -->
	<div class="panel">
		<label for="graphType" class="i18n">{{__ "Table/Graph Type"}}</label>
		<select name="graphType" id="graphType" data-has-search="false">
			{{#each graphTypeList}}
			<option value="{{@key}}" {{#if selected}}selected{{/if}}>{{label}}</option>
			{{/each}}
		</select>
	</div>
	<div class="card card-style-editor p-2 shadow-2dp">
		<!-- 集計方法指定 -->
		<div class="panel">
			<label for="aggregator" class="i18n">{{__ "Aggregator"}}</label>
			<select name="aggregator" id="aggregator" data-has-search="false">
				{{#each aggregatorList}}
				<option value="{{@key}}" {{#if selected}}selected{{/if}} data-attributes="{{attributes}}">{{label}}
				</option>
				{{/each}}
			</select>
			<script>
				$(document).ready(function () {
					var attributes = $('select#aggregator>option:selected').data("attributes");
					if (attributes == 1) {
						// 引数１つの場合はattribute2を無効にする
						$('select#attribute2').prop("disabled", true);
					}
					else if (attributes == 2) {
						// 引数２つの場合は何もしない
					}
					else {
						// 引数無しの場合はattributes1,2を無効にする
						$('select#attribute1').prop("disabled", true);
						$('select#attribute2').prop("disabled", true);
					}
				});
			</script>
		</div>
		<!-- 属性１指定 -->
		<div class="panel">
			<label for="attribute1" class="i18n">{{__ "Attribute 1"}}</label>
			<select name="attribute1" id="attribute1" data-has-search="false">
				<option value="">-</option>
				{{#each attribute1List}}
				<option value="{{@key}}" {{#if selected}}selected{{/if}}>{{label}}</option>
				{{/each}}
			</select>
		</div>
		<!-- 属性２指定 -->
		<div class="panel">
			<label for="attribute2" class="i18n">{{__ "Attribute 2"}}</label>
			<select name="attribute2" id="attribute2" data-has-search="false">
				<option value="">-</option>
				{{#each attribute2List}}
				<option value="{{@key}}" {{#if selected}}selected{{/if}}>{{label}}</option>
				{{/each}}
			</select>
		</div>
	</div>
	<!-- グラフの配色 -->
	<div class="panel">
		<label for="colorScheme" class="i18n">{{__ "Color scheme"}}</label>
		<select name="colorScheme" id="colorScheme" data-has-search="false">
			{{#each colorSchemeList}}
			<option value="{{value}}" {{#if selected}}selected="selected" {{/if}}>{{label}}</option>
			{{/each}}
		</select>
	</div>
	<!-- 操作ログ -->
	<div class="panel">
		<input id="storeOperationLog" name="storeOperationLog" type="checkbox" {{#if storeOperationLog}}checked{{/if}}
			style="vertical-align: middle;" />
		<label for="storeOperationLog" class="i18n">{{__ "Store operation log"}}</label>
	</div>
	<!-- ID -->
	<div class="panel">
		<label for="" class="has-icon i18n">Response identifier</label>
		<input type="text" name="identifier" value="{{identifier}}" placeholder="e.g. RESPONSE"
			data-validate="$notEmpty; $qtiIdentifier; $availableIdentifier(serial={{serial}});" />
	</div>
</div>