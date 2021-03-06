USE [MovingObjects]
GO
/****** Object:  Table [dbo].[Game]    Script Date: 31.3.2014 г. 16:36:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Game](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](50) NOT NULL,
	[PlayerId] [int] NOT NULL,
	[Date] [datetime] NOT NULL,
 CONSTRAINT [PK_Game] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[GameObject]    Script Date: 31.3.2014 г. 16:36:41 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[GameObject](
	[ObjectId] [int] NOT NULL,
	[X] [float] NOT NULL,
	[Y] [float] NOT NULL,
	[XDirection] [float] NOT NULL,
	[YDirection] [nvarchar](20) NOT NULL,
	[GameId] [int] NOT NULL,
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Color] [nvarchar](50) NOT NULL,
 CONSTRAINT [PK_GameObject] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[GameState]    Script Date: 31.3.2014 г. 16:36:41 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[GameState](
	[Score] [int] NOT NULL,
	[GameLevel] [nvarchar](20) NOT NULL,
	[GameDifficulty] [nvarchar](20) NOT NULL,
	[GameSpeed] [nvarchar](20) NOT NULL,
	[Bonuses] [int] NOT NULL,
	[Restarts] [int] NOT NULL,
	[GameId] [int] NOT NULL,
 CONSTRAINT [PK_GameState] PRIMARY KEY CLUSTERED 
(
	[GameId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[Highscore]    Script Date: 31.3.2014 г. 16:36:41 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Highscore](
	[PlayerId] [int] NOT NULL,
	[GameDifficulty] [nvarchar](20) NOT NULL,
	[GameSpeed] [nvarchar](20) NOT NULL,
	[Score] [int] NOT NULL,
 CONSTRAINT [PK_Highscore] PRIMARY KEY CLUSTERED 
(
	[GameDifficulty] ASC,
	[GameSpeed] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[Player]    Script Date: 31.3.2014 г. 16:36:41 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Player](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[UserName] [nvarchar](50) NOT NULL,
	[Password] [nvarchar](100) NOT NULL,
 CONSTRAINT [PK_Player] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
ALTER TABLE [dbo].[Game]  WITH CHECK ADD  CONSTRAINT [FK_Game_Player] FOREIGN KEY([PlayerId])
REFERENCES [dbo].[Player] ([Id])
GO
ALTER TABLE [dbo].[Game] CHECK CONSTRAINT [FK_Game_Player]
GO
ALTER TABLE [dbo].[GameObject]  WITH CHECK ADD  CONSTRAINT [FK_GameObject_Game] FOREIGN KEY([GameId])
REFERENCES [dbo].[Game] ([Id])
GO
ALTER TABLE [dbo].[GameObject] CHECK CONSTRAINT [FK_GameObject_Game]
GO
ALTER TABLE [dbo].[GameState]  WITH CHECK ADD  CONSTRAINT [FK_GameState_Game] FOREIGN KEY([GameId])
REFERENCES [dbo].[Game] ([Id])
GO
ALTER TABLE [dbo].[GameState] CHECK CONSTRAINT [FK_GameState_Game]
GO
ALTER TABLE [dbo].[Highscore]  WITH CHECK ADD  CONSTRAINT [FK_Highscore_Player] FOREIGN KEY([PlayerId])
REFERENCES [dbo].[Player] ([Id])
GO
ALTER TABLE [dbo].[Highscore] CHECK CONSTRAINT [FK_Highscore_Player]
GO
