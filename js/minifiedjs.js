$(document).ready(function(e){$('#split_bar').mousedown(function(e0){e0.preventDefault();$(document).mousemove(function(e){e.preventDefault();var x=$(window).width()-e.pageX;if(x>0&&e.pageX>$(window).width()/2){$('#sidebar').css("width",x);$('#togglebutton').css("right",x);$('#main').css("margin-right",x)}})});$(document).mouseup(function(e){$(document).unbind('mousemove')});var textareas=$('textarea');var count=textareas.length;for(var i=0;i<count;i++){textareas[i].onkeydown=function(e){if(e.keyCode==9||e.which==9){e.preventDefault();var s=this.selectionStart;this.value=this.value.substring(0,this.selectionStart)+"\t"+this.value.substring(this.selectionEnd);this.selectionEnd=s+1}}}
$("#slider1").click(function(){$('#advanced1').slideToggle('slow')});$("#slider2").click(function(){$('#advanced2').slideToggle('slow')});$("#stutter_cal_time,#stutter_cal_speed").keyup(function(){stutterCal()});$("#get_speed_in").keyup(function(){var rawSpeed=parseFloat($("#get_speed_in").val());if(rawSpeed<0){$("#get_speed_out").val(100/rawSpeed)}else if(rawSpeed>0){$("#get_speed_out").val(60000/rawSpeed)}})});function resetSidebar(){$('#sidebar,#togglebutton,#main').css("transition",'0.5s');var resizeX;if(Math.round($(window).width()/ 4) === parseInt($('#sidebar').css("width"))) {
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
class TimingPoint{constructor(offset,speed,meter,sampleSet,sampleIdx,volume,inherited,kiai){this.offset=offset;this.speed=speed;if(meter==undefined){this.meter=4}else{this.meter=meter}
if(sampleSet==undefined){this.sampleSet=2}else{this.sampleSet=sampleSet}
if(sampleIdx==undefined){this.sampleIdx=1}else{this.sampleIdx=sampleIdx}
if(volume==undefined){this.volume=40}else{this.volume=volume}
if(inherited==undefined){if(speed>0){this.inherited=1}else{this.inherited=-1}}else{this.inherited=inherited}
if(kiai==undefined){this.kiai=0}else{this.kiai=kiai}}
static parseTimingPoint(str){var tpArr=str.split(",");if(tpArr.length===8){for(var i=0;i<8;i++){tpArr[i]=parseFloat(tpArr[i])}
return new TimingPoint(...tpArr)}
return undefined}
toString(){return `${this.offset},${this.speed},${this.meter},${this.sampleSet},${this.sampleIdx},${this.volume},${this.inherited},${this.kiai}`}
toStringWithoutOffset(){return `${this.speed},${this.meter},${this.sampleSet},${this.sampleIdx},${this.volume},${this.inherited},${this.kiai}`}}
function evalId(id){var inputField=document.getElementById(id);if(inputField.type=="textarea"){var evaluatedInput=eval(inputField.value);if(typeof evaluatedInput=="function"){return evaluatedInput}else{console.log("Cannot parse function in #"+id)}}}
function generateListOfOffsets(input,countLn){var resultArr=[];if(input.startsWith("@")){var specialFormatArr=input.split(",");var mode=specialFormatArr[0];var start=parseFloat(specialFormatArr[1]);var end=parseFloat(specialFormatArr[2]);var specialParameter=parseFloat(specialFormatArr[3]);if(mode=="@n"){resultArr=new Array(specialParameter+1);for(var i=0;i<=specialParameter;i++){resultArr[i]=start+(end-start)*i/specialParameter}}else if(mode=="@i"){var len=Math.floor((end-start)/specialParameter);resultArr=new Array(len);resultArr[0]=start;for(var i=1;i<len;i++){resultArr[i]=resultArr[i-1]+specialParameter}}}else if(input.indexOf("|")!==-1){var splittedArr=input.split(/[,()]/);var cur=-Infinity;for(var i=1,len=splittedArr.length;i<len-1;i++){var offsetAndNote=splittedArr[i].split("|");var nextOffset=parseInt(offsetAndNote[0]);if(cur<nextOffset){cur=nextOffset;resultArr.push(nextOffset)}}}else if(input.indexOf(",")!==-1){var lines=input.split("\n");if(countLn){var hashSet={};for(var i=0,len=lines.length;i<len;i++){if(lines[i]!=""){var splitted=lines[i].split(/[,:]/);hashSet[parseInt(splitted[2])]=!0;if(splitted[5]!="0"){hashSet[parseInt(splitted[5])]=!0}}}
var keys=Object.keys(hashSet).map(Number);resultArr=keys.sort()}else{var cur=-Infinity;for(var i=0,len=lines.length;i<len;i++){var nextOffset=parseInt(lines[i].split(",")[2]);if(cur<nextOffset){cur=nextOffset;resultArr.push(nextOffset)}}}}else{var lines=input.split("\n");for(var i=0,len=lines.length;i<len;i++){if(lines[i]!=""){resultArr.push(parseFloat(lines[i]))}}}
return resultArr}
function generateSvs(offsetsArr,cycleRule,scaleRule,meterRule,ssetRule,sidxRule,volRule,kiaiRule,scaleRuleSingleValue,meterRuleSingleValue,ssetRuleSingleValue,sidxRuleSingleValue,volRuleSingleValue,kiaiRuleSingleValue,finalSV,mainBpm){var tpObjArr=[];var len=offsetsArr.length;var totalDuration=offsetsArr[len-1]-offsetsArr[0];var mainMsPB=mainBpm?60000/parseFloat(mainBpm):undefined;for(var i=0;i<len-1;i++){var duration=offsetsArr[i+1]-offsetsArr[i];var cycleSVs=cycleRule(duration);var firstOffset=offsetsArr[i]-offsetsArr[0];var firstScale=scaleRule(firstOffset,totalDuration);var firstMeter=meterRule(firstOffset,totalDuration);var firstSset=ssetRule(firstOffset,totalDuration);var firstSidx=sidxRule(firstOffset,totalDuration);var firstVol=volRule(firstOffset,totalDuration);var firstKiai=kiaiRule(firstOffset,totalDuration);for(var j=0,svNum=cycleSVs.length;j<svNum;j++){var offset=firstOffset+cycleSVs[j][0];var speed,meter,sset,sidx,vol,kiai;if(meterRuleSingleValue){meter=firstMeter}else{meter=meterRule(offset,totalDuration)}
if(ssetRuleSingleValue){sset=firstSset}else{sset=ssetRule(offset,totalDuration)}
if(sidxRuleSingleValue){sidx=firstSidx}else{sidx=sidxRule(offset,totalDuration)}
if(volRuleSingleValue){vol=firstVol}else{vol=volRule(offset,totalDuration)}
if(kiaiRuleSingleValue){kiai=firstKiai}else{kiai=kiaiRule(offset,totalDuration)}
if(mainMsPB){if(scaleRuleSingleValue){speed=mainMsPB/(cycleSVs[j][1]*firstScale)}else{speed=mainMsPB/(cycleSVs[j][1]*scaleRule(offset,totalDuration))}
tpObjArr.push(new TimingPoint(offset+offsetsArr[0],speed,meter,sset,sidx,vol,1,kiai))}else{if(scaleRuleSingleValue){speed=-100/(cycleSVs[j][1]*firstScale)}else{speed=-100/(cycleSVs[j][1]*scaleRule(offset,totalDuration))}
tpObjArr.push(new TimingPoint(offset+offsetsArr[0],speed,meter,sset,sidx,vol,0,kiai))}}}
if(finalSV!=""){if(mainMsPB){tpObjArr.push(new TimingPoint(offsetsArr[len-1],mainMsPB/parseFloat(finalSV),meterRule(totalDuration,totalDuration),ssetRule(totalDuration,totalDuration),sidxRule(totalDuration,totalDuration),volRule(totalDuration,totalDuration),1,kiaiRule(totalDuration,totalDuration)))}else{tpObjArr.push(new TimingPoint(offsetsArr[len-1],-100/parseFloat(finalSV),meterRule(totalDuration,totalDuration),ssetRule(totalDuration,totalDuration),sidxRule(totalDuration,totalDuration),volRule(totalDuration,totalDuration),0,kiaiRule(totalDuration,totalDuration)))}}
return tpObjArr}
function removeAll(){$(`input[type!='button'], textarea[class!='example-text']`).val('');$("[type='checkbox']").prop('checked',!1)}
function extractOffset(str){if(str.endsWith("- ")){var inputArr=str.split(/[: ]/);return inputArr[0]*60000+inputArr[1]*1000+inputArr[2]*1}else{var inputArr=str.split(",");if(inputArr.length===6){return inputArr[2]}else if(inputArr.length===8){return inputArr[0]}else{return""}}}
function execExtractOffset(){var input=$('#get_offset_in').val();var outputField=$('#get_offset_out');outputField.val(extractOffset(input));outputField.select();document.execCommand("Copy")}
function stutterCal(){var firstSvTime=parseFloat($("#stutter_cal_time").val());var firstSvSpeed=parseFloat($("#stutter_cal_speed").val());$("#stutter_cal_result").val((1-firstSvTime*firstSvSpeed)/ (1 - firstSvTime));
}
function offsetAll(){var result="";if($("#offsetAmt").val()==""){var offset=0}else{var offset=parseFloat($("#offsetAmt").val())}
var lines=$('#move_all_in').val().split('\n');var i=0;var len=lines.length;if(lines[0].startsWith("o")){while(i<len){var ithLine=lines[i];if(!ithLine.startsWith("[T")){i++;result+=ithLine+"\n"}else{break}}}
for(i;i<len;i++){var lineArr=lines[i].split(",");if(lineArr.length==8){lineArr[0]=parseFloat(lineArr[0])+offset}else if(lineArr.length==6){console.log(lineArr[2]);var ln=lineArr[5].split(":");lineArr[2]=parseFloat(lineArr[2])+offset;if(ln[0]>0){ln[0]=parseFloat(ln[0])+offset;lineArr[5]=ln.join(":")}
console.log(lineArr[2])}
result+=lineArr+"\n"}
var outputField=$("#move_all_out");outputField.val(result);outputField.select()}
function removeSVs(){var inputs=$("#norm_in").val();var lines=inputs.split("\n");var outputField=$("#norm_out");var output="";for(var i=0,len=lines.length;i<len;i++){var tpArr=lines[i].split(",");if(tpArr[6]=="1"){output+=lines[i]+"\n"}}
outputField.val(output);outputField.select()}
function nmlize(){var inputs=$("#norm_in").val();var lines=inputs.split("\n");var outputField=$("#norm_out");var timingPointObjArr=[];var output="";for(var i=0,len=lines.length;i<len;i++){var curTimingPoint=TimingPoint.parseTimingPoint(lines[i]);if(curTimingPoint.inherited===1){timingPointObjArr.push(curTimingPoint);output+=lines[i]+"\n"}}
var mainBpm;var normalizationBpmField=$('#norm_bpm');if(normalizationBpmField.val()!=""){mainBpm=parseFloat(normalizationBpmField.val())}else{var max=-1;for(var i=0,len=timingPointObjArr.length-1;i<len;i++){if(max<=timingPointObjArr[i+1].offset-timingPointObjArr[i].offset){max=timingPointObjArr[i+1].offset-timingPointObjArr[i].offset;mainBpm=60000/timingPointObjArr[i].speed}}
normalizationBpmField.val(mainBpm)}
for(var i=0,len=timingPointObjArr.length;i<len;i++){var msPerBeat=60000/timingPointObjArr[i].speed;var ratio=mainBpm/msPerBeat;timingPointObjArr[i].speed=-100/ratio;timingPointObjArr[i].inherited=0;output+=timingPointObjArr[i]+"\n"}
outputField.val(output);outputField.select()}
function copySvs(){var svLines=$("#copier_svs").val().split("\n");var tpObjInput=[];for(var i=0,len=svLines.length;i<len;i++){var curTp=TimingPoint.parseTimingPoint(svLines[i]);if(curTp!=undefined){tpObjInput.push(curTp)}}
var startOffset=tpObjInput[0].offset;var lenI=tpObjInput.length;var stringArrWithoutOffset=new Array(lenI);for(var i=0;i<lenI;i++){tpObjInput[i].offset-=startOffset;stringArrWithoutOffset[i]=tpObjInput[i].toStringWithoutOffset()}
var offsetsArr=generateListOfOffsets($("#copier_input").val(),document.getElementById('copier_ln').checked);var output="";for(var i=0,lenO=offsetsArr.length;i<lenO;i++){var offset=offsetsArr[i];for(var j=0;j<lenI;j++){output+=String(tpObjInput[j].offset+offset)+","+stringArrWithoutOffset[j]+"\n"}}
$("#copier_output").val(output)}
function execInheritedSvs(){var offsetsArr=generateListOfOffsets($("#general_inherited_input").val(),document.getElementById('general_inherited_ln').checked);var cycleRule=evalId("general_inherited_cycle");var scaleRule=evalId("general_inherited_scale");var meterRule=evalId("general_inherited_meter");var ssetRule=evalId("general_inherited_sset");var sidxRule=evalId("general_inherited_sidx");var volRule=evalId("general_inherited_vol");var kiaiRule=evalId("general_inherited_kiai");var scaleRuleSingleValue=document.getElementById("general_inherited_scale_cb").checked;var meterRuleSingleValue=document.getElementById("general_inherited_meter_cb").checked;var ssetRuleSingleValue=document.getElementById("general_inherited_sset_cb").checked;var sidxRuleSingleValue=document.getElementById("general_inherited_sidx_cb").checked;var volRuleSingleValue=document.getElementById("general_inherited_vol_cb").checked;var kiaiRuleSingleValue=document.getElementById("general_inherited_kiai_cb").checked;var finalSV=$("#general_inherited_final").val();var allSVs=generateSvs(offsetsArr,cycleRule,scaleRule,meterRule,ssetRule,sidxRule,volRule,kiaiRule,scaleRuleSingleValue,meterRuleSingleValue,ssetRuleSingleValue,sidxRuleSingleValue,volRuleSingleValue,kiaiRuleSingleValue,finalSV);$("#general_inherited_output").val(allSVs.join("\n"))}
function execStutteringSVs(){var offsetsArr=generateListOfOffsets($("#stutter_input").val(),document.getElementById('stutter_ln').checked);var ta=parseFloat($("#stutter_1_t").val());var tb=parseFloat($("#stutter_2_t").val());var taCb=document.getElementById("stutter_1_cb").checked;var tbCb=document.getElementById("stutter_2_cb").checked;var va=parseFloat($("#stutter_1_v").val());var vb=parseFloat($("#stutter_2_v").val());var cycleRule=function(duration){var timingPoints=[];var taMs=taCb?ta*duration:ta;var tbMs=tbCb?tb*duration:tb;if(ta===-1){taMs=duration-tbMs}else if(tb===-1){tbMs=duration-taMs}
timingPoints.push([0,va]);timingPoints.push([taMs,vb]);if((taMs+tbMs!==duration)&&(ta+tb!==1)){timingPoints.push([taMs+tbMs,1])}
return timingPoints};var scale=$("#stutter_0_v").val();if(scale!=""){var scaleRule=function(){return parseFloat(scale)}}else{var scaleRule=function(){return 1}}
var stutterOtherData=$("#stutter_others").val();if(stutterOtherData==""){stutterOtherData="4,2,1,40,0"}
var otherDataArr=stutterOtherData.split(",");var meterRule=function(){return otherDataArr[0]};var ssetRule=function(){return otherDataArr[1]};var sidxRule=function(){return otherDataArr[2]};var volRule=function(){return otherDataArr[3]};var kiaiRule=function(){return otherDataArr[4]};var finalSV=$("#stutter_final_v").val();var allSVs=generateSvs(offsetsArr,cycleRule,scaleRule,meterRule,ssetRule,sidxRule,volRule,kiaiRule,!0,!0,!0,!0,!0,!0,finalSV);$("#stutter_output").val(allSVs.join("\n"))}
function execUninheritedSvs(){var offsetsArr=generateListOfOffsets($("#general_uninherited_input").val(),document.getElementById('general_uninherited_ln').checked);var cycleRule=evalId("general_uninherited_cycle");var scaleRule=evalId("general_uninherited_scale");var meterRule=evalId("general_uninherited_meter");var ssetRule=evalId("general_uninherited_sset");var sidxRule=evalId("general_uninherited_sidx");var volRule=evalId("general_uninherited_vol");var kiaiRule=evalId("general_uninherited_kiai");var scaleRuleSingleValue=document.getElementById("general_uninherited_scale_cb").checked;var meterRuleSingleValue=document.getElementById("general_uninherited_meter_cb").checked;var ssetRuleSingleValue=document.getElementById("general_uninherited_sset_cb").checked;var sidxRuleSingleValue=document.getElementById("general_uninherited_sidx_cb").checked;var volRuleSingleValue=document.getElementById("general_uninherited_vol_cb").checked;var kiaiRuleSingleValue=document.getElementById("general_uninherited_kiai_cb").checked;var finalSV=$("#general_uninherited_final").val();var mainBpm=$("#general_uninherited_main").val();var allSVs=generateSvs(offsetsArr,cycleRule,scaleRule,meterRule,ssetRule,sidxRule,volRule,kiaiRule,scaleRuleSingleValue,meterRuleSingleValue,ssetRuleSingleValue,sidxRuleSingleValue,volRuleSingleValue,kiaiRuleSingleValue,finalSV,mainBpm);$("#general_uninherited_output").val(allSVs.join("\n"))}
function execUltimateSvs(){var offsetsArr=generateListOfOffsets($("#general_ultimate_input").val(),document.getElementById('general_ultimate_ln').checked);var rules=evalId("general_ultimate_rule");var mainBpm=parseFloat($("#general_ultimate_main").val());var allSVs=rules(offsetsArr,mainBpm);$("#general_ultimate_output").val(allSVs.join("\n"))}
function offsetAllEg1(){$('#move_all_in').val(`osu file format v14

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
448,192,33405,1,0,0:0:0:0:`)}
function offsetAllEg2(){$('#move_all_in').val(`382358,-100,4,2,1,20,0,1
407016,-100,4,2,1,20,0,0
408660,-100,4,2,1,20,0,1
433317,-100,4,2,1,20,0,0
459618,-117.647058823529,4,2,1,20,0,0
461262,-100,4,2,1,20,0,0
487050,-10,4,2,1,20,0,0`)}
function offsetAllEg3(){$('#move_all_in').val(`448,192,204004,1,2,0:0:0:0:
192,192,204004,1,2,0:0:0:0:
320,192,204106,1,2,0:0:0:0:
448,192,204106,1,2,0:0:0:0:
448,192,204209,1,2,0:0:0:0:
64,192,204209,1,2,0:0:0:0:
320,192,204312,1,2,0:0:0:0:
192,192,204312,1,2,0:0:0:0:
64,192,204415,1,2,0:0:0:0:
448,192,204415,1,2,0:0:0:0:
320,192,204415,1,2,0:0:0:0:
192,192,204466,1,2,0:0:0:0:
64,192,204517,1,2,0:0:0:0:
320,192,204517,1,2,0:0:0:0:
448,192,204620,1,2,0:0:0:0:
192,192,204620,1,2,0:0:0:0:
320,192,204723,1,2,0:0:0:0:`)}
function copierEg1(){$('#copier_input').val(`1
1000
5000
15000
25000
35000
44444
55555
66666
77777`)}
function copierEg2(){$('#copier_input').val(`00:24:699 (24699|1,24699|3,25074|2,25074|4,25449|5,25449|3,25636|6,26199|1,26199|5,26574|2,26574|4,26949|0,26949|5,27324|0,27324|6,27699|1,28074|2,28074|5,28449|1,28824|0,28824|4,29199|1,29574|3,29949|4,29949|2,30136|5,30324|1,30324|6) - `)}
function copierEg2x(){$('#copier_input').val(`51,192,301444,1,0,0:0:0:0:
153,192,301523,128,0,301837:0:0:0:0:`)}
function copierEg3(){$('#copier_input').val(`@n,1234,15555,25`)}
function svRuleEg1(){$('#general_inherited_cycle').val(`(function(duration){
	var timingPoints = new Array(10);     // Create new array
	for (var i = 0; i < 10; i++) {        // Add 10 items
		// Will create these speed: 1.5 0.5 1.6 0.4 and so on at 1/10 interval
		if (i % 2 == 0) {
			timingPoints[i] = [i * duration / 10, 1.5 + i / 20];
		} else {
			timingPoints[i] = [i * duration / 10, 2 - timingPoints[i - 1][1]];
		}
	}
	return timingPoints;  // Return the array
})`)}
function svRuleEg2(){$('#general_inherited_cycle').val(`(function(duration){
  return [[0,2],[duration/4,0.5],[3*duration/4,1]];
})`)}
function stutterEg1(){$("#stutter_1_v").val(2);$("#stutter_2_v").val(0.5);$("#stutter_1_t").val(0.25);$("#stutter_2_t").val(0.5);$("#stutter_1_cb").prop('checked',!0);$("#stutter_2_cb").prop('checked',!0)}
function stutterEg2(){$("#stutter_1_v").val(0.5);$("#stutter_2_v").val(2);$("#stutter_1_t").val(0.5);$("#stutter_2_t").val(0.25);$("#stutter_1_cb").prop('checked',!0);$("#stutter_2_cb").prop('checked',!0)}
function stutterEg3(){$("#stutter_1_v").val(1.99);$("#stutter_2_v").val(0.01);$("#stutter_1_t").val(0.5);$("#stutter_2_t").val(0.5);$("#stutter_1_cb").prop('checked',!0);$("#stutter_2_cb").prop('checked',!0)}
function stutterEg4(){$("#stutter_1_v").val(10);$("#stutter_2_v").val(0.75);$("#stutter_1_t").val(80);$("#stutter_2_t").val(-1);$("#stutter_1_cb").prop('checked',!1);$("#stutter_2_cb").prop('checked',!1)}
function stutterEg5(){$("#stutter_1_v").val(0.2);$("#stutter_2_v").val(4.2);$("#stutter_1_t").val(0.8);$("#stutter_2_t").val(0.2);$("#stutter_1_cb").prop('checked',!0);$("#stutter_2_cb").prop('checked',!0)}
function generalInheritedEg1(){$("#general_inherited_cycle").val(`(function(duration){
		return [[0,2],[duration/4,0.5],[3*duration/4,1]];
})
`);$("#general_inherited_scale").val(`(function(time, duration) {
		return 1;
})`)}
function generalInheritedEg2(){$("#general_inherited_cycle").val(`(function(duration){
		return [[0,0.5],[duration/2,2],[3*duration/4,1]];
})
`);$("#general_inherited_scale").val(`(function(time, duration) {
		return 1;
})`)}
function generalInheritedEg3(){$("#general_inherited_cycle").val(`(function(duration){
		return [[0,1.99],[duration/2,0.01]];
})
`);$("#general_inherited_scale").val(`(function(time, duration) {
		return 1 + 0.15 * time / duration;
})`)}
function generalInheritedEg4(){$("#general_inherited_cycle").val(`(function(duration){
		return [[0,10],[80,0.8]];
})
`);$("#general_inherited_scale").val(`(function(time, duration) {
		return Math.pow(1 - 0.3 * time / duration, 3);
})`)}
function generalInheritedEg5(){$("#general_inherited_cycle").val(`(function(duration){
		return [[0,0.2],[0.8*duration,4.2]];
})
`);$("#general_inherited_scale").val(`(function(time, duration) {
		return 1;
})`)}
function generalUninheritedEg1(){$("#general_uninherited_cycle").val(`(function(duration){
	var result = new Array(Math.floor(duration / 2));
	for (var i = 0; i < duration / 2; i++) {
		result[i] = [2 * i, 1];
	}
	return result;
})
`)}
function generalUninheritedEg2(){$("#general_uninherited_cycle").val(`(function(duration){
	// For main bpm = 180
	var func = function(x) {	// x=time/duration, from 0 to 1
		return 400*(0.5-0.5*Math.cos(20*Math.pow(x,1.5)));
	};
	var result = [];
	var i = 0;
	var stopLength = 5;
	while (i < duration) {
		for (var j = 0; j < stopLength; j++) {
			if (i > duration - 1) break;
			result.push([i,0.000000001]);
			i++;
		}
		if (i > duration - 1) break;
		result.push([i,func(i / duration)]);	// The magic is here
		i++;
		if (i > duration - 2) break;
		result.push([i,1000]);
		i += 2;
	}
	return result;
})
`)}
function generalUltimateEg1(){$("#general_ultimate_rule").val(`(function(offsetsArr, mainBpm){
	var result = [];
	for (var i = 0, len = offsetsArr.length; i < len - 1; i++) {
		var duration = offsetsArr[i + 1] - offsetsArr[i];
		var k = 0;
		while (k < duration) {
			for (var j = 0; j < 5; j++) {
				if (k > duration - 1) break;
				result.push(new TimingPoint(offsetsArr[i] + k, 1E10, 1, null, null, null, 1, null));
				k++;
			}
			if (k > duration - 1) break;
			result.push(new TimingPoint(offsetsArr[i] + k, Math.random(), 1 , null, null, null, 1, null));
			k++;
			if (i > duration - 2) break;
			result.push(new TimingPoint(offsetsArr[i] + k, 0.01, 1, null, null, null, 1, null));
			k += 2;
		}
	}
	result.push(new TimingPoint(offsetsArr[len - 1], 60000 / mainBpm, 4, null, null, null, 1, null));
	return result;
});
`)}
function generalUltimateEg2(){$("#general_ultimate_rule").val(`(function(offsetsArr, mainBpm) {
	var result = [];
		for (var i = 0, len = offsetsArr.length; i < len - 1; i++) {
			result.push(new TimingPoint(offsetsArr[i],0.01,1,null,null,null,1,null));
			result.push(new TimingPoint(offsetsArr[i],-1000,1,null,null,null,0,null));
			result.push(new TimingPoint(offsetsArr[i]+2,1000000000,4,null,null,null,1,null));
		}
	result.push(new TimingPoint(offsetsArr[len-1],60000/mainBpm,4,null,null,null,1,null));
	return result;
	})
`)}
function generalUltimateEg3(){$("#general_ultimate_rule").val(`(function(offsetsArr, mainBpm) {
	var result = [];
	for (var i = 0, len = offsetsArr.length; i < len / 2; i++) {
		result.push(new TimingPoint(offsetsArr[2 * i],0.1,4,null,null,null,1,null));
		result.push(new TimingPoint(offsetsArr[2 * i] + 1,60000/mainBpm * 4 * (1.01 - i / Math.floor(len / 2)),4,null,null,null,1,null));
	}
	result.push(new TimingPoint(offsetsArr[len-1],60000/mainBpm,4,null,null,null,1,null));
	return result;
	})
`)}
function generalUltimateEg4(){$("#general_ultimate_rule").val(`(function(offsetsArr, mainBpm) {
	var result = [];
	for (var i = 0, len = offsetsArr.length; i < len / 2; i++) {
		// Compare this with example 3!
		result.push(new TimingPoint(offsetsArr[2 * i] - 1,0.1,4,null,null,null,1,null));
		result.push(new TimingPoint(offsetsArr[2 * i],60000/mainBpm * 4 * (1.01 - i / Math.floor(len / 2)),4,null,null,null,1,null));
	}
	result.push(new TimingPoint(offsetsArr[len-1],60000/mainBpm,4,null,null,null,1,null));
	return result;
	})
`)}
function generalUltimateEg5(){$("#general_ultimate_rule").val(`(function(offsetsArr, mainBpm) {
	var result = [];
	var len = offsetsArr.length;
	var i = offsetsArr[0];
	var end = offsetsArr[len - 1];
	while (i < end) {
		var rand1 = 0.3 + 0.2 * Math.random();
		var rand2 = 0.3 + 0.2 * Math.random();
		if (rand1 + rand2 + i < end) {
			i += rand1;
			if (Math.random() < 0.5) {
				result.push(new TimingPoint(i,60000/mainBpm*rand1/(rand1+rand2),Math.floor(1+Math.random()*10),Math.floor(1+Math.random()*4),Math.floor(1+Math.random()*99),Math.floor(1+Math.random()*99),1,Math.floor(Math.random()*2)));
			} else {
				result.push(new TimingPoint(i,60000/mainBpm,Math.floor(1+Math.random()*10),Math.floor(1+Math.random()*4),Math.floor(1+Math.random()*99),Math.floor(1+Math.random()*99),1,Math.floor(Math.random()*2)));
				result.push(new TimingPoint(i,-100*rand1/(rand1+rand2),Math.floor(1+Math.random()*10),Math.floor(1+Math.random()*4),Math.floor(1+Math.random()*99),Math.floor(1+Math.random()*99),0,Math.floor(Math.random()*2)));
			}
			i += rand2;
			result.push(new TimingPoint(i,10000000+100000000*Math.random(),Math.floor(1+Math.random()*10),Math.floor(1+Math.random()*4),Math.floor(1+Math.random()*99),Math.floor(1+Math.random()*99),1,Math.floor(Math.random()*2)));
		} else {
			break;
		}
	}
	result.push(new TimingPoint(offsetsArr[len-1],60000/mainBpm,4,null,null,null,1,null));
	return result;
	})
`)}
