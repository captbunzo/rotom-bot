
ALTER TABLE trainer
    DROP COLUMN about_me;
    
ALTER TABLE trainer
    CHANGE name trainer_name varchar(32) NULL DEFAULT NULL;

ALTER TABLE trainer
    ADD COLUMN first_name VARCHAR(32) NULL DEFAULT NULL
    AFTER trainer_name;

ALTER TABLE trainer
    RENAME COLUMN id TO discord_id;

ALTER TABLE battle
    RENAME COLUMN host_trainer_id TO host_discord_id;

ALTER TABLE battle_member
    RENAME COLUMN trainer_id TO discord_id;
