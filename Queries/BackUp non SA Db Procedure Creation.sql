USE  master
GO 

IF(exists(SELECT name from sys.procedures WHERE name ='sp_backup_NonSA_Databases'))
	DROP PROCEDURE sp_backup_NonSA_Databases
GO

CREATE PROC sp_backup_NonSA_Databases AS
DECLARE @id int = (select min( database_id)  FROM sys.databases
                   WHERE owner_sid != 0x01 )
DECLARE @max_id int = (select max( database_id)  FROM sys.databases
                   WHERE owner_sid != 0x01 )
DECLARE @db_name nvarchar(50)

WHILE (@id <= @max_id)
BEGIN
	set @db_name = 
		(SELECT name FROM sys.databases 
		WHERE  @id = database_id)
		
	IF @db_name is not null 
	BEGIN
		exec sp_backupDatabase @db_name, NULL
	END 
	SET @id = @id+1;
END
EXEC sys.sp_MS_marksystemobject sp_backup_NonSA_Databases
GO  











