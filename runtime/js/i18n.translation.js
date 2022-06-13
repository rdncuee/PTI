/**
 * クロス集計表 多言語対応
  */
define(function () {
	/**
	 * 置き換え設定
	 */
	const TRANSLATION_TABLE = {
		// 日本語設定
		'ja-JP': {
			'CSV file': 'CSVファイル',
			'Select file': 'ファイルを選択',
			'Raw data caption': 'データ名',
			'Pivot Table caption': 'クロス集計表名',
			'Column items': '列項目（表頭）',
			'Row items': '行項目（表側）',
			'Selectable Table/Graph Types': '選択可能な表/グラフ形式',
			'Table/Graph Type': '表/グラフ形式',
			'Aggregator': '集計値',
			'Attribute 1': '属性１',
			'Attribute 2': '属性２',
			'Color scheme': '配色',
			'Store operation log': '操作ログの記録',
			'Response identifier': 'レスポンス識別子',
			'Reset': 'リセット',
			'Add Table': '表を追加',
			'Remove Table': '表を削除',
			// Pivot.jsの設定
			'pivotUtilities': {
				'localeStrings': {
					'renderError': '描画処理でエラーが発生しました。',
					'computeError': '処理中にエラーが発生しました。',
					'uiRenderError': '表示処理中にエラーが発生しました。',
					'selectAll': '全選択',
					'selectNone': '選択解除',
					'tooMany': '項目が多すぎます',
					'filterResults': '項目を検索する',
					'totals': '合計',
					'vs': 'vs',
					'by': 'per',
					'apply': '適用する',
					'cancel': 'キャンセル'
				},
				// aggregator名の設定
				'aggregators': {
					'Count': '件数',
					'Count Unique Values': '件数(ユニーク)',
					'List Unique Values': 'ユニーク値を表示(CSV)',
					'Sum': '合計',
					'Integer Sum': '合計(整数)',
					'Average': '平均',
					"Median": '中央値',
					"Sample Variance": '標本分散',
					"Sample Standard Deviation": '標本標準偏差',
					'Minimum': '最小',
					'Maximum': '最大',
					"First": '最初',
					"Last": '最後',
					'Sum over Sum': '選択２項目の比率',
					'80% Upper Bound': '選択２項目の比率(上限80%)',
					'80% Lower Bound': '選択２項目の比率(下限80%)',
					'Sum as Fraction of Total': '合計割合',
					'Sum as Fraction of Rows': '合計割合(行)',
					'Sum as Fraction of Columns': '合計割合(列)',
					'Count as Fraction of Total': '件数割合',
					'Count as Fraction of Rows': '件数割合(行)',
					'Count as Fraction of Columns': '件数割合(列)'
				},
				// renderer名の設定
				'renderers': {
					'Table': '表',
					'Table Barchart': '表(要素を棒グラフ)',
					'Heatmap': 'ヒートマップ(全体比較)',
					'Row Heatmap': 'ヒートマップ(行内比較)',
					'Col Heatmap': 'ヒートマップ(列内比較)',
					// 以下c3によるグラフ
					'Line Chart': '折れ線グラフ',
					'Horizontal Bar Chart': '棒グラフ(横)',
					'Horizontal Stacked Bar Chart': '積み上げ棒グラフ(横)',
					'Bar Chart': '棒グラフ',
					'Stacked Bar Chart': '積み上げ棒グラフ',
					'Area Chart': '積み上げ折れ線グラフ',
					'Scatter Chart': '散布図'
				}
			}
		}
	}

	/**
	 * メイン
	 */
	return {
		/**
		 * 与えられた文字列を指定言語に変換
		 * 変換できなかった場合はundef_value(デフォルトはundefined)を返す
		 *
		 * @param {string} language
		 * @param {string} label
		 * @param {string/undefind} undef_value 
		 * @returns 
		 */
		translate: function (language, label, undef_value = undefined) {
			return (language in TRANSLATION_TABLE) ? (label in TRANSLATION_TABLE[language] ? TRANSLATION_TABLE[language][label] : undef_value) : undef_value;
		},
		/**
		 * 指定された言語のlocaleStringsを取得
		 * @param {string} language
		 * @returns {Object}
		 */
		getLocaleStrings: function (language) {
			return language in TRANSLATION_TABLE ? ('localeStrings' in TRANSLATION_TABLE[language]['pivotUtilities'] ? TRANSLATION_TABLE[language]['pivotUtilities']['localeStrings'] : undef) : undef
		},
		/**
		 * 指定された言語のRenderer名を取得
		 * @param {string} language
		 * @param {string} label
		 * @returns {string}
		 */
		getRenderer: function (language, name) {
			return language in TRANSLATION_TABLE ? (name in TRANSLATION_TABLE[language]['pivotUtilities']['renderers'] ? TRANSLATION_TABLE[language]['pivotUtilities']['renderers'][name] : name) : name
		},
		/**
		 * 指定された言語のAggregator名を取得
		 * @param {string} language
		 * @param {string} label
		 * @returns {string}
		 */
		getAggregator: function (language, name) {
			return language in TRANSLATION_TABLE ? (name in TRANSLATION_TABLE[language]['pivotUtilities']['aggregators'] ? TRANSLATION_TABLE[language]['pivotUtilities']['aggregators'][name] : name) : name
		},
		/**
		 * 指定された言語の変換テーブルを取得
		 * @param {string} language
		 * @returns {Object}
		 */
		getTranslationTable: function (language) {
			return language in TRANSLATION_TABLE ? TRANSLATION_TABLE[language] : undefined
		}
	}
})
