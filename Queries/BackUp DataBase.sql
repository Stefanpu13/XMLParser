USE master
GO


IF(exists(SELECT name from sys.procedures WHERE name ='sp_backupDatabase'))
	DROP PROCEDURE sp_backupDataBase
GO

CREATE PROC sp_backupDatabase(@db_name nvarchar(50), @db_path nvarchar(256)) AS
DECLARE @full_path nvarchar(256) = case when @db_path is null then ''
                                      else @db_path end +
									  @db_name
declare @backup_name nvarchar(100) = @db_name + '-Full Database Backup'
BACKUP DATABASE @db_name TO  
DISK = @full_path
 WITH NOFORMAT, NOINIT,  NAME = @backup_name, SKIP, NOREWIND, NOUNLOAD,  STATS = 10
 EXEC sys.sp_MS_marksystemobject sp_backupDatabase 
GO
