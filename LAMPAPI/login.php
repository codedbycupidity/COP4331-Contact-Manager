<?php

    $inData = getRequestInfo();
    
    $id = 0;
    $firstName = "";
    $lastName = "";
    $email = "";

    $conn = new mysqli("localhost", "rolodexitApp", "rolodexitPassword123", "RolodexitDB");     
    if($conn->connect_error)
    {
        returnWithError($conn->connect_error);
    }
    else
    {
        // Hash the password with MD5 before comparing
        $hashedPassword = md5($inData["password"]);
        
        $stmt = $conn->prepare("SELECT ID, firstName, lastName, email FROM RegisteredUsers WHERE loginName=? AND password=?");
        $stmt->bind_param("ss", $inData["login"], $hashedPassword);
        $stmt->execute();
        $result = $stmt->get_result();

        if($row = $result->fetch_assoc())
        {
            returnWithInfo($row['firstName'], $row['lastName'], $row['email'], $row['ID']);
        }
        else
        {
            returnWithError("Invalid Username or Password");
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
        $retValue = '{"id":0,"firstName":"","lastName":"","email":"","error":"' . $err . '"}';
        sendResultInfoAsJson($retValue);
    }
    
    function returnWithInfo($firstName, $lastName, $email, $id)
    {
        $retValue = '{"id":' . $id . ',"firstName":"' . $firstName . '","lastName":"' . $lastName . '","email":"' . $email . '","error":""}';
        sendResultInfoAsJson($retValue);
    }
    
?>