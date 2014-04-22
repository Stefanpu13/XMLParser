--SELECT m.FirstName , m.LastName
--FROM  Employees m
--WHERE  5 = (SELECT COUNT(e.EmployeeID) 
--            FROM Employees e
--            WHERE m.EmployeeID=e.ManagerID)
--ORDER BY m.FirstName ,m.LastName 

--SELECT LastName FROM Employees
--WHERE LEN(LastName) =5 
--ORDER BY LastName

--SELECT FORMAT( GETDATE(),'dd.MM.yyyy mm:ss:fff')

--SELECT AVG(e.Salary) as [Average Salary], d.Name as Department , e.JobTitle FROM Employees e
--JOIN Departments d
--on d.DepartmentID=e.DepartmentID 
--GROUP BY d.Name,e.JobTitle
--ORDER BY d.Name

--SELECT FirstName,LastName, d.Name AS Department,e.JobTitle ,Salary
--FROM Employees e
--JOIN  Departments d
--ON e.DepartmentID = d.DepartmentID 
--WHERE Salary =
--	(SELECT MIN(Salary) FROM Employees	
--	 WHERE e.DepartmentID = Employees.DepartmentID
--	)
						   
--ORDER BY Salary

-----------------------


 --SELECT Name FROM Towns              
 --WHERE TownID = 
	--	(SELECT TOP(1) T.TownID 
	--	 FROM (SELECT TownID, COUNT(TownID)  AS EmployeeCount
	--		   FROM Addresses	   
	--		   GROUP BY TownID) AS T
	--	 ORDER BY EmployeeCount
	--	 DESC)


		
	--SELECT Name from Towns
	--WHERE TownID =
	--	(SELECT a.TownID FROM
	--		(SELECT MAX(T.employeeCount) as [Max Employee Count] FROM 
	--			(SELECT TownID, COUNT(TownID) as employeeCount FROM Addresses
	--			GROUP BY TownID) as T) as TMax, Addresses a
	--		GROUP BY TMax.[Max Employee Count], a.TownID
	--		HAVING COUNT(a.TownID) = TMax.[Max Employee Count])


--SELECT Name from Towns		  
--WHERE TownID = 
--	(SELECT Addresses.TownID FROM Addresses
--	GROUP BY Addresses.TownID
--	HAVING COUNT(Addresses.TownID) >=ALL
--		(SELECT COUNT(Addresses.TownID) FROM Addresses
--		GROUP BY Addresses.TownID)
--	)

---------------------

--SELECT DISTINCT m.EmployeeID FROM Employees e
--JOIN Employees m 
--ON e.ManagerID = m.EmployeeID

SELECT COUNT(DISTINCT(m.EmployeeID)) FROM Employees e
JOIN Employees m 
ON e.ManagerID = m.EmployeeID
JOIN Addresses 
ON Addresses.AddressID = e.AddressID
--JOIN Towns 
--ON Towns.TownID = Addresses.AddressID
--GROUP BY Towns.Name
GROUP BY Addresses.TownID


 