USE Northwind
GO

IF(exists(SELECT name from sys.procedures WHERE name ='usp_FindTotalIncome'))
	DROP PROCEDURE usp_FindTotalIncome
GO

CREATE PROC dbo.usp_FindTotalIncome(
@supplierName nvarchar(50), @startDate datetime, @endDate datetime, @totalIncome money output)
as

IF(@endDate < @startDate)
BEGIN
	DECLARE @tempDate datetime = @endDate
	SET @endDate = @startDate
	SET @startDate = @tempDate
END

SELECT @totalIncome = SUM(totalIncomes)FROM
	(SELECT SUM(CAST( od.UnitPrice * Quantity - Discount AS money)) AS totalIncomes, od.OrderID, s.ContactName, o.OrderDate 
	FROM Orders o, [Order Details] od, Products p, Suppliers s
	where o.OrderID =od.OrderID AND od.ProductID = od.ProductID AND p.SupplierID = s.SupplierID
	GROUP BY p.SupplierID, s.ContactName, od.OrderID, o.OrderDate) AS DailyIncomes
GROUP BY ContactName, DailyIncomes.OrderDate 
HAVING ContactName = @supplierName AND OrderDate BETWEEN @startDate AND @endDate
GO

DECLARE @totalIncome money
EXEC usp_FindTotalIncome 'Charlotte Cooper', '07.11.1997', '08.17.2003', @totalIncome OUTPUT
SELECT 'Result', @totalIncome
GO	