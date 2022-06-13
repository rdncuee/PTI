/*
 Build by Wiquid's PCI Generator for TAO platform Free to use
 */
define([
	'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/Widget',
	'PivotTableInteraction/creator/widget/states/states'
], function (Widget, states) {
	'use strict';

	var PivotTableWidget = Widget.clone();

	PivotTableWidget.initCreator = function () {
		var $interaction;

		this.registerStates(states);

		Widget.initCreator.call(this);

		$interaction = this.$container.find('.PivotTable');
		if ($interaction.length) {
			$interaction.addClass('tao-qti-creator-context');
		}
	};

	return PivotTableWidget;
});
