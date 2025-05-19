<?php
	$inData = getRequestInfo();
	
	// Get required parameters from the request
	$ID = $inData["ID"];  // ID of the contact to delete
	$userID = $inData["userID"];  // ID of the user who owns the contact

	// Connect to the database
	$conn = new mysqli("localhost", "rolodexitApp", "rolodexitPassword123", "RolodexitDB");
	if ($conn->connect_error) 
	{
		returnWithError($conn->connect_error);
	} 
	else
	{
		// Prepare the SQL statement to delete a contact
		// The WHERE clause includes userID to ensure users can only delete their own contacts
		$stmt = $conn->prepare("DELETE FROM UserContacts WHERE ID = ? AND userID = ?");
		$stmt->bind_param("ii", $ID, $userID);
		$stmt->execute();
		
		// Check if any rows were affected (if the contact was found and deleted)
		if ($stmt->affected_rows > 0)
		{
			returnWithSuccess();
		}
		else
		{
			// If no rows were affected, either the contact doesn't exist or doesn't belong to this user
			returnWithError("Contact not found or you don't have permission to delete it");
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