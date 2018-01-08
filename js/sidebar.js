//////////////////////////////////////////////////////////////////////////////////////////////////////////
// Sidebar
//////////////////////////////////////////////////////////////////////////////////////////////////////////

function removeAll() {
	$(`input[type!='button'], textarea[class!='example-text']`).val('');
	$("[type='checkbox']").prop('checked', false);
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////

// Extract offset from timing point or a note
function extractOffset(str) {
	if (str.endsWith("- ")) {
		var inputArr = str.split(/[: ]/);
		return inputArr[0] * 60000 + inputArr[1] * 1000 + inputArr[2] * 1;
	} else {
		var inputArr = str.split(",");
		if (inputArr.length === 6) { // Note
			return inputArr[2];
		} else if (inputArr.length === 8) { // Timing point
			return inputArr[0];
		} else {
			return "";
		}
	}
}

// Trigger on button click
function execExtractOffset() {
	var input = $('#get_offset_in').val();
	var outputField = $('#get_offset_out');
	outputField.val(extractOffset(input));
	outputField.select();
	document.execCommand("Copy");
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////

function stutterCal() {
	var firstSvTime = parseFloat($("#stutter_cal_time").val());
	var firstSvSpeed = parseFloat($("#stutter_cal_speed").val());
	$("#stutter_cal_result").val((1 - firstSvTime * firstSvSpeed) / (1 - firstSvTime));
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////



function offsetAll() {
	var result = "";
	if ($("#offsetAmt").val() == "") {
		var offset = 0;
	} else {
		var offset = parseFloat($("#offsetAmt").val());
	}
	var lines = $('#move_all_in').val().split('\n');
	var i = 0;
	var len = lines.length;
	if (lines[0].startsWith("o")) { // Whole beatmap
		// Skip to TimingPoints
		while (i < len) {
			var ithLine = lines[i];
			if (!ithLine.startsWith("[T")) {
				i++;
				result += ithLine + "\n";
			} else {
				break;
			}
		}
	}
	for (i; i < len; i++) {
		var lineArr = lines[i].split(",");
		if (lineArr.length == 8) { // Timing point
			lineArr[0] = parseFloat(lineArr[0]) + offset;
		} else if (lineArr.length == 6) { // Note
			console.log(lineArr[2]);
			var ln = lineArr[5].split(":");
			lineArr[2] = parseFloat(lineArr[2]) + offset;
			if (ln[0] > 0) { // Is LN
				ln[0] = parseFloat(ln[0]) + offset;
				lineArr[5] = ln.join(":");
			}
			console.log(lineArr[2]);
		}
		result += lineArr + "\n";
	}
	var outputField = $("#move_all_out");
	outputField.val(result);
	outputField.select();
}
