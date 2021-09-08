--
-- This migration introduces subscriptions enabled for accounts
--

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('97');

CREATE TABLE IF NOT EXISTS accountSubscriptions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  uid BINARY(16) NOT NULL,
  productName VARCHAR(191), -- TBD pending subhub docs & integration
  subscriptionId VARCHAR(191), -- TBD pending subhub docs & integration
  createdAt BIGINT SIGNED NOT NULL,
  UNIQUE KEY accountSubscriptionsSubscriptionIdUnique(subscriptionId),
  UNIQUE INDEX accountSubscriptionsUnique(uid, productName, subscriptionId)
) ENGINE=InnoDB;

CREATE PROCEDURE `createAccountSubscription_1` (
  IN inUid BINARY(16),
  IN inSubscriptionId VARCHAR(191),
  IN inProductName VARCHAR(191),
  IN inCreatedAt BIGINT SIGNED
)
BEGIN

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  SET @accountCount = 0;

  -- Signal error if no user found
  SELECT COUNT(*) INTO @accountCount FROM accounts WHERE uid = inUid;
  IF @accountCount = 0 THEN
    SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 1643, MESSAGE_TEXT = 'Can not create subscription for unknown user.';
  END IF;

  INSERT INTO accountSubscriptions(
    uid,
    subscriptionId,
    productName,
    createdAt
  )
  VALUES (
    inUid,
    inSubscriptionId,
    inProductName,
    inCreatedAt
  );

  COMMIT;
END;

CREATE PROCEDURE `deleteAccountSubscription_1` (
  IN inUid BINARY(16),
  IN inSubscriptionId VARCHAR(191)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  DELETE FROM accountSubscriptions
  WHERE
    uid = inUid
  AND
    subscriptionId = inSubscriptionId;

  COMMIT;
END;

CREATE PROCEDURE `getAccountSubscription_1` (
  IN inUid BINARY(16),
  IN inSubscriptionId VARCHAR(191)
)
BEGIN
  SELECT
    asi.uid,
    asi.subscriptionId,
    asi.productName,
    asi.createdAt
  FROM accountSubscriptions asi
  WHERE
    asi.uid = inUid
  AND
    asi.subscriptionId = inSubscriptionId;
END;

CREATE PROCEDURE `fetchAccountSubscriptions_1` (
  IN inUid BINARY(16)
)
BEGIN
  SELECT
    asi.uid,
    asi.subscriptionId,
    asi.productName,
    asi.createdAt
  FROM accountSubscriptions asi
  WHERE
    asi.uid = inUid
  ORDER BY
    asi.createdAt asc;
END;

CREATE PROCEDURE `deleteAccount_17` (
  IN `uidArg` BINARY(16)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  DELETE FROM sessionTokens WHERE uid = uidArg;
  DELETE FROM keyFetchTokens WHERE uid = uidArg;
  DELETE FROM accountResetTokens WHERE uid = uidArg;
  DELETE FROM passwordChangeTokens WHERE uid = uidArg;
  DELETE FROM passwordForgotTokens WHERE uid = uidArg;
  DELETE FROM accounts WHERE uid = uidArg;
  DELETE devices, deviceCommands FROM devices LEFT JOIN deviceCommands
    ON (deviceCommands.uid = devices.uid AND deviceCommands.deviceId = devices.id)
    WHERE devices.uid = uidArg;
  DELETE FROM unverifiedTokens WHERE uid = uidArg;
  DELETE FROM unblockCodes WHERE uid = uidArg;
  DELETE FROM emails WHERE uid = uidArg;
  DELETE FROM signinCodes WHERE uid = uidArg;
  DELETE FROM totp WHERE uid = uidArg;
  DELETE FROM recoveryKeys WHERE uid = uidArg;
  DELETE FROM recoveryCodes WHERE uid = uidArg;
  DELETE FROM securityEvents WHERE uid = uidArg;
  DELETE FROM accountSubscriptions WHERE uid = uidArg;

  COMMIT;
END;

UPDATE dbMetadata SET value = '98' WHERE name = 'schema-patch-level';
