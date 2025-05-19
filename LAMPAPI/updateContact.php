<?php
	$inData = getRequestInfo();
	
	// Get all parameters from the request
	$ID = $inData["ID"];
	$firstName = $inData["firstName"];
	$lastName = $inData["lastName"];
	$email = $inData["email"];
	$phoneNumber = $inData["phoneNumber"];
	$userID = $inData["userID"];  // To verify the contact belongs to this user

	$conn = new mysqli("localhost", "rolodexitApp", "rolodexitPassword123", "RolodexitDB");
	if ($conn->connect_error) 
	{
		returnWithError($conn->connect_error);
	} 
	else
	{
		// Prepare update statement with security check (userID)
		$stmt = $conn->prepare("UPDATE UserContacts SET firstName=?, lastName=?, email=?, phoneNumber=? WHERE ID=? AND userID=?");
		$stmt->bind_param("ssssii", $firstName, $lastName, $email, $phoneNumber, $ID, $userID);
		$stmt->execute();
		
		// Check if a row was actually updated
		if ($stmt->affected_rows > 0)
		{
			returnWithSuccess();
		}
		else
		{
			// No rows affected could mean the contact doesn't exist or doesn't belong to this user
			returnWithError("Contact not found or you don't have permission to update it");
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
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson($retValue);
	}
	
	function returnWithSuccess()
	{
		$retValue = '{"success":true,"error":""}';
		sendResultInfoAsJson($retValue);
	}
?>