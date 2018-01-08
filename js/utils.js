//////////////////////////////////////////////////////////////////////////////////////////////////////////
// jQuery interaction
//////////////////////////////////////////////////////////////////////////////////////////////////////////

$(document).ready(function(e) {
	// Sidebar interaction
	$('#split_bar').mousedown(function(e0) {
		e0.preventDefault();
		$(document).mousemove(function(e) {
			e.preventDefault();
			var x = $(window).width() - e.pageX;
			if (x > 0 && e.pageX > $(window).width() / 2) {
				$('#sidebar').css("width", x);
				$('#togglebutton').css("right", x);
				$('#main').css("margin-right", x);
			}
		})
	});

	$(document).mouseup(function(e) {
		$(document).unbind('mousemove');
	});

	// Code input interaction
	// Borrowed from https://stackoverflow.com/questions/6637341/use-tab-to-indent-in-textarea
	var textareas = $('textarea');
	var count = textareas.length;
	for (var i = 0; i < count; i++) {
		textareas[i].onkeydown = function(e) {
			if (e.keyCode == 9 || e.which == 9) {
				e.preventDefault();
				var s = this.selectionStart;
				this.value = this.value.substring(0, this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
				this.selectionEnd = s + 1;
			}
		}
	}

	// Hide show Advanced
	$("#slider1").click(function() {
		$('#advanced1').slideToggle('slow');
	});
	$("#slider2").click(function() {
		$('#advanced2').slideToggle('slow');
	});

	// Auto execute when typing
	$("#stutter_cal_time,#stutter_cal_speed").keyup(function() {
		stutterCal();
	});
	$("#get_speed_in").keyup(function() {
		var rawSpeed = parseFloat($("#get_speed_in").val());
		if (rawSpeed < 0) {
			$("#get_speed_out").val(100 / rawSpeed);
		} else if (rawSpeed > 0) {
			$("#get_speed_out").val(60000 / rawSpeed);
		}
	});

});

function resetSidebar() {
	$('#sidebar,#togglebutton,#main').css("transition", '0.5s');
	var resizeX;
	if (Math.round($(window).width() / 4) === parseInt($('#sidebar').css("width"))) {
		resizeX = "0";
	} else {
		resizeX = "25%";
	}
	$('#sidebar').css("width", resizeX);
	$('#togglebutton').css("right", resizeX);
	$('#main').css("margin-right", resizeX);
	setTimeout(function() {
		$('#sidebar,#togglebutton,#main').css("transition", 'none');
	}, 500);
}



//////////////////////////////////////////////////////////////////////////////////////////////////////////
class TimingPoint {
	/*
  	Offset: Self-explanatory. In ms.
  	Speed:
  	- If inherited == 1, it's the number of miliseconds per msperbeat, or in other words, bpm = 60000 / speed.
  	- If inherited == 0, -100 / speed is the scroll speed.
  	Meter: number of beats in a measure. There's a barline at every measure so it's useful in some SV gimmicks.
  	Sample set, sample index, volume don't matter to SVs.
  	Inherited: 1 means it's a new timing point, with a barline. Take note that if two inherited timing points
  	are less than 2ms apart, the barline won't appear.
  	Kiai doesn't matter to SVs.
	*/
	constructor(offset, speed, meter, sampleSet, sampleIdx, volume, inherited, kiai) {
		this.offset = offset;
		this.speed = speed;
		if (meter == undefined) {
			this.meter = 4;
		} else {
			this.meter = meter;
		}
		if (sampleSet == undefined) {
			this.sampleSet = 2;
		} else {
			this.sampleSet = sampleSet;
		}
		if (sampleIdx == undefined) {
			this.sampleIdx = 1;
		} else {
			this.sampleIdx = sampleIdx;
		}
		if (volume == undefined) {
			this.volume = 40;
		} else {
			this.volume = volume;
		}
		if (inherited == undefined) {
			if (speed > 0) {
				this.inherited = 1;
			} else {
				this.inherited = -1;
			}
		} else {
			this.inherited = inherited;
		}
		if (kiai == undefined) {
			this.kiai = 0;
		} else {
			this.kiai = kiai;
		}
	}

	// Takes a timing point string as parameter and returns a TimingPoint object
	static parseTimingPoint(str) {
		var tpArr = str.split(",");
		if (tpArr.length === 8) {
			for (var i = 0; i < 8; i++) {
				tpArr[i] = parseFloat(tpArr[i]);
			}
			return new TimingPoint(...tpArr);
		}
		return undefined;
	}

	// Return a printable timing point string
	toString() {
		return `${this.offset},${this.speed},${this.meter},${this.sampleSet},${this.sampleIdx},${this.volume},${this.inherited},${this.kiai}`;
	}

	// Return a printable timing point string without offset
	toStringWithoutOffset() {
		return `${this.speed},${this.meter},${this.sampleSet},${this.sampleIdx},${this.volume},${this.inherited},${this.kiai}`;
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////

// Pass in ID of a textarea and returns the function inside that element
function evalId(id) {
	var inputField = document.getElementById(id);
	if (inputField.type == "textarea") {
		var evaluatedInput = eval(inputField.value);
		if (typeof evaluatedInput == "function") {
			return evaluatedInput;
		} else {
			console.log("Cannot parse function in #" + id);
		}
	}
}

// Generate an array that contains all offsets to use
function generateListOfOffsets(input, countLn) {
	var resultArr = [];
	if (input.startsWith("@")) { // Special format
		var specialFormatArr = input.split(",");
		var mode = specialFormatArr[0];
		var start = parseFloat(specialFormatArr[1]);
		var end = parseFloat(specialFormatArr[2]);
		var specialParameter = parseFloat(specialFormatArr[3]);
		if (mode == "@n") { // Number of segments
			resultArr = new Array(specialParameter + 1);
			for (var i = 0; i <= specialParameter; i++) {
				resultArr[i] = start + (end - start) * i / specialParameter;
			}
		} else if (mode == "@i") {
			var len = Math.floor((end - start) / specialParameter);
			resultArr = new Array(len);
			resultArr[0] = start;
			for (var i = 1; i < len; i++) {
				resultArr[i] = resultArr[i - 1] + specialParameter;
			}
		}
	} else if (input.indexOf("|") !== -1) { // List of notes copied from osu!
		var splittedArr = input.split(/[,()]/);
		var cur = -Infinity;
		for (var i = 1, len = splittedArr.length; i < len - 1; i++) {
			var offsetAndNote = splittedArr[i].split("|");
			var nextOffset = parseInt(offsetAndNote[0]);
			if (cur < nextOffset) {
				cur = nextOffset;
				resultArr.push(nextOffset);
			}
		}
	} else if (input.indexOf(",") !== -1) { // List of notes copied from file
		var lines = input.split("\n");
		if (countLn) { // Count end of LN as offsets, only work in this format
			var hashSet = {};
			for (var i = 0, len = lines.length; i < len; i++) {
				if (lines[i] != "") {
					var splitted = lines[i].split(/[,:]/);
					hashSet[parseInt(splitted[2])] = true;
					if (splitted[5] != "0") {
						hashSet[parseInt(splitted[5])] = true;
					}
				}
			}
			var keys = Object.keys(hashSet).map(Number);
			resultArr = keys.sort();
		} else {
			var cur = -Infinity;
			for (var i = 0, len = lines.length; i < len; i++) {
				var nextOffset = parseInt(lines[i].split(",")[2]);
				if (cur < nextOffset) {
					cur = nextOffset;
					resultArr.push(nextOffset);
				}
			}
		}
	} else { // List of offets or some other illegal formats
		var lines = input.split("\n");
		for (var i = 0, len = lines.length; i < len; i++) {
			if (lines[i] != "") {
				resultArr.push(parseFloat(lines[i]));
			}
		}
	}
	return resultArr;
}

// Generate all inherited SVs with the given functions and values
function generateSvs(offsetsArr, cycleRule, scaleRule, meterRule, ssetRule, sidxRule, volRule, kiaiRule, scaleRuleSingleValue, meterRuleSingleValue, ssetRuleSingleValue, sidxRuleSingleValue, volRuleSingleValue, kiaiRuleSingleValue, finalSV, mainBpm) {
	var tpObjArr = [];
	var len = offsetsArr.length;
	var totalDuration = offsetsArr[len - 1] - offsetsArr[0];
	var mainMsPB = mainBpm ? 60000 / parseFloat(mainBpm) : undefined;

	// Iterate through all cycles
	for (var i = 0; i < len - 1; i++) {
		// Generate the SVs for one cycle
		var duration = offsetsArr[i + 1] - offsetsArr[i];
		var cycleSVs = cycleRule(duration);

		// Pre-calculate all values for the start offset
		var firstOffset = offsetsArr[i] - offsetsArr[0];
		var firstScale = scaleRule(firstOffset, totalDuration);
		var firstMeter = meterRule(firstOffset, totalDuration);
		var firstSset = ssetRule(firstOffset, totalDuration);
		var firstSidx = sidxRule(firstOffset, totalDuration);
		var firstVol = volRule(firstOffset, totalDuration);
		var firstKiai = kiaiRule(firstOffset, totalDuration);

		// Iterate through each timing point, calculate the value needed
		for (var j = 0, svNum = cycleSVs.length; j < svNum; j++) {
			var offset = firstOffset + cycleSVs[j][0];
			var speed, meter, sset, sidx, vol, kiai;
			if (meterRuleSingleValue) {
				meter = firstMeter;
			} else {
				meter = meterRule(offset, totalDuration);
			}
			if (ssetRuleSingleValue) {
				sset = firstSset;
			} else {
				sset = ssetRule(offset, totalDuration);
			}
			if (sidxRuleSingleValue) {
				sidx = firstSidx;
			} else {
				sidx = sidxRule(offset, totalDuration);
			}
			if (volRuleSingleValue) {
				vol = firstVol;
			} else {
				vol = volRule(offset, totalDuration);
			}
			if (kiaiRuleSingleValue) {
				kiai = firstKiai;
			} else {
				kiai = kiaiRule(offset, totalDuration);
			}

			if (mainMsPB) {
				if (scaleRuleSingleValue) {
					speed = mainMsPB / (cycleSVs[j][1] * firstScale);
				} else {
					speed = mainMsPB / (cycleSVs[j][1] * scaleRule(offset, totalDuration));
				}
				tpObjArr.push(new TimingPoint(offset + offsetsArr[0], speed, meter, sset, sidx, vol, 1, kiai));
			} else {
				if (scaleRuleSingleValue) {
					speed = -100 / (cycleSVs[j][1] * firstScale);
				} else {
					speed = -100 / (cycleSVs[j][1] * scaleRule(offset, totalDuration));
				}
				tpObjArr.push(new TimingPoint(offset + offsetsArr[0], speed, meter, sset, sidx, vol, 0, kiai));
			}
		}
	}

	if (finalSV != "") {
		if (mainMsPB) {
			tpObjArr.push(new TimingPoint(offsetsArr[len - 1], mainMsPB / parseFloat(finalSV), meterRule(totalDuration, totalDuration), ssetRule(totalDuration, totalDuration), sidxRule(totalDuration, totalDuration), volRule(totalDuration, totalDuration), 1, kiaiRule(totalDuration, totalDuration)));
		} else {
			tpObjArr.push(new TimingPoint(offsetsArr[len - 1], -100 / parseFloat(finalSV), meterRule(totalDuration, totalDuration), ssetRule(totalDuration, totalDuration), sidxRule(totalDuration, totalDuration), volRule(totalDuration, totalDuration), 0, kiaiRule(totalDuration, totalDuration)));
		}
	}
	return tpObjArr;
}
