/*
Build by Wiquid's PCI Generator for TAO platform Free to use
 */
define([
	'qtiCustomInteractionContext',
	'IMSGlobal/jquery_2_1_1',
	'./js/renderer',
	'OAT/util/event',
	'i18n'],
	function (qtiCustomInteractionContext, $, renderer, event, __) {
		'use strict';

		var PivotTableInteraction = {
			id: -1,
			getTypeIdentifier: function getTypeIdentifier() {
				return 'PivotTableInteraction';
			},
			/**
			 * Render the PCI :
			 * @param {String} id
			 * @param {Node} dom
			 * @param {Object} config - json
			 */
			initialize: function initialize(id, dom, config, assetManager) {
				//add method on(), off() and trigger() to the current object
				event.addEventMgr(this);
				var _this = this;
				this.id = id;
				this.dom = dom;
				this.config = config || {};
				this.serializedState = [];
				renderer.render(this.id, this.dom, this.config, assetManager);
				//tell the rendering engine that I am ready
				qtiCustomInteractionContext.notifyReady(this);
				//listening to dynamic configuration change
				this.on('csvdatachange', function (csvData) {
					_this.config.csvData = csvData;
				});
			},
			/**
			 * Programmatically set the response following the json schema described in
			 * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
			 *
			 * @param {Object} interaction
			 * @param {Object} response
			 */
			setResponse: function setResponse(response) {
				var Scontainer = $(this.dom);
				Scontainer.find('input.operation-log').val(JSON.stringify(response));
			},
			/**
			 * Get the response in the json format described in
			 * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
			 * ※この値が回答としてPOSTされます。
			 *
			 * @param {Object} interaction
			 * @returns {Object}
			 */
			getResponse: function getResponse() {
				var Scontainer = $(this.dom);
				var value = Scontainer.find('input.operation-log').val();
				return { base: { string: value } };
			},
			/**
			 * Remove the current response set in the interaction
			 * The state may not be restored at this point.
			 *
			 * @param {Object} interaction
			 */
			resetResponse: function resetResponse() {
				var Scontainer = $(this.dom);
				Scontainer.find('input.operation-log').val('');
			},
			/**
			 * Reverse operation performed by render()
			 * After this function is executed, only the inital naked markup remains
			 * Event listeners are removed and the state and the response are reset
			 *
			 * @param {Object} interaction
			 */
			destroy: function destroy() {
				var Scontainer = $(this.dom);
				Scontainer.off().empty();
			},
			/**
			 * Restore the state of the interaction from the serializedState.
			 *
			 * @param {Object} interaction
			 * @param {Object} serializedState - json format
			 */
			setSerializedState: function setSerializedState(state) {
				this.serializedState.push(state);
				console.log('PivotTable.amd.js:setSerializedState:' + JSON.stringify(this.serializedState))
				return JSON.stringify(this.serializedState);
			},
			/**
			 * Get the current state of the interaction as a string.
			 * It enables saving the state for later usage.
			 *
			 * @param {Object} interaction
			 * @returns {Object} json format
			 */
			getSerializedState: function getSerializedState() {
				console.log('PivotTable.amd.js:getSerializedState:' + JSON.stringify(this.serializedState))
				return JSON.stringify(this.serializedState);
			}
		};
		qtiCustomInteractionContext.register(PivotTableInteraction);
	}
);
