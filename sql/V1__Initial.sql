create table events (
      ID UUID not null,
      TYPE varchar(100) not null,
  	INFO jsonb not null,
  	TIMESTAMP BIGINT NOT NULL
  );