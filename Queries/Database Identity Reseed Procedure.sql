USE master
GO
IF(exists(SELECT name from sys.procedures WHERE name ='sp_ReseedTableIdentity'))
	DROP PROCEDURE sp_ReseedTableIdentity
GO
IF(exists(SELECT name from sys.procedures WHERE name ='usp_ReseedTableIdentity'))
	DROP PROCEDURE usp_ReseedTableIdentity
GO

CREATE PROC sp_ReseedTableIdentity AS
IF(Exists(SELECT DB_ID()
	      WHERE DB_ID() NOT IN(SELECT database_id FROM sys.databases 
							   WHERE owner_sid = 0x01 )))
	BEGIN
		Exec sp_MSforeachtable 'DBCC CHECKIDENT("?", RESEED, 0)'
		EXEC sys.sp_MS_marksystemobject sp_ReseedTableIdentity 
	END
ELSE
	SELECT 'Database ' + (SELECT DB_NAME())+ ' can not have identity reseeded.'

GO




