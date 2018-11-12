//////////////////////////////////////////////////////////////////////////////////////////////////////////
// Main
//////////////////////////////////////////////////////////////////////////////////////////////////////////

function removeSVs() {
	// Just throw away green timing points
	var inputs = $("#norm_in").val();
	var lines = inputs.split("\n");
	var outputField = $("#norm_out");

	var output = "";
	for (var i = 0, len = lines.length; i < len; i++) {
		var tpArr = lines[i].split(",");
		if (tpArr[6] == "1") {
			output += lines[i] + "\n";
		}
	}

	outputField.val(output);
	outputField.select();
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////

function nmlize() {
	// Remove SVs and create TimingPoint objects.
	var inputs = $("#norm_in").val();
	var lines = inputs.split("\n");
	var outputField = $("#norm_out");

	var timingPointObjArr = [];

	var output = "";
	for (var i = 0, len = lines.length; i < len; i++) {
		var curTimingPoint = TimingPoint.parseTimingPoint(lines[i]);
		if (curTimingPoint.inherited === 1) {
			timingPointObjArr.push(curTimingPoint);
			output += lines[i] + "\n";
		}
	}

	// // Sort the timing points first in case some retard jumble them up
	// timingPointObjArr.sort(function(a, b) {
	// 	if (a.offset < b.offset) {
	// 		return -1;
	// 	} else if (a.offset > b.offset) {
	// 		return 1;
	// 	} else {
	// 		return 0;
	// 	}
	// });

	// Auto detect BPM if no normalization tempo is given.
	var mainBpm;
	var normalizationBpmField = $('#norm_bpm');
	if (normalizationBpmField.val() != "") {
		mainBpm = parseFloat(normalizationBpmField.val());
	} else {
		var max = -1;
		for (var i = 0, len = timingPointObjArr.length - 1; i < len; i++) {
			if (max <= timingPointObjArr[i + 1].offset - timingPointObjArr[i].offset) {
				max = timingPointObjArr[i + 1].offset - timingPointObjArr[i].offset;
				mainBpm = 60000 / timingPointObjArr[i].speed;
			}
		}
		normalizationBpmField.val(mainBpm);
	}

	// Now that we've got the mainBpm, let's normalize
	for (var i = 0, len = timingPointObjArr.length; i < len; i++) {
		var msPerBeat = 60000 / timingPointObjArr[i].speed;
		var ratio =  mainBpm / msPerBeat;
		timingPointObjArr[i].speed = -100 / ratio;
		timingPointObjArr[i].inherited = 0;
		output += timingPointObjArr[i] + "\n";
	}

	outputField.val(output);
	outputField.select();
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////

function copySvs() {
	var svLines = $("#copier_svs").val().split("\n");
	var tpObjInput = [];
	// Parse the timing points given
	for (var i = 0, len = svLines.length; i < len; i++) {
		var curTp = TimingPoint.parseTimingPoint(svLines[i]);
		if (curTp != undefined) {
			tpObjInput.push(curTp);
		}
	}

	// Normalize to start at offset 0
	var startOffset = tpObjInput[0].offset;
	var lenI = tpObjInput.length;
	var stringArrWithoutOffset = new Array(lenI);
	for (var i = 0; i < lenI; i++) {
		tpObjInput[i].offset -= startOffset;
		stringArrWithoutOffset[i] = tpObjInput[i].toStringWithoutOffset();
	}

	var offsetsArr = generateListOfOffsets($("#copier_input").val(), document.getElementById('copier_ln').checked);
	var output = "";
	for (var i = 0, lenO = offsetsArr.length; i < lenO; i++) {
		var offset = offsetsArr[i];
		for (var j = 0; j < lenI; j++) {
			output += String(tpObjInput[j].offset + offset) + "," + stringArrWithoutOffset[j] + "\n";
		}
	}
	$("#copier_output").val(output);
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////

function execInheritedSvs() {
	var offsetsArr = generateListOfOffsets($("#general_inherited_input").val(), document.getElementById('general_inherited_ln').checked);

	// All of these are functions
	var cycleRule = evalId("general_inherited_cycle");
	var scaleRule = evalId("general_inherited_scale");
	var meterRule = evalId("general_inherited_meter");
	var ssetRule = evalId("general_inherited_sset");
	var sidxRule = evalId("general_inherited_sidx");
	var volRule = evalId("general_inherited_vol");
	var kiaiRule = evalId("general_inherited_kiai");

	// All of these are boolean
	var scaleRuleSingleValue = document.getElementById("general_inherited_scale_cb").checked;
	var meterRuleSingleValue = document.getElementById("general_inherited_meter_cb").checked;
	var ssetRuleSingleValue = document.getElementById("general_inherited_sset_cb").checked;
	var sidxRuleSingleValue = document.getElementById("general_inherited_sidx_cb").checked;
	var volRuleSingleValue = document.getElementById("general_inherited_vol_cb").checked;
	var kiaiRuleSingleValue = document.getElementById("general_inherited_kiai_cb").checked;

	var finalSV = $("#general_inherited_final").val();

	var allSVs = generateSvs(offsetsArr, cycleRule, scaleRule, meterRule, ssetRule, sidxRule, volRule, kiaiRule, scaleRuleSingleValue, meterRuleSingleValue, ssetRuleSingleValue, sidxRuleSingleValue, volRuleSingleValue, kiaiRuleSingleValue, finalSV);

	$("#general_inherited_output").val(allSVs.join("\n"));
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////

function execStutteringSVs() {
	var offsetsArr = generateListOfOffsets($("#stutter_input").val(), document.getElementById('stutter_ln').checked);

	var ta = parseFloat($("#stutter_1_t").val());
	var tb = parseFloat($("#stutter_2_t").val());
	var taCb = document.getElementById("stutter_1_cb").checked;
	var tbCb = document.getElementById("stutter_2_cb").checked;
	var va = parseFloat($("#stutter_1_v").val());
	var vb = parseFloat($("#stutter_2_v").val());

	var cycleRule = function(duration) {
		var timingPoints = [];
		var taMs = taCb ? ta * duration : ta;
		var tbMs = tbCb ? tb * duration : tb;
		if (ta === -1) {
			taMs = duration - tbMs;
		} else if (tb === -1) {
			tbMs = duration - taMs;
		}
		timingPoints.push([0, va]);
		timingPoints.push([taMs, vb]);
		if ((taMs + tbMs !== duration) && (ta + tb !== 1)) {
			timingPoints.push([taMs + tbMs, 1]);
		}
		return timingPoints;
	};

	var scale = $("#stutter_0_v").val();
	if (scale != "") {
		var scaleRule = function() { return parseFloat(scale); };
	} else {
		var scaleRule = function() { return 1; };
	}

	var stutterOtherData = $("#stutter_others").val();
	if (stutterOtherData == "") {
		stutterOtherData = "4,2,1,40,0";
	}
	var otherDataArr = stutterOtherData.split(",");
	var meterRule = function() { return otherDataArr[0] };
	var ssetRule = function() { return otherDataArr[1] };
	var sidxRule = function() { return otherDataArr[2] };
	var volRule = function() { return otherDataArr[3] };
	var kiaiRule = function() { return otherDataArr[4] };

	var finalSV = $("#stutter_final_v").val();

	var allSVs = generateSvs(offsetsArr, cycleRule, scaleRule, meterRule, ssetRule, sidxRule, volRule, kiaiRule, true, true, true, true, true, true, finalSV);

	$("#stutter_output").val(allSVs.join("\n"));
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////

function execUninheritedSvs() {
	var offsetsArr = generateListOfOffsets($("#general_uninherited_input").val(), document.getElementById('general_uninherited_ln').checked);

	// All of these are functions
	var cycleRule = evalId("general_uninherited_cycle");
	var scaleRule = evalId("general_uninherited_scale");
	var meterRule = evalId("general_uninherited_meter");
	var ssetRule = evalId("general_uninherited_sset");
	var sidxRule = evalId("general_uninherited_sidx");
	var volRule = evalId("general_uninherited_vol");
	var kiaiRule = evalId("general_uninherited_kiai");

	// All of these are boolean
	var scaleRuleSingleValue = document.getElementById("general_uninherited_scale_cb").checked;
	var meterRuleSingleValue = document.getElementById("general_uninherited_meter_cb").checked;
	var ssetRuleSingleValue = document.getElementById("general_uninherited_sset_cb").checked;
	var sidxRuleSingleValue = document.getElementById("general_uninherited_sidx_cb").checked;
	var volRuleSingleValue = document.getElementById("general_uninherited_vol_cb").checked;
	var kiaiRuleSingleValue = document.getElementById("general_uninherited_kiai_cb").checked;

	var finalSV = $("#general_uninherited_final").val();
	var mainBpm = $("#general_uninherited_main").val();

	var allSVs = generateSvs(offsetsArr, cycleRule, scaleRule, meterRule, ssetRule, sidxRule, volRule, kiaiRule, scaleRuleSingleValue, meterRuleSingleValue, ssetRuleSingleValue, sidxRuleSingleValue, volRuleSingleValue, kiaiRuleSingleValue, finalSV, mainBpm);

	$("#general_uninherited_output").val(allSVs.join("\n"));
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////

function execUltimateSvs() {
	var offsetsArr = generateListOfOffsets($("#general_ultimate_input").val(), document.getElementById('general_ultimate_ln').checked);
	var rules = evalId("general_ultimate_rule");
	var mainBpm = parseFloat($("#general_ultimate_main").val());
	var allSVs = rules(offsetsArr, mainBpm);
	$("#general_ultimate_output").val(allSVs.join("\n"));
}
