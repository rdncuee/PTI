<!-- PivotTableのHTML -->
<div class="PivotTable {{identifier}} px-0 pt-0 my-0">
	<div class="prompt d-none">{{{prompt}}}</div>
	<div class="hidden-pivot-table-setting">
		<input type="hidden" name="operation_log" class="operation-log" />
		<input type="hidden" name="xml_lang" class="xml-lang" />
	</div>
	<style>
		/* この設定をcssファイルに含めると、MIMEタイプが text/troff になってFirefoxでエラーになるため、ここに記述しています。 */
		/*-- Chart --*/
		.c3 svg {
			font: 10px sans-serif;
			-webkit-tap-highlight-color: rgba(0, 0, 0, 0);
		}
	</style>
	<!-- 基データのカード -->
	<div class="card card-csv-data mt-2 mb-0">
		<div class="card-header card-header-text pb-0">
			<h2 class="card-title">
				<div class="rawDataCaption">{{{rawDataCaption}}}</div>
			</h2>
		</div>
		<div class="card-body pt-0">
			<table id="rawData" class="table table-hover table-responsive table-sm table-csv-data">
				<thead class="csv-index"></thead>
				<tbody class="csv-content"></tbody>
			</table>
		</div>
	</div>
	<!-- クロス集計表のカード -->
	<div class="card card-pivot-table mt-4 mb-0">
		<div class="card-header card-header-text pb-0">
			<div class="row">
				<div class="col-8 ml-3 mb-0">
					<h2 class="card-title">
						<div class="pivotTableCaption">{{{pivotTableCaption}}}</div>
					</h2>
				</div>
				<div class="col m-0 text-right">
					<button name="resetButton" class="btn btn-info small btn-reset-graph pivot-table-setting mt-4">
						<span class="icon-reset pr-0"></span>
						<span class="i18n">Reset</span>
					</button>
				</div>
			</div>
		</div>
		<div class="card-body pt-0 px-2">
			<!-- グラフ１ -->
			<div data-graph-name="graph1" class="block block-graph-1">
				<div class="div-pivot-table div-pivot-table-1"></div>
			</div>
			<!-- グラフ２ -->
			<div data-graph-name="graph2" class="block block-graph-2 d-none">
				<div class="hr"></div>
				<div class="div-pivot-table div-pivot-table-2"></div>
			</div>
			<!-- グラフ３ -->
			<div data-graph-name="graph3" class="block block-graph-3 d-none">
				<div class="hr"></div>
				<div class="div-pivot-table div-pivot-table-3"></div>
			</div>
			<!-- グラフ４ -->
			<div data-graph-name="graph4" class="block block-graph-4 d-none">
				<div class="hr"></div>
				<div class="div-pivot-table div-pivot-table-4"></div>
			</div>
			<div class="row mt-2">
				<div class="col text-right">
					<button name="removeTableButton" class="btn btn-error small btn-remove-graph pivot-table-setting disabled">
						<span class="icon-remove pr-0"></span>
						<span class="i18n">Remove Table</span>
					</button>
					<button name="addTableButton" class="btn btn-success small btn-add-graph pivot-table-setting">
						<span class="icon-add pr-0"></span>
						<span class="i18n">Add Table</span>
					</button>
				</div>
			</div>
		</div>
	</div>
</div>
