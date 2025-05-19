<?php
	$inData = getRequestInfo();
	
	// Get all required fields from the request
	$firstName = $inData["firstName"];
	$lastName = $inData["lastName"];
	$email = $inData["email"];
	$phoneNumber = $inData["phoneNumber"];
	$userID = $inData["userID"]; 

	// Connect to the database
	$conn = new mysqli("localhost", "rolodexitApp", "rolodexitPassword123", "RolodexitDB");
	if ($conn->connect_error) 
	{
		returnWithError($conn->connect_error);
	} 
	else
	{
		// Prepare the SQL statement to insert a new contact
		$stmt = $conn->prepare("INSERT INTO UserContacts (firstName, lastName, email, phoneNumber, userID) VALUES (?, ?, ?, ?, ?)");
		$stmt->bind_param("ssssi", $firstName, $lastName, $email, $phoneNumber, $userID);
		
		// Execute the statement
		if($stmt->execute())
		{
			// Get the ID of the newly created contact
			$newContactId = $conn->insert_id;
			returnWithSuccess($newContactId);
		}
		else
		{
			returnWithError($stmt->error);
		}
		
		$stmt->close();
		$conn->close();
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson($obj)
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
	function returnWithError($err)
	{
		$retValue = '{"ID":0,"error":"' . $err . '"}';  
		sendResultInfoAsJson($retValue);
	}
	
	function returnWithSuccess($id)
	{
		$retValue = '{"ID":' . $id . ',"error":""}';
		sendResultInfoAsJson($retValue);
	}
?>