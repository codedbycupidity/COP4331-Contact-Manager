<?php
	$inData = getRequestInfo();
	
	// Get registration information from the request
	$firstName = $inData["firstName"];
	$lastName = $inData["lastName"];
	$loginName = $inData["loginName"];
	$email = $inData["email"];
	$password = $inData["password"];
	
	// Default values for optional fields
	$emailVerified = 0; // Not verified by default
	$verificationToken = NULL; // No token set initially
	
	$conn = new mysqli("localhost", "rolodexitApp", "rolodexitPassword123", "RolodexitDB");
	if ($conn->connect_error) 
	{
		returnWithError($conn->connect_error);
	} 
	else
	{
		// First, check if the username (loginName) is already taken
		$stmt = $conn->prepare("SELECT ID FROM RegisteredUsers WHERE loginName = ?");
		$stmt->bind_param("s", $loginName);
		$stmt->execute();
		$result = $stmt->get_result();
		
		if($result->num_rows > 0)
		{
			// Username already exists
			$stmt->close();
			$conn->close();
			returnWithError("Username already taken");
			return;
		}
		
		$stmt->close();
		
		// Next, check if the email is already registered
		$stmt = $conn->prepare("SELECT ID FROM RegisteredUsers WHERE email = ?");
		$stmt->bind_param("s", $email);
		$stmt->execute();
		$result = $stmt->get_result();
		
		if($result->num_rows > 0)
		{
			// Email already exists
			$stmt->close();
			$conn->close();
			returnWithError("Email already registered");
			return;
		}
		
		$stmt->close();
		
		// Hash the password
		$hashedPassword = md5($password);
		
		// All checks passed, insert the new user
		$stmt = $conn->prepare("INSERT INTO RegisteredUsers (firstName, lastName, loginName, email, password, emailVerified, verificationToken) VALUES (?, ?, ?, ?, ?, ?, ?)");
		$stmt->bind_param("sssssss", $firstName, $lastName, $loginName, $email, $hashedPassword, $emailVerified, $verificationToken);
		
		if($stmt->execute())
		{
			// Registration successful
			$newUserID = $conn->insert_id;
			returnWithSuccess($newUserID);
		}
		else
		{
			// Something went wrong with the insertion
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