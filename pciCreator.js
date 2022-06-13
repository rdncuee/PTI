/*
Build by Wiquid's PCI Generator for TAO platform Free to use 
 */

define([
	'lodash',
	'PivotTableInteraction/creator/widget/Widget',
	'tpl!PivotTableInteraction/creator/tpl/markup',
	'handlebars'
], function (_, Widget, markupTpl, Handlebars) {
	'use strict';

	// 言語設定：日本語
	const LANG_JP = 'ja-JP';

	// 言語設定：英語
	const LANG_EN = 'en-US';

	var _typeIdentifier = 'PivotTableInteraction';

	var PivotTableInteractionCreator = {
		/**
		 * (required) Get the typeIdentifier of the custom interaction
		 * 
		 * @returns {String}
		 */
		getTypeIdentifier: function () {
			return _typeIdentifier;
		},
		/**
		 * (required) Get the widget prototype
		 * Used in the renderer
		 * 
		 * @returns {Object} Widget
		 */
		getWidget: function () {
			return Widget;
		},
		/**
		 * (optional) Get the default properties values of the pci.
		 * Used on new pci instance creation
		 * 
		 * @returns {Object}
		 */
		getDefaultProperties: function (pci) {
			return {
				storeOperationLog: false,
				// クロス集計表の為の設定
				csvData: '',
				csvColumnNames: [],
				i18nLocale: '',	// 言語設定
				rawDataCaption: '',
				pivotTableCaption: '',
				columnItems: [],
				rowItems: [],
				selectableGraphTypes: undefined,
				graphType: '',
				aggregator: '',
				attribute1: '',
				attribute2: '',
			};
		},
		/**
		 * (optional) Callback to execute on the 
		 * Used on new pci instance creation
		 * 
		 * @returns {Object}
		 */
		afterCreate: function (pci) {
			//do some stuff
		},
		/**
		 * (required) Gives the qti pci xml template 
		 * 
		 * @returns {function} handlebar template
		 */
		getMarkupTemplate: function () {
			return markupTpl;
		},
		/**
		 * (optional) Allows passing additional data to xml template
		 * 
		 * @returns {function} handlebar template
		 */
		getMarkupData: function (pci, defaultData) {
			defaultData.prompt = pci.data('prompt');
			return defaultData;
		}
	};

	//since we assume we are in a tao context, there is no use to expose the a global object for lib registration
	//all libs should be declared here
	return PivotTableInteractionCreator;
});

