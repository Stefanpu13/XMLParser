--SELECT e.FirstName + ' '+e.LastName FROM Employees e
--SELECT (SUM( UnitPrice * Quantity *(1 - Discount))) as [Order Total], (e.FirstName + ' '+ e.LastName) as [Employee Name] FROM [Order Details] od
--JOIN Orders o
--ON o.OrderID = od.OrderID
--JOIN Employees e
--ON o.EmployeeID = e.EmployeeID 
--GROUP BY e.FirstName, e.LastName
 

-- Gets name and total of orders of the employee with max total.

--SELECT TOP(1)  CAST(SUM( UnitPrice * Quantity *(1 - Discount))AS money) AS [Order Total], 
--(e.FirstName + ' '+ e.LastName) as [Employee Name] 
--FROM [Order Details] od
--JOIN Orders o
--ON o.OrderID = od.OrderID
--JOIN Employees e
--ON o.EmployeeID = e.EmployeeID 
--GROUP BY e.FirstName, e.LastName
--ORDER BY [Order Total] DESC 

-- Get ONLY THE NAME.
