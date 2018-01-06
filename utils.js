//////////////////////////////////////////////////////////////////////////////////////////////////////////
// jQuery interaction
//////////////////////////////////////////////////////////////////////////////////////////////////////////

$(document).ready(function(e) {
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

// Borrowed from https://stackoverflow.com/questions/6637341/use-tab-to-indent-in-textarea


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
		}
		return new TimingPoint(...tpArr);
	}

	// Return a printable timing point string
	toString() {
		return `${this.offset},${this.speed},${this.meter},${this.sampleSet},${this.sampleIdx},${this.volume},${this.inherited},${this.kiai}`;
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
function generateListOfOffsets(input) {
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
		var cur = -Infinity;
		for (var i = 0, len = lines.length; i < len; i++) {
			var nextOffset = parseInt(lines[i].split(",")[2]);
			if (cur < nextOffset) {
				cur = nextOffset;
				resultArr.push(nextOffset);
			}
		}
	} else { // List of offets or some other illegal formats
		var lines = input.split("\n");
		for (var i = 0, len = lines.length; i < len; i++) {
			resultArr.push(parseFloat(lines[i]));
		}
	}
	return resultArr;
}

// Generate all inherited SVs with the given functions and values
function generateInheritedSvs(offsetsArr, cycleRule, scaleRule, meterRule, ssetRule, sidxRule, volRule, kiaiRule, scaleRuleSingleValue, meterRuleSingleValue, ssetRuleSingleValue, sidxRuleSingleValue, volRuleSingleValue, kiaiRuleSingleValue, finalSV) {
	var tpObjArr = [];
	var len = offsetsArr.length;
	var totalDuration = offsetsArr[len - 1] - offsetsArr[0];

	// Iterate through all cycles
	for (var i = 0; i < len - 1; i++) {
		// Generate the SVs for one cycle
		var duration = offsetsArr[i + 1] - offsetsArr[i];
		var cycleSVs = cycleRule(duration);

		// Pre-calculate all values for the start offset
		var firstOffset = offsetsArr[i];
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

			if (scaleRuleSingleValue) { speed = -100 / (cycleSVs[j][1] * firstScale); } else { speed = -100 / (cycleSVs[j][1] * scaleRule(offset, duration)); }
			if (meterRuleSingleValue) { meter = firstMeter; } else { meter = meterRule(offset, duration); }
			if (ssetRuleSingleValue) { sset = firstSset; } else { sset = ssetRule(offset, duration); }
			if (sidxRuleSingleValue) { sidx = firstSidx; } else { sidx = sidxRule(offset, duration); }
			if (volRuleSingleValue) { vol = firstVol; } else { vol = volRule(offset, duration); }
			if (kiaiRuleSingleValue) { kiai = firstKiai; } else { kiai = kiaiRule(offset, duration); }

			tpObjArr.push(new TimingPoint(offset, speed, meter, sset, sidx, vol, 0, kiai));
		}
	}

	if (finalSV != "") {
		var finalOffset = offsetsArr[len - 1];
		tpObjArr.push(new TimingPoint(finalOffset, -100 / parseFloat(finalSV), meterRule(finalOffset, totalDuration), ssetRule(finalOffset, totalDuration), sidxRule(finalOffset, totalDuration), volRule(finalOffset, totalDuration), 0, kiaiRule(finalOffset, totalDuration)));
	}
	return tpObjArr;
}
