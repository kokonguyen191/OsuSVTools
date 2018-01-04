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
  	With a 5E-4% margin of error, a beat is about 4.375 / main_bpm * scroll_speed * osu_height.
  	Take note of this when you create SV effects.
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
	getTimingPoint() {
		return `${this.offset},${this.speed},${this.meter},${this.sampleSet},${this.sampleIdx},${this.volume},${this.inherited},${this.kiai}`;
	}
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

function beatmapExample() {
	$('#move_all_in').val(`osu file format v14

[General]
AudioFilename: Deadmau5 - Orange File.mp3
AudioLeadIn: 0
PreviewTime: 22938
Countdown: 0
SampleSet: Soft
StackLeniency: 0.7
Mode: 3
LetterboxInBreaks: 0
SpecialStyle: 0
WidescreenStoryboard: 0

[Editor]
DistanceSpacing: 0.8
BeatDivisor: 1
GridSize: 4
TimelineZoom: 1.4

[Metadata]
Title:Orange File
TitleUnicode:Orange File
Artist:deadmau5
ArtistUnicode:deadmau5
Creator:Hydria
Version:Normal
Source:
Tags:techno dubstep dnb drum and bass project 56 deadmaus
BeatmapID:866196
BeatmapSetID:398366

[Difficulty]
HPDrainRate:7
CircleSize:4
OverallDifficulty:7
ApproachRate:10
SliderMultiplier:1.4
SliderTickRate:1

[Events]
//Background and Video events
0,0,"Deadmau5 - Orange File %Background2%.jpg",0,0
//Break Periods
//Storyboard Layer 0 (Background)
//Storyboard Layer 1 (Fail)
//Storyboard Layer 2 (Pass)
//Storyboard Layer 3 (Foreground)
//Storyboard Sound Samples

[TimingPoints]
1840,329.67032967033,4,2,1,35,1,0
22938,-100,4,2,1,40,0,1
33488,-100,4,2,1,35,0,0


[HitObjects]
448,192,1840,5,2,0:0:0:0:
64,192,2169,1,8,0:0:0:0:
320,192,2334,1,2,0:0:0:0:
192,192,2664,1,8,0:0:0:0:
192,192,2829,1,8,0:0:0:0:
448,192,3158,1,2,0:0:0:0:
64,192,3488,1,8,0:0:0:0:
320,192,3653,1,2,0:0:0:0:
192,192,3982,1,8,0:0:0:0:
448,192,4147,1,2,0:0:0:0:
64,192,4477,1,8,0:0:0:0:
448,192,4642,1,0,0:0:0:0:
192,192,4807,1,0,0:0:0:0:
320,192,4971,1,0,0:0:0:0:
64,192,5136,1,0,0:0:0:0:
448,192,5301,1,2,0:0:0:0:
192,192,5466,1,8,0:0:0:0:
64,192,5796,1,2,0:0:0:0:
448,192,6125,1,8,0:0:0:0:
320,192,6290,1,2,0:0:0:0:
64,192,6455,1,0,0:0:0:0:
192,192,6620,1,8,0:0:0:0:
448,192,6785,1,0,0:0:0:0:
320,192,6949,1,0,0:0:0:0:
64,192,7114,1,2,0:0:0:0:
448,192,7444,1,8,0:0:0:0:
320,192,7609,1,2,0:0:0:0:
192,192,7938,1,8,0:0:0:0:
192,192,8103,1,8,0:0:0:0:
448,192,8433,1,2,0:0:0:0:
320,192,8763,1,8,0:0:0:0:
64,192,8927,1,2,0:0:0:0:
320,192,9257,1,8,0:0:0:0:
64,192,9422,1,2,0:0:0:0:
192,192,9752,1,2,0:0:0:0:
320,192,10081,1,8,0:0:0:0:
448,192,10246,1,2,0:0:0:0:
320,192,10576,1,8,0:0:0:0:
64,192,10741,1,0,0:0:0:0:
448,192,11070,1,2,0:0:0:0:
64,192,11235,1,2,0:0:0:0:
448,192,11400,1,2,0:0:0:0:
320,192,11565,1,0,0:0:0:0:
192,192,11730,1,8,0:0:0:0:
448,192,11894,1,2,0:0:0:0:
64,192,12059,1,8,0:0:0:0:
192,192,12142,1,8,0:0:0:0:
320,192,12224,1,8,0:0:0:0:
448,192,12307,1,8,0:0:0:0:
64,192,12389,1,2,0:0:0:0:
448,192,12719,1,8,0:0:0:0:
192,192,12883,1,2,0:0:0:0:
320,192,13213,1,8,0:0:0:0:
320,192,13378,1,8,0:0:0:0:
64,192,13708,1,2,0:0:0:0:
448,192,14037,1,8,0:0:0:0:
320,192,14202,1,2,0:0:0:0:
64,192,14532,1,8,0:0:0:0:
192,192,14697,1,2,0:0:0:0:
448,192,15026,1,8,0:0:0:0:
64,192,15191,1,0,0:0:0:0:
320,192,15356,1,0,0:0:0:0:
192,192,15521,1,0,0:0:0:0:
448,192,15686,1,0,0:0:0:0:
64,192,15850,1,2,0:0:0:0:
320,192,16015,1,8,0:0:0:0:
448,192,16345,1,2,0:0:0:0:
64,192,16675,1,8,0:0:0:0:
320,192,16840,1,2,0:0:0:0:
192,192,17004,1,0,0:0:0:0:
448,192,17169,1,8,0:0:0:0:
64,192,17334,1,0,0:0:0:0:
192,192,17499,1,0,0:0:0:0:
448,192,17664,1,2,0:0:0:0:
64,192,17993,1,8,0:0:0:0:
192,192,18158,1,2,0:0:0:0:
448,192,18488,1,8,0:0:0:0:
320,192,18653,1,8,0:0:0:0:
64,192,18982,1,2,0:0:0:0:
448,192,19312,1,8,0:0:0:0:
64,192,19477,1,2,0:0:0:0:
448,192,19807,1,8,0:0:0:0:
64,192,19971,1,2,0:0:0:0:
320,192,20301,1,2,0:0:0:0:
192,192,20631,1,8,0:0:0:0:
64,192,20796,1,2,0:0:0:0:
192,192,21125,1,8,0:0:0:0:
448,192,21290,1,0,0:0:0:0:
64,192,21620,1,2,0:0:0:0:
448,192,21785,1,2,0:0:0:0:
64,192,21949,1,2,0:0:0:0:
320,192,22114,1,0,0:0:0:0:
192,192,22279,1,8,0:0:0:0:
64,192,22444,1,2,0:0:0:0:
448,192,22609,1,8,0:0:0:0:
320,192,22691,1,8,0:0:0:0:
192,192,22774,1,8,0:0:0:0:
64,192,22856,1,8,0:0:0:0:
448,192,22938,1,2,0:0:0:0:
192,192,23268,1,8,0:0:0:0:
320,192,23433,1,2,0:0:0:0:
64,192,23763,1,8,0:0:0:0:
64,192,23927,1,8,0:0:0:0:
320,192,24257,1,2,0:0:0:0:
192,192,24587,1,8,0:0:0:0:
64,192,24752,1,2,0:0:0:0:
320,192,25081,1,8,0:0:0:0:
64,192,25246,1,2,0:0:0:0:
192,192,25576,1,8,0:0:0:0:
448,192,25741,1,0,0:0:0:0:
320,192,25905,1,0,0:0:0:0:
192,192,26070,1,8,0:0:0:0:
448,192,26235,1,0,0:0:0:0:
320,192,26400,1,0,0:0:0:0:
192,192,26565,1,8,0:0:0:0:
64,192,26894,1,2,0:0:0:0:
192,192,27059,1,0,0:0:0:0:
320,192,27224,1,0,0:0:0:0:
64,192,27389,1,2,0:0:0:0:
192,192,27554,1,0,0:0:0:0:
320,192,27719,1,0,0:0:0:0:
448,192,27883,1,2,0:0:0:0:
320,192,28048,1,0,0:0:0:0:
64,192,28213,1,2,0:0:0:0:
320,192,28543,1,8,0:0:0:0:
192,192,28708,1,2,0:0:0:0:
448,192,29037,1,8,0:0:0:0:
192,192,29202,1,8,0:0:0:0:
64,192,29367,1,0,0:0:0:0:
448,192,29532,1,2,0:0:0:0:
192,192,29861,1,8,0:0:0:0:
320,192,30026,1,2,0:0:0:0:
64,192,30356,1,8,0:0:0:0:
320,192,30521,1,0,0:0:0:0:
64,192,30850,1,8,0:0:0:0:
192,192,31015,1,0,0:0:0:0:
320,192,31180,1,0,0:0:0:0:
64,192,31345,1,0,0:0:0:0:
192,192,31510,1,0,0:0:0:0:
448,192,31675,1,2,0:0:0:0:
64,192,31840,1,8,0:0:0:0:
192,192,32169,1,2,0:0:0:0:
448,192,32499,1,8,0:0:0:0:
320,192,32664,1,2,0:0:0:0:
64,192,32829,1,0,0:0:0:0:
320,192,32993,1,8,0:0:0:0:
64,192,33158,1,0,0:0:0:0:
192,192,33241,1,0,0:0:0:0:
320,192,33323,1,0,0:0:0:0:
448,192,33405,1,0,0:0:0:0:
`);
}

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

	// Sort the timing points first in case some retard jumble them up
	timingPointObjArr.sort(function(a, b) {
		if (a.offset < b.offset) {
			return -1;
		} else if (a.offset > b.offset) {
			return 1;
		} else {
			return 0;
		}
	});

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
		var ratio = msPerBeat / mainBpm;
		timingPointObjArr[i].speed = -100 / ratio;
		timingPointObjArr[i].inherited = 0;
		output += timingPointObjArr[i].getTimingPoint() + "\n";
	}

	outputField.val(output);
	outputField.select();
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////
