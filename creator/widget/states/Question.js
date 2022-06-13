/**
 * Build by Wiquid's PCI Generator for TAO platform Free to use
 */
define([
	'taoQtiItem/qtiCreator/widgets/states/factory',
	'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
	'taoQtiItem/qtiCreator/widgets/helpers/formElement',
	'taoQtiItem/qtiCreator/editor/simpleContentEditableElement',
	'taoQtiItem/qtiCreator/editor/containerEditor',
	'tpl!PivotTableInteraction/creator/tpl/propertiesForm',
	'lodash',
	'jquery',
	'jqueryui',
	'PivotTableInteraction/runtime/js/i18n.translation'
], function (stateFactory, Question, formElement, simpleEditor, containerEditor, formTpl, _, $, JQueryUI, i18nTr) {
	'use strict';

	// 言語設定：日本語
	const LANG_JP = 'ja-JP';

	// 言語設定：英語
	const LANG_EN = 'en-US';

	/**
	 * グラフ種別(renderer)
	 **/
	const GRAPH_TYPES = [
		"Table",
		"Table Barchart",
		"Heatmap",
		"Row Heatmap",
		"Col Heatmap",
		"Line Chart",
		"Horizontal Bar Chart",
		"Horizontal Stacked Bar Chart",
		"Bar Chart",
		"Stacked Bar Chart",
		"Area Chart",
		"Scatter Chart"
	];

	// 散布図は選択不可にする
	const GRAPH_TYPE_SCATTER_PLOT = 'Scatter Chart';

	/**
	 * 集計方法(Aggregator)と、属性(Attributes)の数の関係
	 **/
	const AGGREGATORS_AND_ATTRIBUTES = {
		"Count": 0,
		"Count Unique Values": 1,
		"List Unique Values": 1,
		"Sum": 1,
		"Integer Sum": 1,
		"Average": 1,
		"Median": 1,
		"Sample Variance": 1,
		"Sample Standard Deviation": 1,
		"Minimum": 1,
		"Maximum": 1,
		"First": 1,
		"Last": 1,
		"Sum over Sum": 2,
		"80% Upper Bound": 2,
		"80% Lower Bound": 2,
		"Sum as Fraction of Total": 1,
		"Sum as Fraction of Rows": 1,
		"Sum as Fraction of Columns": 1,
		"Count as Fraction of Total": 0,
		"Count as Fraction of Rows": 0,
		"Count as Fraction of Columns": 0
	}

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

	/**
	 * グラフの配色
	 *	This list is part of chartjs-plugin-colorschemes (https://nagix.github.io/chartjs-plugin-colorschemes/).
	 *	Copyright (c) 2019 Akihiko Kusanagi (https://github.com/nagix)
	 **/
	const DEFAULT_COLOR_SCHEME = ['#9e0142', '#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2']; // Spectral11
	const BREWER_COLOR_SCHEMES = {
		YlGn3: ['#f7fcb9', '#addd8e', '#31a354'],
		YlGn4: ['#ffffcc', '#c2e699', '#78c679', '#238443'],
		YlGn5: ['#ffffcc', '#c2e699', '#78c679', '#31a354', '#006837'],
		YlGn6: ['#ffffcc', '#d9f0a3', '#addd8e', '#78c679', '#31a354', '#006837'],
		YlGn7: ['#ffffcc', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238443', '#005a32'],
		YlGn8: ['#ffffe5', '#f7fcb9', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238443', '#005a32'],
		YlGn9: ['#ffffe5', '#f7fcb9', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238443', '#006837', '#004529'],

		YlGnBu3: ['#edf8b1', '#7fcdbb', '#2c7fb8'],
		YlGnBu4: ['#ffffcc', '#a1dab4', '#41b6c4', '#225ea8'],
		YlGnBu5: ['#ffffcc', '#a1dab4', '#41b6c4', '#2c7fb8', '#253494'],
		YlGnBu6: ['#ffffcc', '#c7e9b4', '#7fcdbb', '#41b6c4', '#2c7fb8', '#253494'],
		YlGnBu7: ['#ffffcc', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#0c2c84'],
		YlGnBu8: ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#0c2c84'],
		YlGnBu9: ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'],

		GnBu3: ['#e0f3db', '#a8ddb5', '#43a2ca'],
		GnBu4: ['#f0f9e8', '#bae4bc', '#7bccc4', '#2b8cbe'],
		GnBu5: ['#f0f9e8', '#bae4bc', '#7bccc4', '#43a2ca', '#0868ac'],
		GnBu6: ['#f0f9e8', '#ccebc5', '#a8ddb5', '#7bccc4', '#43a2ca', '#0868ac'],
		GnBu7: ['#f0f9e8', '#ccebc5', '#a8ddb5', '#7bccc4', '#4eb3d3', '#2b8cbe', '#08589e'],
		GnBu8: ['#f7fcf0', '#e0f3db', '#ccebc5', '#a8ddb5', '#7bccc4', '#4eb3d3', '#2b8cbe', '#08589e'],
		GnBu9: ['#f7fcf0', '#e0f3db', '#ccebc5', '#a8ddb5', '#7bccc4', '#4eb3d3', '#2b8cbe', '#0868ac', '#084081'],

		BuGn3: ['#e5f5f9', '#99d8c9', '#2ca25f'],
		BuGn4: ['#edf8fb', '#b2e2e2', '#66c2a4', '#238b45'],
		BuGn5: ['#edf8fb', '#b2e2e2', '#66c2a4', '#2ca25f', '#006d2c'],
		BuGn6: ['#edf8fb', '#ccece6', '#99d8c9', '#66c2a4', '#2ca25f', '#006d2c'],
		BuGn7: ['#edf8fb', '#ccece6', '#99d8c9', '#66c2a4', '#41ae76', '#238b45', '#005824'],
		BuGn8: ['#f7fcfd', '#e5f5f9', '#ccece6', '#99d8c9', '#66c2a4', '#41ae76', '#238b45', '#005824'],
		BuGn9: ['#f7fcfd', '#e5f5f9', '#ccece6', '#99d8c9', '#66c2a4', '#41ae76', '#238b45', '#006d2c', '#00441b'],

		PuBuGn3: ['#ece2f0', '#a6bddb', '#1c9099'],
		PuBuGn4: ['#f6eff7', '#bdc9e1', '#67a9cf', '#02818a'],
		PuBuGn5: ['#f6eff7', '#bdc9e1', '#67a9cf', '#1c9099', '#016c59'],
		PuBuGn6: ['#f6eff7', '#d0d1e6', '#a6bddb', '#67a9cf', '#1c9099', '#016c59'],
		PuBuGn7: ['#f6eff7', '#d0d1e6', '#a6bddb', '#67a9cf', '#3690c0', '#02818a', '#016450'],
		PuBuGn8: ['#fff7fb', '#ece2f0', '#d0d1e6', '#a6bddb', '#67a9cf', '#3690c0', '#02818a', '#016450'],
		PuBuGn9: ['#fff7fb', '#ece2f0', '#d0d1e6', '#a6bddb', '#67a9cf', '#3690c0', '#02818a', '#016c59', '#014636'],

		PuBu3: ['#ece7f2', '#a6bddb', '#2b8cbe'],
		PuBu4: ['#f1eef6', '#bdc9e1', '#74a9cf', '#0570b0'],
		PuBu5: ['#f1eef6', '#bdc9e1', '#74a9cf', '#2b8cbe', '#045a8d'],
		PuBu6: ['#f1eef6', '#d0d1e6', '#a6bddb', '#74a9cf', '#2b8cbe', '#045a8d'],
		PuBu7: ['#f1eef6', '#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0', '#0570b0', '#034e7b'],
		PuBu8: ['#fff7fb', '#ece7f2', '#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0', '#0570b0', '#034e7b'],
		PuBu9: ['#fff7fb', '#ece7f2', '#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0', '#0570b0', '#045a8d', '#023858'],

		BuPu3: ['#e0ecf4', '#9ebcda', '#8856a7'],
		BuPu4: ['#edf8fb', '#b3cde3', '#8c96c6', '#88419d'],
		BuPu5: ['#edf8fb', '#b3cde3', '#8c96c6', '#8856a7', '#810f7c'],
		BuPu6: ['#edf8fb', '#bfd3e6', '#9ebcda', '#8c96c6', '#8856a7', '#810f7c'],
		BuPu7: ['#edf8fb', '#bfd3e6', '#9ebcda', '#8c96c6', '#8c6bb1', '#88419d', '#6e016b'],
		BuPu8: ['#f7fcfd', '#e0ecf4', '#bfd3e6', '#9ebcda', '#8c96c6', '#8c6bb1', '#88419d', '#6e016b'],
		BuPu9: ['#f7fcfd', '#e0ecf4', '#bfd3e6', '#9ebcda', '#8c96c6', '#8c6bb1', '#88419d', '#810f7c', '#4d004b'],

		RdPu3: ['#fde0dd', '#fa9fb5', '#c51b8a'],
		RdPu4: ['#feebe2', '#fbb4b9', '#f768a1', '#ae017e'],
		RdPu5: ['#feebe2', '#fbb4b9', '#f768a1', '#c51b8a', '#7a0177'],
		RdPu6: ['#feebe2', '#fcc5c0', '#fa9fb5', '#f768a1', '#c51b8a', '#7a0177'],
		RdPu7: ['#feebe2', '#fcc5c0', '#fa9fb5', '#f768a1', '#dd3497', '#ae017e', '#7a0177'],
		RdPu8: ['#fff7f3', '#fde0dd', '#fcc5c0', '#fa9fb5', '#f768a1', '#dd3497', '#ae017e', '#7a0177'],
		RdPu9: ['#fff7f3', '#fde0dd', '#fcc5c0', '#fa9fb5', '#f768a1', '#dd3497', '#ae017e', '#7a0177', '#49006a'],

		PuRd3: ['#e7e1ef', '#c994c7', '#dd1c77'],
		PuRd4: ['#f1eef6', '#d7b5d8', '#df65b0', '#ce1256'],
		PuRd5: ['#f1eef6', '#d7b5d8', '#df65b0', '#dd1c77', '#980043'],
		PuRd6: ['#f1eef6', '#d4b9da', '#c994c7', '#df65b0', '#dd1c77', '#980043'],
		PuRd7: ['#f1eef6', '#d4b9da', '#c994c7', '#df65b0', '#e7298a', '#ce1256', '#91003f'],
		PuRd8: ['#f7f4f9', '#e7e1ef', '#d4b9da', '#c994c7', '#df65b0', '#e7298a', '#ce1256', '#91003f'],
		PuRd9: ['#f7f4f9', '#e7e1ef', '#d4b9da', '#c994c7', '#df65b0', '#e7298a', '#ce1256', '#980043', '#67001f'],

		OrRd3: ['#fee8c8', '#fdbb84', '#e34a33'],
		OrRd4: ['#fef0d9', '#fdcc8a', '#fc8d59', '#d7301f'],
		OrRd5: ['#fef0d9', '#fdcc8a', '#fc8d59', '#e34a33', '#b30000'],
		OrRd6: ['#fef0d9', '#fdd49e', '#fdbb84', '#fc8d59', '#e34a33', '#b30000'],
		OrRd7: ['#fef0d9', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#990000'],
		OrRd8: ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#990000'],
		OrRd9: ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000'],

		YlOrRd3: ['#ffeda0', '#feb24c', '#f03b20'],
		YlOrRd4: ['#ffffb2', '#fecc5c', '#fd8d3c', '#e31a1c'],
		YlOrRd5: ['#ffffb2', '#fecc5c', '#fd8d3c', '#f03b20', '#bd0026'],
		YlOrRd6: ['#ffffb2', '#fed976', '#feb24c', '#fd8d3c', '#f03b20', '#bd0026'],
		YlOrRd7: ['#ffffb2', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#b10026'],
		YlOrRd8: ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#b10026'],
		YlOrRd9: ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'],

		YlOrBr3: ['#fff7bc', '#fec44f', '#d95f0e'],
		YlOrBr4: ['#ffffd4', '#fed98e', '#fe9929', '#cc4c02'],
		YlOrBr5: ['#ffffd4', '#fed98e', '#fe9929', '#d95f0e', '#993404'],
		YlOrBr6: ['#ffffd4', '#fee391', '#fec44f', '#fe9929', '#d95f0e', '#993404'],
		YlOrBr7: ['#ffffd4', '#fee391', '#fec44f', '#fe9929', '#ec7014', '#cc4c02', '#8c2d04'],
		YlOrBr8: ['#ffffe5', '#fff7bc', '#fee391', '#fec44f', '#fe9929', '#ec7014', '#cc4c02', '#8c2d04'],
		YlOrBr9: ['#ffffe5', '#fff7bc', '#fee391', '#fec44f', '#fe9929', '#ec7014', '#cc4c02', '#993404', '#662506'],

		Purples3: ['#efedf5', '#bcbddc', '#756bb1'],
		Purples4: ['#f2f0f7', '#cbc9e2', '#9e9ac8', '#6a51a3'],
		Purples5: ['#f2f0f7', '#cbc9e2', '#9e9ac8', '#756bb1', '#54278f'],
		Purples6: ['#f2f0f7', '#dadaeb', '#bcbddc', '#9e9ac8', '#756bb1', '#54278f'],
		Purples7: ['#f2f0f7', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#4a1486'],
		Purples8: ['#fcfbfd', '#efedf5', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#4a1486'],
		Purples9: ['#fcfbfd', '#efedf5', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#54278f', '#3f007d'],

		Blues3: ['#deebf7', '#9ecae1', '#3182bd'],
		Blues4: ['#eff3ff', '#bdd7e7', '#6baed6', '#2171b5'],
		Blues5: ['#eff3ff', '#bdd7e7', '#6baed6', '#3182bd', '#08519c'],
		Blues6: ['#eff3ff', '#c6dbef', '#9ecae1', '#6baed6', '#3182bd', '#08519c'],
		Blues7: ['#eff3ff', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#084594'],
		Blues8: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#084594'],
		Blues9: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],

		Greens3: ['#e5f5e0', '#a1d99b', '#31a354'],
		Greens4: ['#edf8e9', '#bae4b3', '#74c476', '#238b45'],
		Greens5: ['#edf8e9', '#bae4b3', '#74c476', '#31a354', '#006d2c'],
		Greens6: ['#edf8e9', '#c7e9c0', '#a1d99b', '#74c476', '#31a354', '#006d2c'],
		Greens7: ['#edf8e9', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#005a32'],
		Greens8: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#005a32'],
		Greens9: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'],

		Oranges3: ['#fee6ce', '#fdae6b', '#e6550d'],
		Oranges4: ['#feedde', '#fdbe85', '#fd8d3c', '#d94701'],
		Oranges5: ['#feedde', '#fdbe85', '#fd8d3c', '#e6550d', '#a63603'],
		Oranges6: ['#feedde', '#fdd0a2', '#fdae6b', '#fd8d3c', '#e6550d', '#a63603'],
		Oranges7: ['#feedde', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#8c2d04'],
		Oranges8: ['#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#8c2d04'],
		Oranges9: ['#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704'],

		Reds3: ['#fee0d2', '#fc9272', '#de2d26'],
		Reds4: ['#fee5d9', '#fcae91', '#fb6a4a', '#cb181d'],
		Reds5: ['#fee5d9', '#fcae91', '#fb6a4a', '#de2d26', '#a50f15'],
		Reds6: ['#fee5d9', '#fcbba1', '#fc9272', '#fb6a4a', '#de2d26', '#a50f15'],
		Reds7: ['#fee5d9', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#99000d'],
		Reds8: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#99000d'],
		Reds9: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'],

		Greys3: ['#f0f0f0', '#bdbdbd', '#636363'],
		Greys4: ['#f7f7f7', '#cccccc', '#969696', '#525252'],
		Greys5: ['#f7f7f7', '#cccccc', '#969696', '#636363', '#252525'],
		Greys6: ['#f7f7f7', '#d9d9d9', '#bdbdbd', '#969696', '#636363', '#252525'],
		Greys7: ['#f7f7f7', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#252525'],
		Greys8: ['#ffffff', '#f0f0f0', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#252525'],
		Greys9: ['#ffffff', '#f0f0f0', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#252525', '#000000'],

		// Diverging
		PuOr3: ['#f1a340', '#f7f7f7', '#998ec3'],
		PuOr4: ['#e66101', '#fdb863', '#b2abd2', '#5e3c99'],
		PuOr5: ['#e66101', '#fdb863', '#f7f7f7', '#b2abd2', '#5e3c99'],
		PuOr6: ['#b35806', '#f1a340', '#fee0b6', '#d8daeb', '#998ec3', '#542788'],
		PuOr7: ['#b35806', '#f1a340', '#fee0b6', '#f7f7f7', '#d8daeb', '#998ec3', '#542788'],
		PuOr8: ['#b35806', '#e08214', '#fdb863', '#fee0b6', '#d8daeb', '#b2abd2', '#8073ac', '#542788'],
		PuOr9: ['#b35806', '#e08214', '#fdb863', '#fee0b6', '#f7f7f7', '#d8daeb', '#b2abd2', '#8073ac', '#542788'],
		PuOr10: ['#7f3b08', '#b35806', '#e08214', '#fdb863', '#fee0b6', '#d8daeb', '#b2abd2', '#8073ac', '#542788', '#2d004b'],
		PuOr11: ['#7f3b08', '#b35806', '#e08214', '#fdb863', '#fee0b6', '#f7f7f7', '#d8daeb', '#b2abd2', '#8073ac', '#542788', '#2d004b'],

		BrBG3: ['#d8b365', '#f5f5f5', '#5ab4ac'],
		BrBG4: ['#a6611a', '#dfc27d', '#80cdc1', '#018571'],
		BrBG5: ['#a6611a', '#dfc27d', '#f5f5f5', '#80cdc1', '#018571'],
		BrBG6: ['#8c510a', '#d8b365', '#f6e8c3', '#c7eae5', '#5ab4ac', '#01665e'],
		BrBG7: ['#8c510a', '#d8b365', '#f6e8c3', '#f5f5f5', '#c7eae5', '#5ab4ac', '#01665e'],
		BrBG8: ['#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#c7eae5', '#80cdc1', '#35978f', '#01665e'],
		BrBG9: ['#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#f5f5f5', '#c7eae5', '#80cdc1', '#35978f', '#01665e'],
		BrBG10: ['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#c7eae5', '#80cdc1', '#35978f', '#01665e', '#003c30'],
		BrBG11: ['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#f5f5f5', '#c7eae5', '#80cdc1', '#35978f', '#01665e', '#003c30'],

		PRGn3: ['#af8dc3', '#f7f7f7', '#7fbf7b'],
		PRGn4: ['#7b3294', '#c2a5cf', '#a6dba0', '#008837'],
		PRGn5: ['#7b3294', '#c2a5cf', '#f7f7f7', '#a6dba0', '#008837'],
		PRGn6: ['#762a83', '#af8dc3', '#e7d4e8', '#d9f0d3', '#7fbf7b', '#1b7837'],
		PRGn7: ['#762a83', '#af8dc3', '#e7d4e8', '#f7f7f7', '#d9f0d3', '#7fbf7b', '#1b7837'],
		PRGn8: ['#762a83', '#9970ab', '#c2a5cf', '#e7d4e8', '#d9f0d3', '#a6dba0', '#5aae61', '#1b7837'],
		PRGn9: ['#762a83', '#9970ab', '#c2a5cf', '#e7d4e8', '#f7f7f7', '#d9f0d3', '#a6dba0', '#5aae61', '#1b7837'],
		PRGn10: ['#40004b', '#762a83', '#9970ab', '#c2a5cf', '#e7d4e8', '#d9f0d3', '#a6dba0', '#5aae61', '#1b7837', '#00441b'],
		PRGn11: ['#40004b', '#762a83', '#9970ab', '#c2a5cf', '#e7d4e8', '#f7f7f7', '#d9f0d3', '#a6dba0', '#5aae61', '#1b7837', '#00441b'],

		PiYG3: ['#e9a3c9', '#f7f7f7', '#a1d76a'],
		PiYG4: ['#d01c8b', '#f1b6da', '#b8e186', '#4dac26'],
		PiYG5: ['#d01c8b', '#f1b6da', '#f7f7f7', '#b8e186', '#4dac26'],
		PiYG6: ['#c51b7d', '#e9a3c9', '#fde0ef', '#e6f5d0', '#a1d76a', '#4d9221'],
		PiYG7: ['#c51b7d', '#e9a3c9', '#fde0ef', '#f7f7f7', '#e6f5d0', '#a1d76a', '#4d9221'],
		PiYG8: ['#c51b7d', '#de77ae', '#f1b6da', '#fde0ef', '#e6f5d0', '#b8e186', '#7fbc41', '#4d9221'],
		PiYG9: ['#c51b7d', '#de77ae', '#f1b6da', '#fde0ef', '#f7f7f7', '#e6f5d0', '#b8e186', '#7fbc41', '#4d9221'],
		PiYG10: ['#8e0152', '#c51b7d', '#de77ae', '#f1b6da', '#fde0ef', '#e6f5d0', '#b8e186', '#7fbc41', '#4d9221', '#276419'],
		PiYG11: ['#8e0152', '#c51b7d', '#de77ae', '#f1b6da', '#fde0ef', '#f7f7f7', '#e6f5d0', '#b8e186', '#7fbc41', '#4d9221', '#276419'],

		RdBu3: ['#ef8a62', '#f7f7f7', '#67a9cf'],
		RdBu4: ['#ca0020', '#f4a582', '#92c5de', '#0571b0'],
		RdBu5: ['#ca0020', '#f4a582', '#f7f7f7', '#92c5de', '#0571b0'],
		RdBu6: ['#b2182b', '#ef8a62', '#fddbc7', '#d1e5f0', '#67a9cf', '#2166ac'],
		RdBu7: ['#b2182b', '#ef8a62', '#fddbc7', '#f7f7f7', '#d1e5f0', '#67a9cf', '#2166ac'],
		RdBu8: ['#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac'],
		RdBu9: ['#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac'],
		RdBu10: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061'],
		RdBu11: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061'],

		RdGy3: ['#ef8a62', '#ffffff', '#999999'],
		RdGy4: ['#ca0020', '#f4a582', '#bababa', '#404040'],
		RdGy5: ['#ca0020', '#f4a582', '#ffffff', '#bababa', '#404040'],
		RdGy6: ['#b2182b', '#ef8a62', '#fddbc7', '#e0e0e0', '#999999', '#4d4d4d'],
		RdGy7: ['#b2182b', '#ef8a62', '#fddbc7', '#ffffff', '#e0e0e0', '#999999', '#4d4d4d'],
		RdGy8: ['#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#e0e0e0', '#bababa', '#878787', '#4d4d4d'],
		RdGy9: ['#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#ffffff', '#e0e0e0', '#bababa', '#878787', '#4d4d4d'],
		RdGy10: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#e0e0e0', '#bababa', '#878787', '#4d4d4d', '#1a1a1a'],
		RdGy11: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#ffffff', '#e0e0e0', '#bababa', '#878787', '#4d4d4d', '#1a1a1a'],

		RdYlBu3: ['#fc8d59', '#ffffbf', '#91bfdb'],
		RdYlBu4: ['#d7191c', '#fdae61', '#abd9e9', '#2c7bb6'],
		RdYlBu5: ['#d7191c', '#fdae61', '#ffffbf', '#abd9e9', '#2c7bb6'],
		RdYlBu6: ['#d73027', '#fc8d59', '#fee090', '#e0f3f8', '#91bfdb', '#4575b4'],
		RdYlBu7: ['#d73027', '#fc8d59', '#fee090', '#ffffbf', '#e0f3f8', '#91bfdb', '#4575b4'],
		RdYlBu8: ['#d73027', '#f46d43', '#fdae61', '#fee090', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4'],
		RdYlBu9: ['#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4'],
		RdYlBu10: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'],
		RdYlBu11: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'],

		Spectral3: ['#fc8d59', '#ffffbf', '#99d594'],
		Spectral4: ['#d7191c', '#fdae61', '#abdda4', '#2b83ba'],
		Spectral5: ['#d7191c', '#fdae61', '#ffffbf', '#abdda4', '#2b83ba'],
		Spectral6: ['#d53e4f', '#fc8d59', '#fee08b', '#e6f598', '#99d594', '#3288bd'],
		Spectral7: ['#d53e4f', '#fc8d59', '#fee08b', '#ffffbf', '#e6f598', '#99d594', '#3288bd'],
		Spectral8: ['#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#e6f598', '#abdda4', '#66c2a5', '#3288bd'],
		Spectral9: ['#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#e6f598', '#abdda4', '#66c2a5', '#3288bd'],
		Spectral10: ['#9e0142', '#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2'],
		Spectral11: ['#9e0142', '#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2'],

		RdYlGn3: ['#fc8d59', '#ffffbf', '#91cf60'],
		RdYlGn4: ['#d7191c', '#fdae61', '#a6d96a', '#1a9641'],
		RdYlGn5: ['#d7191c', '#fdae61', '#ffffbf', '#a6d96a', '#1a9641'],
		RdYlGn6: ['#d73027', '#fc8d59', '#fee08b', '#d9ef8b', '#91cf60', '#1a9850'],
		RdYlGn7: ['#d73027', '#fc8d59', '#fee08b', '#ffffbf', '#d9ef8b', '#91cf60', '#1a9850'],
		RdYlGn8: ['#d73027', '#f46d43', '#fdae61', '#fee08b', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850'],
		RdYlGn9: ['#d73027', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850'],
		RdYlGn10: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee08b', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850', '#006837'],
		RdYlGn11: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850', '#006837'],

		// Qualitative
		Accent3: ['#7fc97f', '#beaed4', '#fdc086'],
		Accent4: ['#7fc97f', '#beaed4', '#fdc086', '#ffff99'],
		Accent5: ['#7fc97f', '#beaed4', '#fdc086', '#ffff99', '#386cb0'],
		Accent6: ['#7fc97f', '#beaed4', '#fdc086', '#ffff99', '#386cb0', '#f0027f'],
		Accent7: ['#7fc97f', '#beaed4', '#fdc086', '#ffff99', '#386cb0', '#f0027f', '#bf5b17'],
		Accent8: ['#7fc97f', '#beaed4', '#fdc086', '#ffff99', '#386cb0', '#f0027f', '#bf5b17', '#666666'],

		DarkTwo3: ['#1b9e77', '#d95f02', '#7570b3'],
		DarkTwo4: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a'],
		DarkTwo5: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e'],
		DarkTwo6: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02'],
		DarkTwo7: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d'],
		DarkTwo8: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d', '#666666'],

		Paired3: ['#a6cee3', '#1f78b4', '#b2df8a'],
		Paired4: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c'],
		Paired5: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99'],
		Paired6: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c'],
		Paired7: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f'],
		Paired8: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00'],
		Paired9: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6'],
		Paired10: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a'],
		Paired11: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99'],
		Paired12: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'],

		PastelOne3: ['#fbb4ae', '#b3cde3', '#ccebc5'],
		PastelOne4: ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4'],
		PastelOne5: ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6'],
		PastelOne6: ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc'],
		PastelOne7: ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc', '#e5d8bd'],
		PastelOne8: ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc', '#e5d8bd', '#fddaec'],
		PastelOne9: ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc', '#e5d8bd', '#fddaec', '#f2f2f2'],

		PastelTwo3: ['#b3e2cd', '#fdcdac', '#cbd5e8'],
		PastelTwo4: ['#b3e2cd', '#fdcdac', '#cbd5e8', '#f4cae4'],
		PastelTwo5: ['#b3e2cd', '#fdcdac', '#cbd5e8', '#f4cae4', '#e6f5c9'],
		PastelTwo6: ['#b3e2cd', '#fdcdac', '#cbd5e8', '#f4cae4', '#e6f5c9', '#fff2ae'],
		PastelTwo7: ['#b3e2cd', '#fdcdac', '#cbd5e8', '#f4cae4', '#e6f5c9', '#fff2ae', '#f1e2cc'],
		PastelTwo8: ['#b3e2cd', '#fdcdac', '#cbd5e8', '#f4cae4', '#e6f5c9', '#fff2ae', '#f1e2cc', '#cccccc'],

		SetOne3: ['#e41a1c', '#377eb8', '#4daf4a'],
		SetOne4: ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3'],
		SetOne5: ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00'],
		SetOne6: ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33'],
		SetOne7: ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628'],
		SetOne8: ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf'],
		SetOne9: ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'],

		SetTwo3: ['#66c2a5', '#fc8d62', '#8da0cb'],
		SetTwo4: ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3'],
		SetTwo5: ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854'],
		SetTwo6: ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f'],
		SetTwo7: ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494'],
		SetTwo8: ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494', '#b3b3b3'],

		SetThree3: ['#8dd3c7', '#ffffb3', '#bebada'],
		SetThree4: ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072'],
		SetThree5: ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3'],
		SetThree6: ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462'],
		SetThree7: ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69'],
		SetThree8: ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5'],
		SetThree9: ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9'],
		SetThree10: ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd'],
		SetThree11: ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd', '#ccebc5'],
		SetThree12: ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd', '#ccebc5', '#ffed6f']
	}

	var PivotTableStateQuestion = stateFactory.extend(Question, function () {
		var Scontainer = this.widget.$container,
			Sform = this.widget.$form,
			Sprompt = Scontainer.find('.prompt'),
			interaction = this.widget.element;
		containerEditor.create(Sprompt, {
			change: function (text) {
				interaction.data('prompt', text);
				interaction.updateMarkup();
			},
			markup: interaction.markup,
			markupSelector: '.prompt',
			related: interaction
		});
	}, function () {
		var Scontainer = this.widget.$container,
			Sprompt = Scontainer.find('.prompt');
		simpleEditor.destroy(Scontainer);
		containerEditor.destroy(Sprompt);
	});

	/**
	 * 初期化
	 */
	PivotTableStateQuestion.prototype.initForm = function () {
		var _widget = this.widget,
			config_update = false,
			Sform = _widget.$form,
			Scontainer = _widget.$container,
			interaction = _widget.element,
			xml_lang = interaction.rootElement.attr("xml:lang") || LANG_JP,	// 言語設定
			response = interaction.getResponseDeclaration(),
			storeOperationLog = (interaction.prop('storeOperationLog') || false),
			// ここからクロス集計表の為の設定
			csvData = (interaction.prop('csvData') || ''),
			csvColumnNames = (interaction.prop('csvColumnNames') || []),
			i18nLocale = (interaction.prop('i18nLocale') || xml_lang),
			rawDataCaption = (interaction.prop('rawDataCaption') || ((i18nLocale === LANG_JP) ? '基データ' : 'Raw Data')),
			pivotTableCaption = (interaction.prop('pivotTableCaption') || ((i18nLocale === LANG_JP) ? 'クロス集計表' : 'Pivot Table')),
			columnItems = (interaction.prop('columnItems') || []),
			columnItemsList = {},
			rowItems = (interaction.prop('rowItems') || []),
			rowItemsList = {},
			selectableGraphTypes = (interaction.prop('selectableGraphTypes') || undefined),
			selectableGraphTypesList = {},
			graphType = (interaction.prop('graphType') || ((xml_lang === LANG_JP) ? '表' : 'Table')),
			graphTypeList = {},
			aggregator = (interaction.prop('aggregator') || ((xml_lang === LANG_JP) ? '件数' : 'Count')),
			aggregatorList = {},
			attribute1 = (interaction.prop('attribute1') || '-'),
			attribute1List = {},
			attribute2 = (interaction.prop('attribute2') || '-'),
			attribute2List = {},
			colorScheme = (interaction.prop('colorScheme') || ['#9e0142', '#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2'] /* Spectral11 */),
			colorSchemeList = {},
			i18nTable = i18nTr.getTranslationTable();

		/**
		 * 各配列パラメータのチェック(JSONで格納されている場合はparseしておく)
		 */
		if (!$.isArray(csvColumnNames) && !$.isPlainObject(csvColumnNames) && (csvColumnNames !== '')) {
			csvColumnNames = JSON.parse(csvColumnNames);
		}
		if (!$.isArray(columnItems) && !$.isPlainObject(columnItems) && (columnItems !== '')) {
			columnItems = JSON.parse(columnItems);
		}
		if (!$.isArray(rowItems) && !$.isPlainObject(rowItems) && (rowItems !== '')) {
			rowItems = JSON.parse(rowItems);
		}
		if (selectableGraphTypes === undefined) {
			// 選択可能な表/グラフ形式が未定義の場合は、全て選択状態にしておく
			selectableGraphTypes = [];
			$.each(GRAPH_TYPES, function (idx, e) {
				if (e === GRAPH_TYPE_SCATTER_PLOT) {
					// 散布図は除外
					return true;
				}
				selectableGraphTypes.push(i18nTr.getRenderer(i18nLocale, e));
			});
			interaction.prop('selectableGraphTypes', selectableGraphTypes);
		}
		else {
			if ((!$.isArray(selectableGraphTypes)) && !$.isPlainObject(selectableGraphTypes) && (selectableGraphTypes !== '')) {
				selectableGraphTypes = JSON.parse(selectableGraphTypes);
			}
		}
		// 表/グラフ形式の設定が選択可能か確認
		if ($.inArray(graphType, selectableGraphTypes) === -1) {
			// 選択可能でない場合は、選択可能な表/グラフ形式リストの最初の要素を選択しておく
			graphType = selectableGraphTypes[0];
			interaction.prop('graphType', graphType);
		}

		/**
		 * プルダウンメニュー用のリスト作成
		 */
		_.each(csvColumnNames, function (csvColumnName) {
			// x軸プルダウンメニューのリスト作成
			columnItemsList[csvColumnName] = {
				label: csvColumnName,
				selected: (($.inArray(csvColumnName, columnItems) === -1) ? false : true),
				disabled: (($.inArray(csvColumnName, rowItems) === -1) ? false : true),
			};
			// ｙ軸プルダウンメニューのリスト作成
			rowItemsList[csvColumnName] = {
				label: csvColumnName,
				selected: (($.inArray(csvColumnName, rowItems) === -1) ? false : true),
				disabled: (($.inArray(csvColumnName, columnItems) === -1) ? false : true),
			};
			// 属性１プルダウンメニューのリスト作成
			attribute1List[csvColumnName] = {
				label: csvColumnName,
				selected: (csvColumnName === attribute1)
			};
			// 属性２プルダウンメニューのリスト作成
			attribute2List[csvColumnName] = {
				label: csvColumnName,
				selected: (csvColumnName === attribute2)
			};
		});

		/**
		 * 選択可能なグラフ種別プルダウンメニューのリスト作成
		 **/
		var graphTypeNameScatterPlot = '';
		$.each(GRAPH_TYPES, function (idx, e) {
			var graphTypeName = i18nTr.getRenderer(i18nLocale, e);
			if (e === GRAPH_TYPE_SCATTER_PLOT) {
				// 散布図は省く
				graphTypeNameScatterPlot = graphTypeName;
				return true;
			}
			selectableGraphTypesList[graphTypeName] = {
				label: graphTypeName,
				selected: (($.inArray(graphTypeName, selectableGraphTypes) !== -1) ? true : false)
			}
		});

		/**
		 * グラフ種別プルダウンメニューのリスト作成
		 **/
		$.each(selectableGraphTypes, function (idx, e) {
			if (e === graphTypeNameScatterPlot) {
				// 散布図は除く
				return true;
			}
			graphTypeList[e] = {
				label: e,
				selected: (e === graphType)
			}
		});

		/**
		 * 集計方法プルダウンメニューのリスト作成
		 */
		$.each(AGGREGATORS_AND_ATTRIBUTES, function (key, attr) {
			// 除外の確認
			if (EXCLUDED_AGGREGATORS.includes(key)) {
				// 除外対象
				return true;
			}
			var aggregatorName = i18nTr.getAggregator(i18nLocale, key);
			aggregatorList[aggregatorName] = {
				label: aggregatorName,
				selected: (aggregatorName === aggregator),
				attributes: attr
			}
		});

		/**
		 * 色調指定プルダウンメニューのリスト作成
		 */
		var jsonColorScheme = ($.isArray(colorScheme)) ? JSON.stringify(colorScheme) : colorScheme;
		$.each(BREWER_COLOR_SCHEMES, function (key, value) {
			var jsonValue = JSON.stringify(value);
			colorSchemeList[key] = {
				label: 'brewer.' + key,
				selected: (jsonColorScheme === jsonValue),
				value: jsonValue
			}
		});

		/**
		 * HTMLを描画する
		 */
		Sform.html(formTpl({
			serial: response.serial,
			identifier: interaction.attr('responseIdentifier'),
			storeOperationLog: storeOperationLog,
			// ここからクロス集計表の為の設定
			csvData: csvData,
			csvColumnNames: csvColumnNames,
			i18nLocale: i18nLocale,
			rawDataCaption: rawDataCaption,
			pivotTableCaption: pivotTableCaption,
			columnItems: columnItems,
			columnItemsList: columnItemsList,
			rowItems: rowItems,
			rowItemsList: rowItemsList,
			colorScheme: colorScheme,
			colorSchemeList: colorSchemeList,
			selectableGraphTypes: selectableGraphTypes,
			selectableGraphTypesList: selectableGraphTypesList,
			graphType: graphType,
			graphTypeList: graphTypeList,
			aggregator: aggregator,
			aggregatorList: aggregatorList,
			attribute1: attribute1,
			attribute1List: attribute1List,
			attribute2: attribute2,
			attribute2List: attribute2List
		}));

		// i18n翻訳 スタイルエディタ部
		Sform.find(".i18n").each(function (idx, element) {
			var translated = i18nTr.translate(i18nLocale, $(this).text());
			if (translated !== undefined) {
				// 翻訳後の文字列に置き換える
				$(this).text(translated);
			}
		});

		//init form javascript
		formElement.initWidget(Sform);

		/**
		 * setChangeCallbacks
		 * 右ペインの設定を変更した時に呼ばれるコールバック関数
		 */
		formElement.setChangeCallbacks(Sform, interaction, {
			csvData: function csvData(interaction, value) {
				console.log("csvData 変更しました");
				// update the pci property value:
				interaction.prop('csvData', value);
				// カラム名のリストを取得 
				var csv = $.csv.toArrays(value);
				var csvColumnNames = csv[0];
				Sform.find('input#csvColumnNames').val(JSON.stringify(csvColumnNames)).change();
				// _widget.refreshの処理は、csvColumnNamesのchangeイベントに任せます。
			},
			csvColumnNames: function csvColumnNames(interaction, value) {
				console.log("csvColumnNames 変更しました " + value);
				// update the pci property value:
				interaction.prop('csvColumnNames', value);
				// update rendering
				_widget.refresh();
			},
			i18nLocale: function i18nLocale(interaction, value) {
				console.log("i18nLocale 変更しました " + value);
				// update the pci property value:
				interaction.prop('i18nLocale', value);
				// 言語設定が影響する選択肢もリセットしておきます
				interaction.prop('selectableGraphTypes', '');
				interaction.prop('graphType', '');
				interaction.prop('aggregator', '');
				interaction.prop('attribute1', '');
				interaction.prop('attribute2', '');
				// update rendering
				_widget.refresh();
			},
			rawDataCaption: function rawDataCaption(interaction, value) {
				console.log("rawDataCaption 変更しました " + value);
				// update the pci property value:
				interaction.prop('rawDataCaption', value);
				// update rendering
				_widget.refresh();
			},
			pivotTableCaption: function pivotTableCaption(interaction, value) {
				console.log("pivotTableCaption 変更しました " + value);
				// update the pci property value:
				interaction.prop('pivotTableCaption', value);
				// update rendering
				_widget.refresh();
			},
			columnItems: function columnItems(interaction, value) {
				console.log("columnItems 変更しました " + value);
				var xAxes = [];
				Sform.find("select#columnItems option").each(function () {
					if ($(this).prop('selected')) {
						xAxes.push($(this).val());
					}
				});
				// update the pci property value:
				interaction.prop('columnItems', JSON.stringify(xAxes));
				// update rendering
				_widget.refresh();
			},
			rowItems: function rowItems(interaction, value) {
				console.log("rowItems 変更しました " + value);
				var yAxes = [];
				Sform.find("select#rowItems option").each(function () {
					if ($(this).prop('selected')) {
						yAxes.push($(this).val());
					}
				});
				// update the pci property value:
				interaction.prop('rowItems', JSON.stringify(yAxes));
				// update rendering
				_widget.refresh();
			},
			colorScheme: function colorScheme(interaction, value) {
				console.log("colorScheme 変更しました " + value);
				// update the pci property value:
				interaction.prop('colorScheme', value);
				// update rendering
				_widget.refresh();
			},
			selectableGraphTypes: function selectableGraphTypes(interaction, value) {
				console.log("selectableGraphTypes 変更しました " + value);
				//update the pci property value:
				interaction.prop('selectableGraphTypes', value);
				// update rendering
				_widget.refresh();
			},
			graphType: function graphType(interaction, value) {
				console.log("graphType 変更しました " + value);
				//update the pci property value:
				interaction.prop('graphType', value);
				// update rendering
				_widget.refresh();
			},
			aggregator: function aggregator(interaction, value) {
				console.log("aggregator 変更しました " + value);
				//update the pci property value:
				interaction.prop('aggregator', value);
				// update rendering
				_widget.refresh();
			},
			attribute1: function attribute1(interaction, value) {
				console.log("attribute1 変更しました " + value);
				//update the pci property value:
				interaction.prop('attribute1', value);
				// update rendering
				_widget.refresh();
			},
			attribute2: function attribute2(interaction, value) {
				console.log("attribute2 変更しました " + value);
				//update the pci property value:
				interaction.prop('attribute2', value);
				// update rendering
				_widget.refresh();
			},
			storeOperationLog: function storeOperationLog(interaction, value) {
				console.log("storeOperationLog 変更しました " + value);
				// update the pci property value:
				interaction.prop('storeOperationLog', value);
			},
			identifier: function (i, value) {
				console.log("identifier 変更しました " + value);
				response.id(value);
				interaction.attr('responseIdentifier', value);
			}
		});
		// i18nLocaleの設定(アイテムの言語設定に合わせる)
		if (interaction.prop('i18nLocale') !== interaction.rootElement.attr("xml:lang")) {
			Sform.find("input.i18n-locale").val(interaction.rootElement.attr("xml:lang")).change();
		}
		// rawDataCaptionの初期設定
		if (interaction.prop('rawDataCaption') === "") {
			Sform.find("input.rawDataCaption").val(rawDataCaption).change();
		}
		// pivotTableCaptionの初期設定
		if (interaction.prop('pivotTableCaption') === "") {
			Sform.find("input.pivotTableCaption").val(pivotTableCaption).change();
		}
	}
	return PivotTableStateQuestion;
});
