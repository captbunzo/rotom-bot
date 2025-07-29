
ALTER TABLE trainer
    DROP COLUMN about_me;
    
ALTER TABLE trainer
    CHANGE name trainer_name varchar(32);

ALTER TABLE trainer
    ADD COLUMN first_name VARCHAR(32) NULL DEFAULT NULL
    AFTER trainer_name;
