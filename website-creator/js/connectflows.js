
var credentials;
var secretKey;
var accessKey;
var sessionId;
var connect;
var contactFlows;
var contactFlows2;
var contactFlowsTable;
var contactFlowsTable2;
var selectedFlowName = '';
var selectedFlowType = '';
var selectedFlowID = '';
var selectedFlowName2 = '';
var selectedFlowType2 = '';
var selectedFlowID2 = '';

var dlgSourceSecretKey;
var dlgSourceAccessKey;
var dlgSourceInstance;
var dlgSourceRegion;
var dlgSourceBackupDDB;
var dlgSourceARNMapDDB;

var dlgTargetSecretKey;
var dlgTargetAccessKey;
var dlgTargetInstance;
var dlgTargetRegion;
var dlgTargetBackupDDB;

var renameFlowInstanceId=1;
var originalContactFlow;
var updatedContactFlow;

$( document ).ready(function() {
	if (checkCookie()){
		setAWSConfig(dlgSourceAccessKey, dlgSourceSecretKey, dlgSourceRegion);
		loadConnectAPIs();
	    getInstanceNames();
	    setupAll();
	}else{
		setupAll();
		$( "#configDialog" ).dialog( "open" );
	}
});

function setupAll(){
    $("#getAllFlows").click(() => {
    	getContactFlows();
    });
    
    $("#updateName").click(() => {
    	changeContactFlowName();
    });
    
    $("#describeContactFlow").click(() => {
    	describeContactFlowName();
    });
    
    $("#createContactFlow").click(() => {
    	$( "#contactFlowContentdialog" ).dialog( "open" );
    });
    
    $("#btnCreateContactFlow").click(() => {
    	$( "#contactFlowContentdialog" ).dialog( "close" );
    	createContactFlow();
    });
    
    $("#updateContactFlow").click(() => {
    	updateContactFlow();
    });
    
    $("#awsConfiguration").click(() => {
    	$( "#configDialog" ).dialog( "open" );
    });
    
    $("#btnConfiguration").click(() => {
    	if(saveCookie()){
    		$( "#configDialog" ).dialog( "close" );
    		setAWSConfig(dlgSourceAccessKey, dlgSourceSecretKey, dlgSourceRegion);
    		loadConnectAPIs();
    	    getInstanceNames();
    	}
    	else
    		$( "#configDialog" ).dialog( "open" );
    });
    
    $("#btnRenameContactFlow").click(() => {
    	$( "#renameDialog" ).dialog( "close" );
    	changeContactFlowName();    	
    });
    $("#btnBackupAll").click(() => {
    	backupContactFlows(1);
    });
    
    $("#btnBackupAll1").click(() => {
    	backupContactFlows(2);
    });
    $("#btnUpdateContactFlow").click(() => {
    	updateFlowDetails();
    });  
    
        
    contactFlowsTable = $('#contactFlowList').DataTable({
    	columnDefs: [{targets: -1,className: 'dt-body-right'}],    	
        columns: [{title: "Name"},{title: "Type"},{title: "Details",width: "15%", className: "text-center"}, {title: "Change Name",width: "20%", className: "text-center"}, {title: "Promote", width :"10%" }, {title: "Select", width :"10%", className: "chk-center"}],            
        select: true,
        paging: false,
        info: false,
        searching: false
    });
    contactFlowsTable2 = $('#contactFlowList2').DataTable({
    	columnDefs: [{targets: -1,className: 'dt-body-right'}],    	
        columns: [{title: "Name"},{title: "Type"},{title: "Details",width: "15%", className: "text-center"}, {title: "Change Name",width: "20%", className: "text-center"}],
        select: true,
        paging: false,
        info: false,
        searching: false
    });
    
    contactFlowsTable.on( 'select', function ( e, dt, type, indexes ) {
        if ( type === 'row' ) {
        	selectedFlowName = contactFlowsTable.rows( indexes ).data()[0][0];
        	selectedFlowType = contactFlowsTable.rows( indexes ).data()[0][1];
            for (var i=0; i< contactFlows.length; i++) {
            	if(selectedFlowName == contactFlows[i].Name){
            		selectedFlowID = contactFlows[i].Id;
            		break;
            	}
            		
            }
        }
    } );
    
    contactFlowsTable2.on( 'select', function ( e, dt, type, indexes ) {
        if ( type === 'row' ) {
        	selectedFlowName2 = contactFlowsTable2.rows( indexes ).data()[0][0];
        	selectedFlowType2 = contactFlowsTable2.rows( indexes ).data()[0][1];
            for (var i=0; i< contactFlows2.length; i++) {
            	if(selectedFlowName2 == contactFlows2[i].Name){
            		selectedFlowID2 = contactFlows2[i].Id;
            		break;
            	}
            }
        }
    });
	
    $( "#dialog" ).dialog({
        autoOpen: false,
        modal: true
      });
    $("#contactFlowContentdialog").dialog({
        autoOpen: false,
        width: 800,
        modal: true,
        resizable: false,
        height: "auto"        
    });
    $('#dialogJSON').dialog({
        autoOpen: false,
        width: 800,
        height: "auto",
        modal: true
    });
    
    $( "#resultDialog").dialog({
        autoOpen: false,
        modal: true
    });
    $('#configDialog').dialog({
        autoOpen: false,
        width: 850,
        modal: true,
        resizable: false,
        height: "auto"        
    });
    $('#renameDialog').dialog({
        autoOpen: false,
        width: 800,
        height: "auto",
        modal: true
    });
    $('#updateFlowDialog').dialog({
        autoOpen: false,
        width: 2000,
        height: "auto",
        modal: true
    });

    $( "#confirmDialog" ).dialog({
        autoOpen: false,
        resizable: false,
        height: "auto",
        width: 400,
        modal: true,
        buttons: {
          "Yes": function() {
            $( this ).dialog( "close" );
            updateContactFlowDetails();
          },
          Cancel: function() {
            $( this ).dialog( "close" );
          }
        }
    });        
    $("#chkBackupAll").change(function() {
        if(this.checked)
            checkClearAll(1, true)
        else
        	checkClearAll(1, false)
    });    
    $("#chkBackupAll1").change(function() {
        if(this.checked)
            checkClearAll(2, true)
        else
        	checkClearAll(2, false)
    });
	
}

/*async function getInstanceNames(){
    let a = await describeInstance(dlgSourceAccessKey, dlgSourceSecretKey, dlgSourceRegion, dlgSourceInstance,1);
    let b = await describeInstance(dlgTargetAccessKey, dlgTargetSecretKey, dlgTargetRegion, dlgTargetInstance,2);
}*/

function getInstanceNames(){
	$('#sourceInstanceName').text(dlgSourceInstance) ;
	$('#targetInstanceName').text(dlgTargetInstance);
	$('#dlgSelectInstance').append($('<option>', {
	    value: 1,
	    text: dlgSourceInstance
	}));
	$('#dlgSelectInstance').append($('<option>', {
	    value: 2,
	    text: dlgTargetInstance
	}));
	
	/*describeInstance(dlgSourceAccessKey, dlgSourceSecretKey, dlgSourceRegion, dlgSourceInstance,1).then(
    		() => {
    			describeInstance(dlgTargetAccessKey, dlgTargetSecretKey, dlgTargetRegion, dlgTargetInstance,2);
    		}
		);*/
}

function backupContactFlows(listBox){
	var lb;
	if(listBox == 1)
		lb = contactFlowsTable;
	else
		lb = contactFlowsTable2

	var rowcollection =  lb.$(".chk:checked", {"page": "all"});
	//var flows = [];
	handleWindow(true, '');
	rowcollection.each(function(index,elem){
	    //flow.push($(elem).val());
		var flowId = $(elem).val();
		if(listBox == 1){
			backupContactFlow(dlgSourceAccessKey, dlgSourceSecretKey, dlgSourceRegion, dlgSourceInstance, dlgSourceBackupDDB, flowId, listBox);
		}else{
			backupContactFlow(dlgTargetAccessKey, dlgTargetSecretKey, dlgTargetRegion, dlgTargetInstance, dlgTargetBackupDDB, flowId, listBox);
		}
		if((rowcollection.length-1) == index)
			handleWindow(false, '');
	});	
	
}

async function backupContactFlow(accessKey, secretKey, region, instance, ddb, flowid, listBox){
	try{
		let cfDetails = await getFlow(accessKey, secretKey, region, instance, flowid);
		let a = await saveFlowInDDB(accessKey, secretKey, region, instance, ddb, flowid, cfDetails);
		console.log(a);
		//getFlow(accessKey, secretKey, region, instance, flowid)
			//.then(cfDetails )
	}catch(e){
		console.log(e)
	}
}

const saveFlowInDDB = (accessKey, secretKey, region, instance, ddb, flowid, cfDetails) =>{
	return new Promise((resolve,reject) =>{
		var p = setAWSConfig(accessKey, secretKey, region);
		var params = {TableName : ddb,
					  Key : {'flowId':flowid},
					  UpdateExpression: "set Arn = :cfArn, FlowName = :cfName, FlowDescription = :cfDescription, FlowType = :cfType, FlowContent = :cfContent",
					  ExpressionAttributeValues:{
					        ":cfArn":cfDetails.ContactFlow.Arn,
					        ":cfName":cfDetails.ContactFlow.Name,
					        ":cfDescription":cfDetails.ContactFlow.Description,
					        ":cfType":cfDetails.ContactFlow.Type,
					        ":cfContent":cfDetails.ContactFlow.Content
					    },
					    ReturnValues:"UPDATED_NEW"					  
					  };
		var docClient = new AWS.DynamoDB.DocumentClient();
		docClient.update(params, function (err, res) {
		    if (err) {
		         console.log("Error response: ", err);
		         reject(err);
		    } else {
		    	resolve(res);
		    }
	    });
	});
}  

const getFlow = (accessKey, secretKey, region, instance, flowid) =>{
	return new Promise((resolve,reject) =>{
		var p = setAWSConfig(accessKey, secretKey, region);
		var params = {InstanceId : instance, 'ContactFlowId' : flowid};
	    connect.describeContactFlow(params, function (err, res) {
		    if (err) {
		         console.log("Error response: ", err);
		         reject(err);
		    } else {
		    	resolve(res);
		    }
	    });
	});
} 


function checkClearAll(listBox, checkAll){
	var lb;
	if(listBox == 1)
		lb = contactFlowsTable;
	else
		lb = contactFlowsTable2
	lb.rows().every(function(index, element) {
		  var row = $(this.node());
		  $('input[type="checkbox"]', row).prop('checked', checkAll);
		});
}

function showResults(message){
	$('#resultSpan').text(message);
	$( "#resultDialog" ).dialog( "open" );
}

async function describeInstance(accessKey, secretKey, region, instance, type){
	var p = await setAWSConfig(accessKey, secretKey, region);
	var params = {InstanceId : instance};
	console.log(params);
    connect.describeInstance(params, function (err, res) {
		    if (err) {		    	
		         console.log("Error response: ", err);
		         showResults(err);
		    } else {
				console.log(res);
				if(type==1){
					$('#sourceInstanceName').text(res.Instance.InstanceAlias);
					$('#dlgSelectInstance').append($('<option>', {
					    value: 1,
					    text: res.Instance.InstanceAlias
					}));
				}
				else{
					$('#targetInstanceName').text(res.Instance.InstanceAlias);
					$('#dlgSelectInstance').append($('<option>', {
					    value: 2,
					    text: res.Instance.InstanceAlias
					}));
				}
		    }
    });
	
}

function fillContactFlowTables(tab){
	if(tab==1){
		contactFlowsTable.clear();
	    for (var i=0; i< contactFlows.length; i++) {
	        //var value = attributes[k].value;
	    	var value = contactFlows[i];
	    	var a = '<a href="" onclick="getContactFlowDetails(\'' + dlgSourceAccessKey + '\',\'' + dlgSourceSecretKey + '\',\'';  
	    	//a += dlgSourceRegion + '\',\'' +  dlgSourceInstance + '\',\'' +  value.Id + '\');return false;">Details</>';
	    	a += dlgSourceRegion + '\',\'' +  dlgSourceInstance + '\',\'' +  value.Id + '\');return false;">';
	    	a += 'Details' +'</>'
	    	//a += '<img src="images/openfolder.png" alt="Details">' +'</>'
	    	var b = '<a href="" onclick="handleRenameWindow(1,\'' + value.Name +'\');return false;">';
	    	b += 'Rename' +'</>'
	    	//b += '<img src="images/rename.png" alt="Rename">' +'</>'
	    	var c = '<input type="checkbox"  class="chk" value="' + value.Id +'">';
	    	var d = '<a href="" onclick="handlePushFlowWindow(\'' + value.Id +'\', \'' + value.Name +'\');return false;">';
	    	d += 'Promote</>'
	        contactFlowsTable.row.add([value.Name, value.ContactFlowType, a, b, d, c]);
	    }
	    contactFlowsTable.draw();
	}else{
		contactFlowsTable2.clear();
	    for (var i=0; i< contactFlows2.length; i++) {
	        //var value = attributes[k].value;
	    	var value = contactFlows2[i];
	    	var a = '<a href="" onclick="getContactFlowDetails(\'' + dlgTargetAccessKey + '\',\'' + dlgTargetSecretKey + '\',\'';  
	    	//a += dlgTargetRegion + '\',\'' +  dlgTargetInstance + '\',\'' +  value.Id + '\');return false;">Details</>';
	    	a += dlgTargetRegion + '\',\'' +  dlgTargetInstance + '\',\'' +  value.Id + '\');return false;">';
	    	a += 'Details' +'</>'
	    	//a += '<img src="images/openfolder.png" alt="Details">' +'</>'
	    	var b = '<a href="" onclick="handleRenameWindow(2,\'' + value.Name +'\');return false;">';
	    	b += 'Rename' +'</>'
	    	//b += '<img src="images/rename.png" alt="Rename">' +'</>'
	    	//var c = '<input type="checkbox"  class="chk" value="' + value.Id +'">';
	        contactFlowsTable2.row.add([value.Name, value.ContactFlowType, a, b]);
	    }
	    contactFlowsTable2.draw();
	}
}

function getNameFromFlow(content, id){
	
	for (var k in content.Metadata.ActionMetadata) {
		var obj = content.Metadata.ActionMetadata[k];
		if(k == id){
			try{
	    		if(obj.hasOwnProperty('promptName')){
	    			return obj.promptName;	
	    		}
			}catch(e){}
			try{
	    		if(obj.hasOwnProperty('contactFlow')){
	    			return obj.contactFlow.text;
	    		}
			}catch(e){}
    		if(obj.hasOwnProperty('queue')){
    			return obj.queue.text;
			
		}
	  }
	}
}

async function handlePushFlowWindow(flowId, flowName){
	$('#updateFlowName').val(flowName);
	handleWindow(true, '');
	let cfDetails = await getFlow(dlgSourceAccessKey, dlgSourceSecretKey, dlgSourceRegion, dlgSourceInstance, flowId);
	console.log(JSON.stringify(cfDetails));
	handleWindow(false, '');
	$( "#updateFlowDialog" ).dialog( "open" );
	updatedContactFlow = cfDetails.ContactFlow.Content;
	//updatedContactFlow = JSON.stringify(updatedContactFlow);

	var content = JSON.parse(JSON.parse(JSON.stringify(cfDetails.ContactFlow.Content)));
	$("#tblARNMapping").empty();
	var tbody = $('#tblARNMapping').children('tbody');
	var table = tbody.length ? tbody : $('#tblARNMapping');
	table.append("<tr><th>Source ARN</th><th>Target ARN</th><th>Type</th></tr>");
	for(var i=0; i < content.Actions.length; i++){
		var params;
		var objName = '';
		objName = getNameFromFlow(content, content.Actions[i].Identifier);
		if(objName ===undefined)
			objName = "";
		try{
    		if(content.Actions[i].Parameters.hasOwnProperty('PromptId')){			    			
    			params = {
    					   TableName: dlgSourceARNMapDDB,
    					   Key: {"sourceARN" : content.Actions[i].Parameters.PromptId}
    				};    			
    		}
		}catch(e){}
		try{
    		if(content.Actions[i].Parameters.hasOwnProperty('LambdaFunctionARN')){
    			var lambdaARN = content.Actions[i].Parameters.LambdaFunctionARN;
    			if(lambdaARN.startsWith("arn:aws:lambda")){
	    			params = {
	 					   TableName: dlgSourceARNMapDDB,
	 					   Key: {"sourceARN" : content.Actions[i].Parameters.LambdaFunctionARN}
	 				};    			
    			}
    		}
		}catch(e){}
		try{
    		if(content.Actions[i].Parameters.hasOwnProperty('QueueId')){
    			params = {
 					   TableName: dlgSourceARNMapDDB,
 					   Key: {"sourceARN" : content.Actions[i].Parameters.QueueId}
 				};    			
    		}
		}catch(e){}
		try{
			if(content.Actions[i].Parameters.hasOwnProperty('ContactFlowId')){
				var flow;
				flow = content.Actions[i].Parameters.ContactFlowId;
    			if(flow){
        			params = {
      					   TableName: dlgSourceARNMapDDB,
      					   Key: {"sourceARN" : flow}
      				};    			
    			}
			}
    		if(content.Actions[i].Parameters.hasOwnProperty('EventHooks')){
    			var flow;
    			if(content.Actions[i].Parameters.EventHooks.hasOwnProperty('CustomerRemaining'))
    				flow = content.Actions[i].Parameters.EventHooks.CustomerRemaining;
    			else if(content.Actions[i].Parameters.EventHooks.hasOwnProperty('AgentWhisper'))
    				flow = content.Actions[i].Parameters.EventHooks.AgentWhisper;
    			else if(content.Actions[i].Parameters.EventHooks.hasOwnProperty('CustomerQueue'))
    				flow = content.Actions[i].Parameters.EventHooks.CustomerQueue;
    			else if(content.Actions[i].Parameters.EventHooks.hasOwnProperty('AgentHold'))
    				flow = content.Actions[i].Parameters.EventHooks.AgentHold;
    			if(flow){
        			params = {
      					   TableName: dlgSourceARNMapDDB,
      					   Key: {"sourceARN" : flow}
      				};    			
    			}
    		}
		}catch(e){}
		
		if(params){
			let a = await getARNInfoFromDynamoDB(params);
			console.log(a);
			if(a){
				table.append("<tr><td>" + a.sourceARN + "</td><td>" + a.targetARN + "</td><td>" + objName + "</td></tr>");
				updatedContactFlow = updatedContactFlow.replace(new RegExp((a.sourceARN), 'g'), a.targetARN);
			}
		}
		params = null;
		//$("#tblARNMapping > tbody").append("<tr><td></td>" + a.Item.sourceARN + "<td>" + a.Item.targetARN + "</td><td>" + a.Item.ARNType + "</td></tr>");
    }
}

const getARNInfoFromDynamoDB =(params)=>{
  return new Promise((resolve,reject) =>{
	  var ddb = new AWS.DynamoDB.DocumentClient();
	  ddb.get(params, function(err, data) {
	  if (err) {
	    console.log("Error", err);
	    reject(err);
	  } else {
	    console.log("Success", data);
	    resolve(data.Item)
	  }
	});
  });
}


async function updateFlowDetails(){
	handleWindow(true, '');
	var flowId;
	var flowName = $('#updateFlowName').val(); 
    for (var i=0; i< contactFlows2.length; i++) {
    	if(flowName == contactFlows2[i].Name){
    		flowId = contactFlows2[i].Id;
    		break;
    	}
    }
    if(flowId == null){
    	handleWindow(false, '');
    	$( "#confirmDialog" ).dialog('open');
    }else{
    	let a = await updateContactFlowToNewEnv(flowId);
    	console.log(a);
    	handleWindow(false, '');
    }
}

async function updateContactFlowDetails(){
	handleWindow(true, '');
	try{
		var flowId, flowType;
		var flowName = $('#updateFlowName').val(); 
	    for (var i=0; i< contactFlows.length; i++) {
	    	if(flowName == contactFlows[i].Name){
	    		flowId = contactFlows[i].Id;
	    		flowType = contactFlows[i].ContactFlowType;
	    		flowDescription = contactFlows[i].Id;
	    		break;
	    	}
	    }
		let resp = await saveFlow(dlgTargetAccessKey, dlgTargetSecretKey, dlgTargetRegion, dlgTargetInstance,flowName,flowType,"",updatedContactFlow);
		console.log(resp);
		getContactFlows2();
		handleWindow(false, '');			
		
	}catch(e){
		handleWindow(false, '');			
		showResults(e);
	}
}

const updateContactFlowToNewEnv = (flowId) =>{
  return new Promise((resolve,reject) =>{
	var p = setAWSConfig(dlgTargetAccessKey, dlgTargetSecretKey, dlgTargetRegion);
	var rep = '\"';
	updatedContactFlow = updatedContactFlow.replace(/\\"/g, rep);

	var params = {InstanceId : dlgTargetInstance, 'ContactFlowId' : flowId, 'Content' : updatedContactFlow};	
    connect.updateContactFlowContent(params, function (err, res) {
        console.log(params);
		    if (err) {
		         console.log("Error response: ", err);
		         handleWindow(false, '');
		         showResults(err);
		    } else {
		    	handleWindow(false, '');
				console.log("Response JSON : ", JSON.stringify(res));
		    }
		        
    });
  });

}

function handleRenameWindow(selectedInstanceId, flowName){
	renameFlowInstanceId = selectedInstanceId;
	$('#dlgOldName').val(flowName);
	
	$( "#renameDialog" ).dialog( "open" );
}



function loadConnectAPIs(){
	/*var Service = AWS.Service;
	var apiLoader = AWS.apiLoader;
	apiLoader.services['connect'] = {};
	AWS.Connect = Service.defineService('connect', ['2017-08-08']);
	Object.defineProperty(apiLoader.services['connect'], '2017-08-08', {
	    get: function get() {
	        var model = connectServiceJSON;
	        model.paginators = {};
	        return model;
	    },
	    enumerable: true,
	    configurable: true
	});*/
	connect = new AWS.Connect();
}


async function getContactFlows(){
	var p = await setAWSConfig(dlgSourceAccessKey, dlgSourceSecretKey, dlgSourceRegion);
	
	var params = {InstanceId : dlgSourceInstance};
    connect.listContactFlows(params, function (err, res) {
        console.log("we are about to get flows");
        console.log(params);
		    if (err) {
		         console.log("Error response: ", err);
		         showResults(err);
		    } else {
				console.log(res);
				formatJSON(res, '#instancesFormatted');
				contactFlows = res.ContactFlowSummaryList;
				fillContactFlowTables(1);
				getContactFlows2();
		    }
    });
}

async function getContactFlows2(){
	var p = await setAWSConfig(dlgTargetAccessKey, dlgTargetSecretKey, dlgTargetRegion);
	
	var params = {InstanceId : dlgTargetInstance};
    connect.listContactFlows(params, function (err, res) {
        console.log(params);
		    if (err) {
		         console.log("Error response: ", err);
		         showResults(err);
		    } else {
				console.log(res);
				formatJSON(res, '#instancesFormatted2');
				contactFlows2 = res.ContactFlowSummaryList;
				fillContactFlowTables(2);
		    }
    });
}


async function changeContactFlowName(){
	handleWindow(true, '');
	var name = $('#dlgNewName').val();
	var params ;
	if(renameFlowInstanceId == 1){
		var p = await setAWSConfig(dlgSourceAccessKey, dlgSourceSecretKey, dlgSourceRegion);
		params = {InstanceId : dlgSourceInstance, 'ContactFlowId' : selectedFlowID, 'Name' : name};
	}
	else{
		var p = await setAWSConfig(dlgTargetAccessKey, dlgTargetSecretKey, dlgTargetRegion);
		params = {InstanceId : dlgTargetInstance, 'ContactFlowId' : selectedFlowID2, 'Name' : name};
	}
    connect.updateContactFlowName(params, function (err, res) {
        console.log(params);
		    if (err) {
		         console.log("Error response: ", err);
		         handleWindow(false, '');
		         showResults(err);
		    } else {
				console.log("Response JSON : ", JSON.stringify(res));
				if(renameFlowInstanceId == 1)
					getContactFlows();
				else
					getContactFlows2();
				handleWindow(false, '');
		    }
    });
}

function handleWindow(openClose, text){
	if(openClose == true)
		$( "#dialog" ).dialog( "open" );
	else
		$( "#dialog" ).dialog( "close" );

}
async function getContactFlowDetails(accessKey, secretKey, region, instance, flow){
	var p = await setAWSConfig(accessKey, secretKey, region);
	handleWindow(true, '');
	var params = {InstanceId : instance, 'ContactFlowId' : flow};
    connect.describeContactFlow(params, function (err, res) {
        console.log(params);
		    if (err) {
		         console.log("Error response: ", err);
		         handleWindow(false, '');
		         showResults(err);
		    } else {
		    	console.log(res);
				console.log(JSON.stringify(res));
		    	handleWindow(false, '');
		    	console.log(res);
		    	var t = JSON.parse(res.ContactFlow.Content);
		    	formatJSON(t, '#instancesFormatted');
		    	$( "#dialogJSON" ).dialog( "open" );
		    }
    });
}


async function createContactFlow(){
	handleWindow(true, '');
	var dlgSelectInstance = $('#dlgSelectInstance').val();
	var dlgContactFlowName = $('#dlgContactFlowName').val();
	var dlgContactFlowType = $('#dlgContactFlowType').val();
	var dlgContactFlowDescription = $('#dlgContactFlowDescription').val();
	var contactFlowJSON = $('#contactFlowJSON').val();
	if(dlgSelectInstance == 1){
	    saveFlow(dlgSourceAccessKey, dlgSourceSecretKey, dlgSourceRegion, dlgSourceInstance,dlgContactFlowName,dlgContactFlowType,dlgContactFlowDescription,contactFlowJSON ).then(
	    		(resp) => {
	    			console.log(resp);
	    			getContactFlows();
	    			handleWindow(false, '');
	    		},
	    		(error) => {
	    			console.log(error);
	    			handleWindow(false, '');
	    			showResults(error);
	    		});
			
	}else{
		try{
			let resp = await saveFlow(dlgTargetAccessKey, dlgTargetSecretKey, dlgTargetRegion, dlgTargetInstance,dlgContactFlowName,dlgContactFlowType,dlgContactFlowDescription,contactFlowJSON);
			console.log(resp);
			getContactFlows2();
			handleWindow(false, '');			
		}catch(e){
			handleWindow(false, '');
			showResults(e);
		}
	}
	
 }


const saveFlow = (accessKey, secretKey, region, instanceId, flowName, flowType, description, content) =>{
	return new Promise((resolve,reject) =>{
	   var p = setAWSConfig(accessKey, secretKey, region);
		var rep = '\"';
		content = content.replace(/\\"/g, rep);

       var params = {InstanceId : instanceId, 'Name' : flowName, 'Type' : flowType, 'Description' :  description, 'Content' : content};       
       console.log(params);
	   connect.createContactFlow(params, function (err, res) {        
		    if (err) 
		         reject(err);
		     else 
				resolve(res);
	    });
	});
}

async function setAWSConfig(accessKey, secretKey, region){
	return new Promise((resolve, reject) => {
		AWS.config.update({
	        accessKeyId: accessKey, secretAccessKey: secretKey, region: region
	    });
		loadConnectAPIs();
	    resolve();
	});
}

function formatJSON(data, element){
	$(element).html(prettyPrintJson.toHtml(data));
}

function saveCookie(){
	dlgSourceAccessKey=$("#dlgSourceAccessKey").val();
	dlgSourceSecretKey=$("#dlgSourceSecretKey").val();
	dlgSourceInstance=$("#dlgSourceInstance").val();
	dlgSourceRegion=$("#dlgSourceRegion").val();
	dlgSourceBackupDDB=$("#dlgSourceBackupDDB").val();
	dlgSourceARNMapDDB=$("#dlgSourceARNMapDDB").val();
	
	dlgTargetAccessKey=$("#dlgTargetAccessKey").val();
	dlgTargetSecretKey=$("#dlgTargetSecretKey").val();
	dlgTargetInstance=$("#dlgTargetInstance").val();
	dlgTargetRegion=$("#dlgTargetRegion").val();
	if(checkAllMandatoryFields()){
		setCookie("dlgSourceAccessKey", dlgSourceAccessKey,100);
		setCookie("dlgSourceSecretKey", dlgSourceSecretKey,100 );
		setCookie("dlgSourceInstance", dlgSourceInstance,100);
		setCookie("dlgSourceRegion", dlgSourceRegion,100);
		setCookie("dlgSourceBackupDDB", dlgSourceBackupDDB,100);
		setCookie("dlgSourceARNMapDDB", dlgSourceARNMapDDB,100);
		
		setCookie("dlgTargetAccessKey", dlgTargetAccessKey,100);
		setCookie("dlgTargetSecretKey", dlgTargetSecretKey,100);
		setCookie("dlgTargetInstance", dlgTargetInstance,100);
		setCookie("dlgTargetRegion", dlgTargetRegion,100);
		$('#spnAWSMessage').text('');
		return true;
	}else{
		$('#spnAWSMessage').text('All fields are mandatory and cannot be whitespaces or null');		
		return false;
	}
}

function getCookie(c_name)
{
	var i,x,y,ARRcookies=document.cookie.split(";");
	for (i=0;i<ARRcookies.length;i++)
    {
	  x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
	  y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
	  x=x.replace(/^\s+|\s+$/g,"");
	  if (x==c_name)
	    {
		  return unescape(y);
	    }
	 }
}

function setCookie(c_name,value,exdays)
{
	var exdate=new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=c_name + "=" + c_value;
}

function checkCookie()
{
	dlgSourceAccessKey=getCookie("dlgSourceAccessKey");
	dlgSourceSecretKey=getCookie("dlgSourceSecretKey");
	dlgSourceInstance=getCookie("dlgSourceInstance");
	dlgSourceRegion=getCookie("dlgSourceRegion");
	dlgSourceBackupDDB=getCookie("dlgSourceBackupDDB");
	dlgSourceARNMapDDB=getCookie("dlgSourceARNMapDDB");
	
	dlgTargetAccessKey=getCookie("dlgTargetAccessKey");
	dlgTargetSecretKey=getCookie("dlgTargetSecretKey");
	dlgTargetInstance=getCookie("dlgTargetInstance");
	dlgTargetRegion=getCookie("dlgTargetRegion");
	dlgTargetBackupDDB=getCookie("dlgTargetBackupDDB");
	
	$('#dlgSourceAccessKey').val(dlgSourceAccessKey);
	$('#dlgSourceSecretKey').val(dlgSourceSecretKey);
	$('#dlgSourceInstance').val(dlgSourceInstance);
	$('#dlgSourceRegion').val(dlgSourceRegion);
	$('#dlgSourceBackupDDB').val(dlgSourceBackupDDB);
	$('#dlgSourceARNMapDDB').val(dlgSourceARNMapDDB);
	
	$('#dlgTargetAccessKey').val(dlgTargetAccessKey);
	$('#dlgTargetSecretKey').val(dlgTargetSecretKey);
	$('#dlgTargetInstance').val(dlgTargetInstance);
	$('#dlgTargetRegion').val(dlgTargetRegion);
	return checkAllMandatoryFields();
}

function checkAllMandatoryFields(){
	if(isBlank(dlgSourceAccessKey) || dlgSourceAccessKey.isEmpty() || 
			isBlank(dlgSourceSecretKey) || dlgSourceSecretKey.isEmpty() || 
			isBlank(dlgSourceInstance) || dlgSourceInstance.isEmpty() ||
			isBlank(dlgSourceRegion) || dlgSourceRegion.isEmpty() ||
			isBlank(dlgSourceBackupDDB) || dlgSourceBackupDDB.isEmpty() ||
			isBlank(dlgSourceARNMapDDB) || dlgSourceARNMapDDB.isEmpty() ||
			isBlank(dlgTargetAccessKey) || dlgTargetAccessKey.isEmpty() || 
			isBlank(dlgTargetSecretKey) || dlgTargetSecretKey.isEmpty() || 
			isBlank(dlgTargetInstance) || dlgTargetInstance.isEmpty() ||
			isBlank(dlgTargetRegion) || dlgTargetRegion.isEmpty()  			
			){
		return false;
	}else
		return true;
}


function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

String.prototype.isEmpty = function() {
    return (this.length === 0 || !this.trim());
};

function replaceAll(str, find, replace) {
	  return str.replace(new RegExp(find, 'g'), replace);
}
